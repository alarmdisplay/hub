import {NullableId, Params} from "@feathersjs/feathers";
import {SequelizeServiceOptions, Service} from 'feathers-sequelize';
import {Application} from '../../declarations';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../../logger';

interface WatchedFolderData {
  id: number,
  path: string,
  active: boolean
}

const filePattern = /\.pdf$/i;

export class WatchedFolders extends Service<WatchedFolderData> {
  private app: Application
  private knownFiles: Map<Number, Set<String>>
  private paths: Map<Number, String>
  private watchers: Map<Number, fs.FSWatcher>

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    this.knownFiles = new Map<Number, Set<String>>()
    this.paths = new Map<Number, String>()
    this.watchers = new Map<Number, fs.FSWatcher>()
  }

  setup (app: Application) {
    // Start watching all watched folders marked as active
    this.find({ query: { active: true } })
      .then(folders => {
        if (!Array.isArray(folders)) {
          logger.error('Query for watched folders did not return an Array')
          return
        }

        Promise.all(folders.map(folder => this.startWatching(folder)))
          .catch(reason => {
            logger.error('Could not start to watch folders', reason)
          })
      }).catch(reason => {
        logger.error('Could not query folders to watch', reason)
      })

    // React to changes
  }

  /**
   * Normalize the path (e.g. remove ../ etc.) and make sure it ends with a path separator
   *
   * @param folderToWatch
   */
  private static getNormalizedPath(folderToWatch: WatchedFolderData) {
    let normalizedPath = path.normalize(folderToWatch.path);
    if (!normalizedPath.endsWith(path.sep)) {
      normalizedPath = path.join(normalizedPath, path.sep)
    }
    return normalizedPath;
  }

  /**
   * Start watching a folder for changes
   *
   * @param folderToWatch
   */
  private async startWatching(folderToWatch: WatchedFolderData) {
    let normalizedPath = WatchedFolders.getNormalizedPath(folderToWatch)

    let watcher
    try {
      watcher = fs.watch(normalizedPath);
    } catch (e) {
      logger.error('Not watching folder %s: %s', normalizedPath, e.message)
      return
    }

    // Remember the initial list of matching files in the directory
    let dirContent = await fs.promises.readdir(normalizedPath);
    let matchingFiles = dirContent.filter(filename => filePattern.test(filename));
    this.knownFiles.set(folderToWatch.id, new Set<String>(matchingFiles))

    watcher.addListener('change', this.changeListener(normalizedPath, folderToWatch.id))
    watcher.addListener('error', error => logger.error(error))
    watcher.addListener('close', () => {
      logger.warn('Watcher for folder %s closed', normalizedPath)
      this.knownFiles.delete(folderToWatch.id)
      this.paths.delete(folderToWatch.id)
      this.watchers.delete(folderToWatch.id)
    })
    this.paths.set(folderToWatch.id, normalizedPath)
    this.watchers.set(folderToWatch.id, watcher)
    logger.info('Started watching folder %s', normalizedPath)
  }

  /**
   * Stop watching a folder for changes
   *
   * @param folderToWatch
   */
  private async stopWatching(folderToWatch: WatchedFolderData) {
    let watchedPath = this.paths.get(folderToWatch.id) || '???'
    let watcher = this.watchers.get(folderToWatch.id)
    if (!watcher) {
      logger.warn('Could not find watcher for path %s', watchedPath)
      return
    }

    return new Promise(resolve => {
      // remove the close listener from above
      watcher?.removeAllListeners('close')
      watcher?.addListener('close', () => {
        logger.info('Stopped watching folder %s', watchedPath)
        this.knownFiles.delete(folderToWatch.id)
        this.paths.delete(folderToWatch.id)
        this.watchers.delete(folderToWatch.id)
        resolve()
      })
      watcher?.close()
    })
  }

  private changeListener (watchedPath: string, watcherId: Number) {
    return (eventType: string, filename: string) => {
      // We don't care about files that do not match the pattern
      if (!filePattern.test(filename)) {
        return
      }

      let filePath = path.join(watchedPath, filename);

      // Get more info about the file
      fs.promises.stat(filePath)
        .then(stats => {
          if (eventType === 'rename' && !this.knownFiles.get(watcherId)?.has(filename)) {
            this.knownFiles.get(watcherId)?.add(filename)

            if (stats.size === 0) {
              logger.warn('The file %s is empty, will not notify listeners')
              return
            }

            // Upload the new file to the blob store
            return fs.promises.readFile(filePath)
              .then(buffer => {
                const uploadsService = this.app.service('uploads')
                return uploadsService.create({ buffer: buffer, contentType: 'application/pdf' })
              })
              .then(() => logger.info('Forwarded file %s to uploads service', filePath))
          }
        }, err => {
          // If the file cannot be found, it just got deleted
          if (err.code === 'ENOENT') {
            this.knownFiles.get(watcherId)?.delete(filename)
          } else {
            logger.error(err)
          }
        })
        .catch(err => {
          logger.error(err)
        })
    }
  }

  _create(data: Partial<WatchedFolderData> | Array<Partial<WatchedFolderData>>, params?: Params): Promise<WatchedFolderData[] | WatchedFolderData> {
    return super._create(data, params)
      .then(async watchedFolderData => {
        if (Array.isArray(watchedFolderData)) {
          for (const folder of watchedFolderData) {
            if (folder.active) {
              await this.startWatching(folder)
            }
          }
        } else {
          if (watchedFolderData.active) {
            await this.startWatching(watchedFolderData)
          }
        }

        return watchedFolderData
      })
  }

  _update(id: NullableId, data: WatchedFolderData, params?: Params): Promise<WatchedFolderData> {
    return super._update(id, data, params)
      .then(data => this.onWatchedFolderUpdated(data))
  }

  _patch(id: NullableId, data: Partial<WatchedFolderData>, params?: Params): Promise<WatchedFolderData> {
    return super._patch(id, data, params)
      .then(data => this.onWatchedFolderUpdated(data))
  }

  _remove(id: NullableId, params?: Params): Promise<WatchedFolderData> {
    return super._remove(id, params)
      .then(async watchedFolderData => {
        // If the folder is currently watched, stop watching
        if (this.watchers.has(watchedFolderData.id)) {
          await this.stopWatching(watchedFolderData)
        }
        return watchedFolderData
      })
  }

  private async onWatchedFolderUpdated(watchedFolderData: WatchedFolderData) {
    // If the folder is currently watched, stop watching
    if (this.watchers.has(watchedFolderData.id)) {
      await this.stopWatching(watchedFolderData)
    }

    // If the folder is supposed to be watched, start watching (again)
    if (watchedFolderData.active) {
      await this.startWatching(watchedFolderData)
    }

    return watchedFolderData
  }
}

