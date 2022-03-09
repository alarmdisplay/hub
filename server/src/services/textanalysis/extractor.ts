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
      result.content = await Extractor.getEmbeddedTextFromPDF(filePath);
    } catch (error: any) {
      logger.debug('Could not extract embedded text from file:', error.message);
    }

    if (!result.content) {
      logger.debug('No embedded text found, continue with OCR...');
      result.method = 'ocr';
      result.content = await this.ocr.getTextFromFile(filePath, textAnalysisConfig);
    }

    return result;
  }

  /**
   * Try to extract embedded text from PDFs.
   *
   * @param filePath
   * @private
   */
  private static async getEmbeddedTextFromPDF(filePath: string): Promise<string> {
    const exec = util.promisify(cp.exec);

    // Check if pdftotext is installed, will throw on error
    await exec('pdftotext -v');

    // Try to extract the text while preserving the layout
    const { stdout } = await exec(`pdftotext -layout "${filePath}" -`);

    return (stdout || '').trim();
  }
}
