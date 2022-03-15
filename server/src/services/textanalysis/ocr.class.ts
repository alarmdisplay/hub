import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Application } from '../../declarations';
import logger from '../../logger';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';

const execAsync = util.promisify(cp.exec);

export class Ocr {
  app: Application;

  constructor (app: Application) {
    this.app = app;
  }

  /**
   *
   * @param filePath The path to the file that should be OCRed
   * @param userWords A list of words to assist the OCR process
   */
  public async getTextFromFile(filePath: string, userWords: string[]): Promise<string> {
    let workDir: string;

    // Copy the file into a working directory
    const ocrFile = 'in' + path.extname(filePath);
    try {
      workDir = await Ocr.createWorkingDirectory();
      const fileName = path.join(workDir, ocrFile);
      await fs.promises.copyFile(filePath, fileName);
    } catch (error: any) {
      throw new Error('Could not copy file to working directory: ' + error.message);
    }

    let text = '';
    try {
      const imagesToOcr = await this.prepareFileForOcr(workDir, ocrFile);
      logger.debug('Starting OCR ...');
      text = await this.doOcr(workDir, imagesToOcr, userWords);
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

  private async doOcr(workDir: string, fileNames: string[], userWords: string[]): Promise<string> {
    for (const fileName of fileNames) {
      if (!Ocr.isFileWithinDirectory(fileName, workDir)) {
        throw new Error(`Given file (${fileName}) is not within working directory`);
      }
    }

    // Place file with file paths into the working directory
    await fs.promises.writeFile(path.join(workDir, 'files.txt'), fileNames.join('\n'));

    let command = 'tesseract files.txt stdout --psm 6 -l deu';

    // Place file with user words into the working directory
    try {
      await fs.promises.writeFile(path.join(workDir, 'words.txt'), userWords.join('\n'));
      command += ' --user-words words.txt';
    } catch (e) {
      logger.warn('Could not write user words, continue OCR without them...', e);
    }

    logger.debug('Running command:', command);
    const result = await execAsync(
      command,
      { cwd: workDir }
    );
    if (result.stderr) {
      logger.debug('tesseract stderr:', result.stderr);
    }
    return result.stdout;
  }

  /**
   * Can be used for security checks, to prevent passing random files to commands
   *
   * @param fileName
   * @param directory
   * @private
   */
  private static isFileWithinDirectory(fileName: string, directory: string): boolean {
    const resolved = path.resolve(directory, fileName);
    return path.dirname(resolved) === directory;
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

  /**
   * Makes sure, the input file is in a format that can be processed by tesseract.
   *
   * @param workDir
   * @param fileName
   * @private
   */
  private async prepareFileForOcr(workDir: string, fileName: string): Promise<string[]> {
    if (!Ocr.isFileWithinDirectory(fileName, workDir)) {
      throw new Error(`Given file (${fileName}) is not within working directory`);
    }

    // No action necessary, if the input file is an image
    const extname = path.extname(fileName).toLowerCase();
    if (['.tif', '.tiff', '.jpg', '.jpeg', '.png', '.bmp', '.gif'].includes(extname)) {
      return [fileName];
    }

    if (extname !== '.pdf') {
      throw new Error(`Cannot prepare file type ${extname} for OCR`);
    }

    // Try to extract images from a PDF file as TIFF
    try {
      await execAsync(
        `pdfimages -tiff -p "${fileName}" extracted`,
        {cwd: workDir}
      );

      // Find and return extracted images
      const dirContent = await fs.promises.readdir(workDir);
      const filePattern = /^extracted-\d+-\d+\.tif$/i;
      return dirContent.filter(filename => filePattern.test(filename));
    } catch (e) {
      const message = (e instanceof Error) ? e.message : e;
      logger.warn('Images could not be extracted from PDF (%s), try to convert it as a whole:', message);
    }

    // Convert the PDF file into a TIF image
    await execAsync(
      `convert -density 204x196 "${fileName}" -type Grayscale -compress lzw -background white in.tif`,
      {cwd: workDir}
    );

    return ['in.tif'];
  }
}
