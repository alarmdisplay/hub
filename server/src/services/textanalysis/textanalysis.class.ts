import { Application, AlarmContext, FoundFileContext, ResourceData, ResourceIdentifierData, TextAnalysisData } from '../../declarations'
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
    const serialMonitorsService = app.service('serial-monitors');
    serialMonitorsService.on('pager_alarm', (context: AlarmContext) => this.onNewSerialAlarm(context.pager_id, context.alarmText, context.port))
  }

  private async onNewSerialAlarm(pagerID: number, alarmText: string, port: string){
    const textAnalysisJobs = await this.find({
      query: {
        event: 'pager_alarm',
        sourceID: pagerID,
        $limit: 1,
        $select: [ 'id', 'event', 'sourceID', 'config' ]
      },
      paginate: false
    }) as TextAnalysisData[];
    if (textAnalysisJobs.length === 0) {
      //logger.warn('Did not find a textanalysis job for watched folder %d, aborting ...', watchedFolderId)
      return
    }
    let configName = textAnalysisJobs[0].config;
    let configIndex = Object.keys(configs).indexOf(configName);
    if (configIndex === -1) {
      logger.error('Found textanalysis job, but there is no config by the name \'%s\'', configName)
      return
    }
    const textAnalysisConfig = Object.values(configs)[configIndex];

    let alertContext = {
      processingStarted: new Date(),
      rawContent: '',
      source: {
        type: AlertSourceType.PAGER
      }
    }

    alertContext.rawContent = alarmText

    let result
    try {
      result = this.analyser.analyse(alertContext.rawContent, textAnalysisConfig)
    } catch (e) {
      logger.error('Text analysis aborted:', e)
      return
    }

    logger.debug('Text analysis completed')

    // Determine the requested resources
    this.analyzeAlarmResults(result, alertContext)
  }

  private async onNewFile(filePath: string, watchedFolderId: number) {
    const textAnalysisJobs = await this.find({
      query: {
        event: 'found_file',
        sourceId: watchedFolderId,
        $limit: 1,
        $select: [ 'id', 'event', 'sourceID', 'config' ]
      },
      paginate: false
    }) as TextAnalysisData[];
    if (textAnalysisJobs.length === 0) {
      logger.warn('Did not find a textanalysis job for watched folder %d, aborting ...', watchedFolderId)
      return
    }
    let configName = textAnalysisJobs[0].config;
    let configIndex = Object.keys(configs).indexOf(configName);
    if (configIndex === -1) {
      logger.error('Found textanalysis job, but there is no config by the name \'%s\'', configName)
      return
    }
    const textAnalysisConfig = Object.values(configs)[configIndex];

    // Prepare the context to handle this alert
    let alertContext = {
      processingStarted: new Date(),
      rawContent: '',
      source: {
        type: AlertSourceType.OCR
      }
    }

    alertContext.rawContent = await this.ocr.getTextFromFile(filePath, textAnalysisConfig);

    let result
    try {
      result = this.analyser.analyse(alertContext.rawContent, textAnalysisConfig)
    } catch (e) {
      logger.error('Text analysis aborted:', e)
      return
    }

    logger.debug('Text analysis completed')

    // Determine the requested resources
    this.analyzeAlarmResults(result, alertContext)
  }

  private async analyzeAlarmResults(result: any, alertContext: any ){
    const resourceIds = new Set();
    const ResourceIdentifierService = this.app.service('resource-identifiers');
    for (const name of result.resources) {
      const identifiers = await ResourceIdentifierService.find({ query: { type: 'name', value: name, $limit: 1 }, paginate: false }) as ResourceIdentifierData[]
      if (identifiers.length === 0) {
        continue;
      }

      resourceIds.add(identifiers[0].resourceId)
    }

    let ResourceService = this.app.service('resources')
    let resources = await ResourceService.find({ query: { id: { $in: Array.from(resourceIds.values()) } }, paginate: false }) as ResourceData[]
    logger.debug('Checked for known resources, found %d', resources.length)

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
