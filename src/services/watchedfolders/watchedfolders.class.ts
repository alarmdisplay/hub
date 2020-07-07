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

        Promise.all(folders.map(startWatching))
          .catch(reason => {
            logger.error('Could not start to watch folders', reason)
          })
      }).catch(reason => {
        logger.error('Could not query folders to watch', reason)
      })
  }
}

async function startWatching(folderToWatch: WatchedFolderData) {
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

  watcher.addListener('change', changeListener(normalizedPath))
  watcher.addListener('error', error => logger.error(error))
  watcher.addListener('close', () => {
    logger.debug('watcher closed')
  })
  logger.info('Started watching folder %s', normalizedPath)
}

function changeListener (watchedPath: string) {
  return (eventType: string, filename: string) => {
    logger.debug('%s: %s %s', watchedPath, eventType, filename)

    let filePath = path.join(watchedPath, filename);
    let parsedPath = path.parse(filePath)
    // Only check for files with the PDF extension
    if (parsedPath.ext !== '.pdf') {
      return
    }

    // Get more info about the file
    fs.stat(filePath, (err, stats) => {
      if (err) {
        // If the file cannot be found, it just got deleted
        if (err.code === 'ENOENT') {
          logger.debug(`File ${filePath} deleted`)
        } else {
          logger.error(err)
        }
        return
      }

      logger.debug('size: %d, changed: %s, modified: %s', stats.size, stats.ctime, stats.mtime)
    })
  }
}
