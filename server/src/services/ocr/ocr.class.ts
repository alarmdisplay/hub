import * as cp from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import {SetupMethod} from '@feathersjs/feathers'
import {AlertContext, Application} from '../../declarations'
import {AlertSourceType} from '../incidents/incidents.service'
import {BlobResult} from 'feathers-blob'
import logger from '../../logger'
// @ts-ignore
import {parseDataURI} from 'dauria'

export class Ocr implements SetupMethod {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  setup (app: Application) {
    // Register to be notified of new uploads
    const uploadService = this.app.service('uploads');
    uploadService.on('created', (blobResult: BlobResult) => this.onUpload(blobResult))
  }

  private async onUpload(blobResult: BlobResult) {
    if (!blobResult.uri || !blobResult.id) {
      logger.warn('Upload does not have a unique ID or a DataURI')
      return
    }

    const data = parseDataURI(blobResult.uri)

    // We only process PDFs at the moment
    if (data.MIME !== 'application/pdf') {
      return
    }

    // Create a temporary working directory for this file
    let workDir: string
    try {
      let tmpdir = os.tmpdir();
      let [id] = blobResult.id.split('.', 1)
      workDir = path.join(tmpdir, id);
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

    // Write the blob to a file in the working directory
    const fileName = path.join(workDir, 'in.pdf')
    try {
      await fs.promises.writeFile(fileName, data.buffer)
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
