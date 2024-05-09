import { Application, ResourceData, ResourceIdentifierData } from '../../../declarations';
import { NotFound } from '@feathersjs/errors';
import { AlertSourceType } from '../../incidents/incidents.service';

interface PagerData {
  selcall: string
}

interface PagerResponse {
  incidentId: number
}

interface ServiceOptions {}

export class Pager {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async create (data: PagerData): Promise<PagerResponse> {
    // Find the resources associated with this selcall
    const resourceIdentifierService = this.app.service('resource-identifiers');
    const resourceIdentifiers = await resourceIdentifierService.find({ query: { type: 'selcall', value: data.selcall }, paginate: false }) as ResourceIdentifierData[];
    const resourceIds = resourceIdentifiers.map(identifier => identifier.resourceId);
    const resourceService = this.app.service('resources');
    const resources = await resourceService.find({ query: { id: resourceIds }, paginate: false }) as ResourceData[];

    // Do not process the alert if there is no resource associated with this selcall
    if (resources.length === 0) {
      throw new NotFound('No resources are associated with this selcall');
    }

    // Forward the alert
    const incidentData = await this.app.service('alerts').create({
      resources: resources,
      context: {
        processingStarted: new Date(),
        rawContent: data.selcall,
        source: {
          type: AlertSourceType.PLAIN
        }
      }
    });

    return {
      incidentId: incidentData.id
    };
  }
}
