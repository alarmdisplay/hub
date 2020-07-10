import {Application} from "./declarations";
import logger from "./logger";

export default function (app: Application) {
  let textAnalysisService = app.service('textanalysis');
  // Register for results from the OCR service
  app.service('ocr').on('ocr_result', text => {
    let result
    try {
      result = textAnalysisService.analyse(text)
    } catch (e) {
      logger.error('Text analysis aborted:', e)
      return
    }

    logger.debug('Text analysis completed', result)
  })
}
