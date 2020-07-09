import {Application} from "./declarations";

export default function (app: Application) {
  let textAnalysisService = app.service('textanalysis');
  // Register for results from the OCR service
  app.service('ocr').on('ocr_result', text => textAnalysisService.analyse(text))
}
