import {Application, ResourceIdentifierData, ResourceData} from "./declarations";
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

    logger.debug('Text analysis completed')

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
    let resources = await ResourceService.find({ query: { id: { $in: Array.from(resourceIds.values()) } }, paginate: false }) as ResourceData[]
    logger.debug('Checked for known resources')

    const LocationsService = app.service('locations')
    let locationData = await LocationsService.createFromRawLocation(result.location)
    logger.debug('Processed location')

    let IncidentsService = app.service('incidents')
    let incident = await IncidentsService.processAlert({
      caller_name: result.caller.name,
      caller_number: result.caller.number,
      description: result.description,
      keyword: result.keyword,
      location: locationData,
      reason: result.reason,
      ref: result.ref,
      resources: resources,
      sender: result.sender
    })
    logger.debug(incident)
  })
}
