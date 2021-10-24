import * as cp from 'child_process';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Application, TextAnalysisConfig } from '../../declarations';
import logger from '../../logger';
import util from 'util';

const execAsync = util.promisify(cp.exec);

export class Ocr {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  public async getTextFromFile(filePath: string, textAnalysisConfig: TextAnalysisConfig): Promise<string> {
    // Create a temporary working directory for this file
    let workDir: string;
    const buffer = await fs.promises.readFile(filePath);
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    const digest = hash.digest('hex');
    try {
      const tmpdir = os.tmpdir();
      workDir = path.join(tmpdir, digest);
      await fs.promises.mkdir(workDir);
    } catch (e) {
      if (e.code === 'EEXIST') {
        logger.warn('Temporary working directory already exists, file has been processed before. Aborting.');
        return '';
      } else {
        throw new Error('Could not create temporary working directory: ' + e.message);
      }
    }

    // Copy the file into the working directory
    const fileName = path.join(workDir, 'in.pdf');
    try {
      await fs.promises.copyFile(filePath, fileName);
    } catch (e) {
      throw new Error('Could not write file in working directory: ' + e.message);
    }

    await this.generateUserWords(workDir, textAnalysisConfig);

    // Convert the PDF file into a TIF image
    await execAsync('convert -density 204x196 in.pdf -type Grayscale -compress lzw -background white in.tif', { cwd: workDir });

    logger.debug('PDF converted, starting OCR');
    let text = '';
    try {
      text = await this.doOcr(workDir);
    } catch (error) {
      logger.error('OCR error:', error.message);
    } finally {
      // In order to use a file multiple times during development, remove the working directory so it can be recreated
      if (this.app.get('devMode')) {
        await fs.promises.rm(workDir, { recursive: true, force: true });
      }
    }

    return this.fixCommonOcrErrors(text);
  }

  private async doOcr(workDir: string): Promise<string> {
    const result = await execAsync(
      'tesseract in.tif stdout --psm 6 -l deu --user-words words.txt',
      { cwd: workDir }
    );
    if (result.stderr) {
      logger.debug('tesseract stderr:', result.stderr);
    }
    return result.stdout;
  }

  /**
   * Places a text file – containing a list of words to assist the OCR process – into the working directory.
   *
   * @param workDir
   * @param textAnalysisConfig
   * @private
   */
  private async generateUserWords(workDir: string, textAnalysisConfig: TextAnalysisConfig) {
    let words: string[] = textAnalysisConfig.triggerWords || [];
    words = words.concat(textAnalysisConfig.importantWords || []);
    await fs.promises.writeFile(path.join(workDir, 'words.txt'), words.join('\n'));
  }

  /**
   * Fixes OCR errors that commonly happen and would throw off the text analysis
   * @param text
   * @private
   */
  private fixCommonOcrErrors(text: string): string {
    return text.replace('MITITEILER', 'MITTEILER')
      .replace('EINSATZMITITEL', 'EINSATZMITTEL')
      .replace('EINSATAGRUND', 'EINSATZGRUND')
      .replace('EINSATZAGRUND', 'EINSATZGRUND');
  }
}
