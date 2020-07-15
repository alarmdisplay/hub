import {Application, ResourceIdentifierData} from "./declarations";
import logger from "./logger";

export default function (app: Application) {
  let textAnalysisService = app.service('textanalysis');
  // Register for results from the OCR service
  app.service('ocr').on('ocr_result', async text => {
    let result
    try {
      result = textAnalysisService.analyse(text)
    } catch (e) {
      logger.error('Text analysis aborted:', e)
      return
    }

    logger.debug('Text analysis completed', result)

    // Determine the requested resources
    const resourceIds = new Set();
    const ResourceIdentifierService = app.service('resource-identifiers');
    for (const name of result.resources) {
      const identifiers = await ResourceIdentifierService.find({ query: { type: 'name', value: name, $limit: 1 }, paginate: false }) as ResourceIdentifierData[]
      if (identifiers.length === 0) {
        logger.warn('Unknown resource: %s', name)
        continue;
      }

      resourceIds.add(identifiers[0].resourceId)
    }

    let ResourceService = app.service('resources')
    let resources = await ResourceService.find({ query: { id: { $in: Array.from(resourceIds.values()) } }, paginate: false });
    logger.debug(resources)
  })
}
