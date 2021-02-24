import * as cp from 'child_process'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import {SetupMethod} from '@feathersjs/feathers'
import {AlertContext, Application, FoundFileContext} from '../../declarations'
import {AlertSourceType} from '../incidents/incidents.service'
import logger from '../../logger'

export class Ocr implements SetupMethod {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  setup (app: Application) {
    // Register to be notified of new files
    const watchedFoldersService = this.app.service('watchedfolders');
    watchedFoldersService.on('found_file', (context: FoundFileContext) => this.onNewFile(context.path))
  }

  private async onNewFile(filePath: string) {
    // Create a temporary working directory for this file
    let workDir: string
    const buffer = await fs.promises.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    let digest = hash.digest('hex');
    try {
      let tmpdir = os.tmpdir();
      workDir = path.join(tmpdir, digest);
      await fs.promises.mkdir(workDir)
    } catch (e) {
      if (e.code === 'EEXIST') {
        logger.warn('Temporary working directory already exists, file has been processed before. Aborting.')
      } else {
        logger.error('Could not create temporary working directory', e)
      }
      return
    }

    // Prepare the context to handle this alert
    let alertContext = {
      processingStarted: new Date(),
      rawContent: '',
      source: {
        type: AlertSourceType.OCR
      }
    }

    // Copy the file into the working directory
    const fileName = path.join(workDir, 'in.pdf')
    try {
      await fs.promises.copyFile(filePath, fileName)
    } catch (e) {
      logger.error('Could not write file in working directory', e)
      return
    }

    // Convert the PDF file into a TIF image
    cp.exec('convert -density 204x196 in.pdf -monochrome in.tif', { cwd: workDir }, async error => {
      if (error) {
        logger.error(error)
        return
      }

      logger.debug('PDF converted, starting OCR')
      try {
        this.doOcr(workDir, alertContext)
      } catch (error) {
        logger.error('OCR error:', error)
      } finally {
        // In order to use a file multiple times during development, remove the working directory so it can be recreated
        if (this.app.get('devMode')) {
          await fs.promises.rm(workDir, { recursive: true, force: true })
        }
      }
    })
  }

  private doOcr(workDir: string, context: AlertContext) {
    let buffer = cp.execSync(
      'tesseract in.tif stdout --psm 6 -l deu',
      { cwd: workDir, stdio: [undefined, undefined, this.app.get('devMode') ? 2 : 'ignore'] }
    );
    context.rawContent = buffer.toString();

    // @ts-ignore TypeScript does not know that this is an EventEmitter
    this.emit('ocr_result', context)
  }
}
