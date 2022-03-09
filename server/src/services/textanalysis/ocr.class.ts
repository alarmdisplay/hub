import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Application, TextAnalysisConfig } from '../../declarations';
import logger from '../../logger';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = util.promisify(cp.exec);

export class Ocr {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  public async getTextFromFile(filePath: string, textAnalysisConfig: TextAnalysisConfig): Promise<string> {
    let workDir: string;

    // Copy the file into a working directory
    try {
      workDir = await Ocr.createWorkingDirectory();
      const fileName = path.join(workDir, 'in.pdf');
      await fs.promises.copyFile(filePath, fileName);
    } catch (error: any) {
      throw new Error('Could not copy file to working directory: ' + error.message);
    }

    await this.generateUserWords(workDir, textAnalysisConfig);

    // Convert the PDF file into a TIF image
    await execAsync('convert -density 204x196 in.pdf -type Grayscale -compress lzw -background white in.tif', { cwd: workDir });

    logger.debug('PDF converted, starting OCR');
    let text = '';
    try {
      text = await this.doOcr(workDir);
    } catch (error: any) {
      logger.error('OCR error:', error.message);
    } finally {
      // Remove the temporary folder again, except during development
      if (!this.app.get('devMode')) {
        await fs.promises.rm(workDir, { recursive: true, force: true });
      }
    }

    return this.fixCommonOcrErrors(text);
  }

  /**
   * Create a temporary working directory for a file
   *
   * @private
   */
  private static async createWorkingDirectory(): Promise<string> {
    const tmpdir = os.tmpdir();
    const name = 'ocr_' + uuidv4();
    const workDir = path.join(tmpdir, name);

    logger.debug('Creating working directory', workDir);
    await fs.promises.mkdir(workDir);

    return workDir;
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
