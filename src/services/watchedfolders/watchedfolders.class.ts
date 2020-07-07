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
const knownFiles = new Map<Number, Set<String>>()

export class WatchedFolders extends Service<WatchedFolderData> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
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
  }

  private async startWatching(folderToWatch: WatchedFolderData) {
    // Normalize the given path
    let normalizedPath = path.normalize(folderToWatch.path);
    if (!normalizedPath.endsWith(path.sep)) {
      normalizedPath = path.join(normalizedPath, path.sep)
    }

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
    knownFiles.set(folderToWatch.id, new Set<String>(matchingFiles))

    watcher.addListener('change', this.changeListener(normalizedPath, folderToWatch.id))
    watcher.addListener('error', error => logger.error(error))
    watcher.addListener('close', () => {
      logger.debug('watcher closed')
      knownFiles.delete(folderToWatch.id)
    })
    logger.info('Started watching folder %s', normalizedPath)
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
          if (eventType === 'rename' && !knownFiles.get(watcherId)?.has(filename)) {
            knownFiles.get(watcherId)?.add(filename)

            if (stats.size === 0) {
              logger.warn('The file %s is empty, will not notify listeners')
              return
            }

            // @ts-ignore TypeScript claims .emit() would not exist here
            this.emit('file_added', filePath)
          }
        })
        .catch(err => {
          // If the file cannot be found, it just got deleted
          if (err.code === 'ENOENT') {
            knownFiles.get(watcherId)?.delete(filename)
          } else {
            logger.error(err)
          }
        })
    }
  }
}

