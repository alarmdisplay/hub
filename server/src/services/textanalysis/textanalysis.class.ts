import {
  AlertContext,
  Application,
  FoundFileContext,
  ResourceData,
  ResourceIdentifierData,
  SerialDataContext,
  TextAnalysisData,
  TextAnalysisResult
} from '../../declarations';
import logger from '../../logger';
import configs from './configs';
import { AlertSourceType } from '../incidents/incidents.service';
import { Analyser } from './analyser.class';
import { SequelizeServiceOptions, Service } from 'feathers-sequelize';
import { Extractor } from './extractor';

export class TextAnalysis extends Service<TextAnalysisData> {
  app: Application;
  analyser: Analyser;
  private extractor: Extractor;

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
    this.analyser = new Analyser();
    this.extractor = new Extractor(app);
  }

  setup(app: Application): void {
    // Register to be notified of new files
    const watchedFoldersService = app.service('watchedfolders');
    watchedFoldersService.on('found_file', (context: FoundFileContext) => this.onNewFile(context.path, context.watchedFolderId));
    const serialMonitorsService = app.service('serial-monitors');
    serialMonitorsService.on('serial_data', (context: SerialDataContext) => this.onSerialData(context.serialMonitorId, context.data));
  }

  private async onSerialData(serialMonitorId: number, data: Buffer){
    const textAnalysisJobs = await this.find({
      query: {
        event: 'serial_data',
        sourceID: serialMonitorId,
        $limit: 1,
      },
      paginate: false
    }) as TextAnalysisData[];
    if (textAnalysisJobs.length === 0) {
      logger.warn('Did not find a textanalysis job for serial monitor %d, aborting ...', serialMonitorId);
      return;
    }

    const configName = textAnalysisJobs[0].config;
    const configIndex = Object.keys(configs).indexOf(configName);
    if (configIndex === -1) {
      logger.error('Found textanalysis job, but there is no config by the name \'%s\'', configName);
      return;
    }
    const textAnalysisConfig = Object.values(configs)[configIndex];

    const alertContext = {
      processingStarted: new Date(),
      rawContent: data.toString(),
      source: {
        type: AlertSourceType.PLAIN
      }
    };

    let result;
    try {
      result = this.analyser.analyse(alertContext.rawContent, textAnalysisConfig);
    } catch (e) {
      logger.error('Text analysis aborted:', e);
      return;
    }

    logger.debug('Text analysis completed');

    // Determine the requested resources
    await this.analyzeAlarmResults(result, alertContext);
  }

  private async onNewFile(filePath: string, watchedFolderId: number) {
    const textAnalysisJobs = await this.find({
      query: {
        event: 'found_file',
        sourceId: watchedFolderId,
        $limit: 1,
      },
      paginate: false
    }) as TextAnalysisData[];
    if (textAnalysisJobs.length === 0) {
      logger.warn('Did not find a textanalysis job for watched folder %d, aborting ...', watchedFolderId);
      return;
    }
    const configName = textAnalysisJobs[0].config;
    const configIndex = Object.keys(configs).indexOf(configName);
    if (configIndex === -1) {
      logger.error('Found textanalysis job, but there is no config by the name \'%s\'', configName);
      return;
    }
    const textAnalysisConfig = Object.values(configs)[configIndex];

    // Prepare the context to handle this alert
    const alertContext = {
      processingStarted: new Date(),
      rawContent: '',
      source: {
        type: AlertSourceType.PLAIN
      }
    };

    // Try to get any text from the file
    try {
      const extractionResult = await this.extractor.getTextFromFile(filePath, textAnalysisConfig);
      alertContext.rawContent = extractionResult.content;
      if (extractionResult.method === 'ocr') {
        alertContext.source.type = AlertSourceType.OCR;
      }
    } catch (e) {
      logger.error('Could not extract text from file: ', e);
      return;
    }

    let result;
    try {
      logger.debug('Analysing the following text:', alertContext.rawContent);
      result = this.analyser.analyse(alertContext.rawContent, textAnalysisConfig);
    } catch (e) {
      logger.error('Text analysis aborted:', e);
      return;
    }

    logger.debug('Text analysis completed:', result);

    // Determine the requested resources
    await this.analyzeAlarmResults(result, alertContext);
  }

  private async analyzeAlarmResults(result: TextAnalysisResult, alertContext: AlertContext) {
    // TODO move resource detection into incidents service
    const resourceIds = new Set();
    const ResourceIdentifierService = this.app.service('resource-identifiers');
    for (const name of result.resources) {
      const identifiers = await ResourceIdentifierService.find({ query: { type: 'name', value: name, $limit: 1 }, paginate: false }) as ResourceIdentifierData[];
      if (identifiers.length === 0) {
        continue;
      }

      resourceIds.add(identifiers[0].resourceId);
    }

    const ResourceService = this.app.service('resources');
    const resources = await ResourceService.find({ query: { id: { $in: Array.from(resourceIds.values()) } }, paginate: false }) as ResourceData[];
    logger.debug('Checked for known resources, found %d', resources.length);

    // Compress multiple consecutive spaces into a single one
    const description = (result.description || '').replace(/\s{2,}/, ' ');

    const IncidentsService = this.app.service('incidents');
    await IncidentsService.processAlert({
      caller_name: result.caller.name,
      caller_number: result.caller.number,
      description: description,
      keyword: result.keyword,
      location: result.location,
      reason: result.reason,
      ref: result.ref,
      resources: resources,
      sender: result.sender
    }, alertContext);
  }
}
