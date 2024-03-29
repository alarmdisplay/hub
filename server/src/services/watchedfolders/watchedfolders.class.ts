import { NullableId, Params } from '@feathersjs/feathers';
import { SequelizeServiceOptions, Service } from 'feathers-sequelize';
import { Application, FoundFileContext, ProcessedFilesData } from '../../declarations';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../../logger';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

interface WatchedFolderData {
  id: number,
  path: string,
  active: boolean,
  polling: boolean
}

// Pattern to match files with the pdf extension, that begin with a letter or number
const filePattern = /^[a-z0-9].*\.(pdf|tiff?|jpe?g|png|bmp)$/i;

export class WatchedFolders extends Service<WatchedFolderData> {
  private app: Application;
  private intervals: Map<number, NodeJS.Timeout>;
  private knownFiles: Map<number, Set<string>>;
  private paths: Map<number, string>;
  private watchers: Map<number, fs.FSWatcher>;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.intervals = new Map<number, NodeJS.Timeout>();
    this.knownFiles = new Map<number, Set<string>>();
    this.paths = new Map<number, string>();
    this.watchers = new Map<number, fs.FSWatcher>();
  }

  setup (app: Application) {
    // Wait for the database, then start watching all watched folders marked as active
    (app.get('databaseReady') as Promise<void>)
      .then(() => this.find({ query: { active: true }, paginate: false }))
      .then(folders => {
        if (!Array.isArray(folders)) {
          logger.error('Query for watched folders did not return an Array');
          return [];
        }

        return folders;
      }, reason => {
        logger.error('Could not query folders to watch', reason);
        return [];
      })
      .then(folders => this.bulkStartWatching(folders))
      .catch(reason => {
        logger.error('Could not start to watch folders:', reason.message);
      });
  }

  /**
   * Normalize the path (e.g. remove ../ etc.) and make sure it ends with a path separator
   *
   * @param folderToWatch
   */
  private static getNormalizedPath(folderToWatch: WatchedFolderData) {
    let normalizedPath = path.normalize(folderToWatch.path);
    if (!normalizedPath.endsWith(path.sep)) {
      normalizedPath = path.join(normalizedPath, path.sep);
    }
    return normalizedPath;
  }

  private async bulkStartWatching(foldersToWatch: WatchedFolderData[]) {
    for (const folderToWatch of foldersToWatch) {
      try {
        await this.startWatching(folderToWatch);
      } catch (error: any) {
        const normalizedPath = WatchedFolders.getNormalizedPath(folderToWatch);
        logger.error('Could not start to watch folder %s:', normalizedPath, error.message);
      }
    }
  }

  /**
   * Start watching a folder for changes
   *
   * @param folderToWatch
   */
  private async startWatching(folderToWatch: WatchedFolderData) {
    const normalizedPath = WatchedFolders.getNormalizedPath(folderToWatch);

    // Remember the initial list of matching files in the directory
    const matchingFiles = await this.getMatchingFilesFromFolder(normalizedPath);
    this.knownFiles.set(folderToWatch.id, new Set<string>(matchingFiles));

    if (folderToWatch.polling) {
      // Make sure there is no old interval still running
      if (this.intervals.has(folderToWatch.id)) {
        clearInterval(<NodeJS.Timeout>this.intervals.get(folderToWatch.id));
      }

      const interval = setInterval(async () => {
        // Compare the known file list to the current folder contents
        let files: string[];
        try {
          files = await this.getMatchingFilesFromFolder(normalizedPath);
        } catch (error: any) {
          logger.error('Could not read files from watched folder:', error.message);
          return;
        }

        const knownFilesSet = this.knownFiles.get(folderToWatch.id);
        const knownFileNames = Array.from(knownFilesSet?.values() || []);
        const newFiles = files.filter(filename => !knownFileNames.includes(filename));
        const removedFiles = knownFileNames.filter(filename => !files.includes(filename));

        // Forget removed files
        for (const filename of removedFiles) {
          knownFilesSet?.delete(filename);
        }

        // Check every new file and forward it
        for (const filename of newFiles) {
          const filePath = path.join(normalizedPath, filename);

          // Get more info about the file
          const stat = await fs.promises.stat(filePath);
          if (stat.size === 0) {
            // Ignore the file if it has 0 bytes, this usually means that it is still being written
            continue;
          }

          // Remember this file
          knownFilesSet?.add(filename);

          await this.getFileAndNotifyListeners(filePath, folderToWatch.id);
        }
      }, 3000);
      this.intervals.set(folderToWatch.id, interval);
    } else {
      let watcher;
      try {
        watcher = fs.watch(normalizedPath);
      } catch (error: any) {
        logger.error('Not watching folder %s: %s', normalizedPath, error.message);
        return;
      }

      watcher.addListener('change', this.changeListener(normalizedPath, folderToWatch.id));
      watcher.addListener('error', error => logger.error(error));
      watcher.addListener('close', () => {
        logger.warn('Watcher for folder %s closed', normalizedPath);
        this.knownFiles.delete(folderToWatch.id);
        this.paths.delete(folderToWatch.id);
        this.watchers.delete(folderToWatch.id);
      });
      this.watchers.set(folderToWatch.id, watcher);
    }

    this.paths.set(folderToWatch.id, normalizedPath);
    logger.info('Started watching folder %s', normalizedPath);
  }

  private async getMatchingFilesFromFolder(normalizedPath: string) {
    const dirContent = await fs.promises.readdir(normalizedPath);
    return dirContent.filter(filename => filePattern.test(filename));
  }

  /**
   * Stop watching a folder for changes
   *
   * @param folderToWatch
   */
  private async stopWatching(folderToWatch: WatchedFolderData) {
    const watchedPath = this.paths.get(folderToWatch.id) || '???';

    if (this.intervals.has(folderToWatch.id)) {
      const interval = this.intervals.get(folderToWatch.id);
      if (!interval) {
        logger.warn('Did not find interval to stop polling folder %s', watchedPath);
        return;
      }
      clearInterval(interval);
      logger.info('Stopped polling folder %s', watchedPath);
    } else {
      const watcher = this.watchers.get(folderToWatch.id);
      if (!watcher) {
        logger.warn('Could not find watcher for path %s', watchedPath);
        return;
      }

      return new Promise<void>(resolve => {
        // remove the close listener from above
        watcher?.removeAllListeners('close');
        watcher?.addListener('close', () => {
          logger.info('Stopped watching folder %s', watchedPath);
          this.knownFiles.delete(folderToWatch.id);
          this.paths.delete(folderToWatch.id);
          this.watchers.delete(folderToWatch.id);
          resolve();
        });
        watcher?.close();
      });
    }
  }

  private changeListener (watchedPath: string, watcherId: number) {
    return (eventType: string, filename: string) => {
      // We don't care about files that do not match the pattern
      if (!filePattern.test(filename)) {
        return;
      }

      const filePath = path.join(watchedPath, filename);

      // Get more info about the file
      fs.promises.stat(filePath)
        .then(stats => {
          if (eventType === 'rename' && !this.knownFiles.get(watcherId)?.has(filename)) {
            this.knownFiles.get(watcherId)?.add(filename);

            if (stats.size === 0) {
              logger.warn('The file %s is empty, will not notify listeners', filename);
              return;
            }

            return this.getFileAndNotifyListeners(filePath, watcherId);
          }
        }, err => {
          // If the file cannot be found, it just got deleted
          if (err.code === 'ENOENT') {
            this.knownFiles.get(watcherId)?.delete(filename);
          } else {
            logger.error(err);
          }
        })
        .catch(err => {
          logger.error(err);
        });
    };
  }

  _create(data: Partial<WatchedFolderData> | Array<Partial<WatchedFolderData>>, params?: Params): Promise<WatchedFolderData[] | WatchedFolderData> {
    return super._create(data, params)
      .then(async watchedFolderData => {
        if (Array.isArray(watchedFolderData)) {
          await this.bulkStartWatching(watchedFolderData.filter(folder => folder.active));
        } else {
          if (watchedFolderData.active) {
            await this.startWatching(watchedFolderData);
          }
        }

        return watchedFolderData;
      });
  }

  _update(id: NullableId, data: WatchedFolderData, params?: Params): Promise<WatchedFolderData> {
    return super._update(id, data, params)
      .then(data => this.onWatchedFolderUpdated(data));
  }

  _patch(id: NullableId, data: Partial<WatchedFolderData>, params?: Params): Promise<WatchedFolderData> {
    return super._patch(id, data, params)
      .then(data => this.onWatchedFolderUpdated(data));
  }

  _remove(id: NullableId, params?: Params): Promise<WatchedFolderData> {
    return super._remove(id, params)
      .then(async watchedFolderData => {
        // If the folder is currently watched, stop watching
        if (this.watchers.has(watchedFolderData.id) || this.intervals.has(watchedFolderData.id)) {
          await this.stopWatching(watchedFolderData);
        }
        return watchedFolderData;
      });
  }

  private async onWatchedFolderUpdated(watchedFolderData: WatchedFolderData) {
    // If the folder is currently watched, stop watching
    if (this.watchers.has(watchedFolderData.id) || this.intervals.has(watchedFolderData.id)) {
      await this.stopWatching(watchedFolderData);
    }

    // If the folder is supposed to be watched, start watching (again)
    if (watchedFolderData.active) {
      await this.startWatching(watchedFolderData);
    }

    return watchedFolderData;
  }

  private async getFileAndNotifyListeners(filePath: string, watcherId: number) {
    logger.info('Found new file in watched folder %d', watcherId);

    // Copy the file to a temporary location, so we don't have to rely on the original file
    const tmpdir = os.tmpdir();
    const extname = path.extname(filePath);
    const fileName = uuidv4() + extname.toLowerCase();
    const destination = path.join(tmpdir, fileName);
    await fs.promises.copyFile(filePath, destination);

    // Ignore file, if it has been processed before (and the user has not disabled the setting)
    const ignoreProcessedFiles = await this.app.service('settings').getBooleanValue('ignore_processed_files');
    if (ignoreProcessedFiles) {
      const hash = await WatchedFolders.getHash(filePath);
      const processedFiles = await this.app.service('processed-files').find({ query: { hash }, paginate: false }) as ProcessedFilesData[];
      if (processedFiles.length) {
        logger.warn('Ignoring file %s, it has been processed before', path.basename(filePath));
        return;
      }
      await this.app.service('processed-files').create({ hash });
    }

    const context: FoundFileContext = { watchedFolderId: watcherId, path: destination };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('found_file', context);
  }

  /**
   * Calculates the hash of a given file.
   *
   * @param filePath
   * @private
   */
  private static async getHash(filePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
  }
}
