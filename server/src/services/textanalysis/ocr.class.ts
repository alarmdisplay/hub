import * as cp from 'child_process'
import * as crypto from 'crypto'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { Application } from '../../declarations'
import logger from '../../logger'

export class Ocr {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  public async getTextFromFile(filePath: string): Promise<string> {
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
        return ''
      } else {
        throw new Error('Could not create temporary working directory: ' + e.message)
      }
    }

    // Copy the file into the working directory
    const fileName = path.join(workDir, 'in.pdf')
    try {
      await fs.promises.copyFile(filePath, fileName)
    } catch (e) {
      throw new Error('Could not write file in working directory: ' + e.message)
    }

    // Convert the PDF file into a TIF image
    cp.execSync('convert -density 204x196 in.pdf -monochrome in.tif', { cwd: workDir })

    logger.debug('PDF converted, starting OCR')
    let text: string = ''
    try {
      text = this.doOcr(workDir);
    } catch (error) {
      logger.error('OCR error:', error)
    } finally {
      // In order to use a file multiple times during development, remove the working directory so it can be recreated
      if (this.app.get('devMode')) {
        await fs.promises.rm(workDir, { recursive: true, force: true })
      }
    }

    return text
  }

  private doOcr(workDir: string): string {
    let buffer = cp.execSync(
      'tesseract in.tif stdout --psm 6 -l deu',
      { cwd: workDir, stdio: [undefined, undefined, this.app.get('devMode') ? 2 : 'ignore'] }
    );
    return buffer.toString();
  }
}
