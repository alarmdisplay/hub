import { Application, FoundFileContext, ResourceData, ResourceIdentifierData, TextAnalysisData } from '../../declarations'
import logger from '../../logger'
import { Ocr } from "./ocr.class";
import configs from "./configs";
import { AlertSourceType } from "../incidents/incidents.service";
import { Analyser } from "./analyser.class";
import { SequelizeServiceOptions, Service } from "feathers-sequelize";

export class TextAnalysis extends Service<TextAnalysisData> {
  app: Application
  analyser: Analyser
  ocr: Ocr

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    this.analyser = new Analyser()
    this.ocr = new Ocr(app)
  }

  setup(app: Application): void {
    // Register to be notified of new files
    const watchedFoldersService = app.service('watchedfolders');
    watchedFoldersService.on('found_file', (context: FoundFileContext) => this.onNewFile(context.path, context.watchedFolderId))
  }

  private async onNewFile(filePath: string, watchedFolderId: number) {
    // Prepare the context to handle this alert
    let alertContext = {
      processingStarted: new Date(),
      rawContent: '',
      source: {
        type: AlertSourceType.OCR
      }
    }

    alertContext.rawContent = await this.ocr.getTextFromFile(filePath);
    let result
    try {
      result = this.analyser.analyse(alertContext.rawContent, configs['ils_augsburg'])
    } catch (e) {
      logger.error('Text analysis aborted:', e)
      return
    }

    logger.debug('Text analysis completed')

    // Determine the requested resources
    const resourceIds = new Set();
    const ResourceIdentifierService = this.app.service('resource-identifiers');
    for (const name of result.resources) {
      const identifiers = await ResourceIdentifierService.find({ query: { type: 'name', value: name, $limit: 1 }, paginate: false }) as ResourceIdentifierData[]
      if (identifiers.length === 0) {
        logger.warn('Unknown resource: %s', name)
        continue;
      }

      resourceIds.add(identifiers[0].resourceId)
    }

    let ResourceService = this.app.service('resources')
    let resources = await ResourceService.find({ query: { id: { $in: Array.from(resourceIds.values()) } }, paginate: false }) as ResourceData[]
    logger.debug('Checked for known resources')

    let IncidentsService = this.app.service('incidents')
    let incident = await IncidentsService.processAlert({
      caller_name: result.caller.name,
      caller_number: result.caller.number,
      description: result.description,
      keyword: result.keyword,
      location: result.location,
      reason: result.reason,
      ref: result.ref,
      resources: resources,
      sender: result.sender
    }, alertContext)
    logger.debug(incident)
  }
}
