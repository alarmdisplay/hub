import { Application, TextAnalysisConfig, TextExtractionResult } from '../../declarations';
import logger from '../../logger';
import util from 'util';
import cp from 'child_process';
import { Ocr } from './ocr.class';

export class Extractor {
  private app: Application;
  private ocr: Ocr;

  constructor (app: Application) {
    this.app = app;
    this.ocr = new Ocr(app);
  }

  public async getTextFromFile(filePath: string, textAnalysisConfig: TextAnalysisConfig): Promise<TextExtractionResult> {
    // Initialize the return value
    const result: TextExtractionResult = {
      method: 'plain',
      content: ''
    };

    try {
      result.content = await Extractor.getEmbeddedText(filePath);
    } catch (error: any) {
      logger.debug('Could not extract embedded text from file:', error.message);
    }

    // If text got extracted, return it right away
    if (result.content && result.content !== '') {
      return result;
    }

    logger.debug('No embedded text found, continue with OCR...');
    result.method = 'ocr';
    const userWords = new Array<string>().concat(
      textAnalysisConfig.triggerWords || [],
      textAnalysisConfig.importantWords || []
    );
    result.content = await this.ocr.getTextFromFile(filePath, userWords);

    return result;
  }

  /**
   * Determines if the file is a PDF.
   * Currently, only the file name is taken into account
   *
   * @param filePath
   * @private
   */
  private static isFileOfTypePDF(filePath: string): boolean {
    return /\.pdf$/i.test(filePath);
  }

  /**
   * Try to extract embedded text from a file.
   *
   * @param filePath
   * @private
   */
  private static async getEmbeddedText(filePath: string): Promise<string> {
    if (Extractor.isFileOfTypePDF(filePath)) {
      const exec = util.promisify(cp.exec);

      // Check if pdftotext is installed, will throw on error
      await exec('pdftotext -v');

      // Try to extract the text while preserving the layout
      const { stdout } = await exec(`pdftotext -layout "${filePath}" -`);

      return (stdout || '').trim();
    }

    // Return nothing for unknown file types
    return '';
  }
}
