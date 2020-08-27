import {Id, NullableId, Paginated, Params, ServiceMethods} from '@feathersjs/feathers';
import {Application, ResourceData, ResourceIdentifierData} from '../../../declarations';
import {MethodNotAllowed, NotFound} from "@feathersjs/errors";
import {AlertSourceType} from "../../incidents/incidents.service";

interface PagerData {
  selcall: string
}

interface ServiceOptions {}

export class Pager implements ServiceMethods<PagerData> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<PagerData[] | Paginated<PagerData>> {
    throw new MethodNotAllowed()
  }

  async get (id: Id, params?: Params): Promise<PagerData> {
    throw new MethodNotAllowed()
  }

  async create (data: PagerData, params?: Params): Promise<PagerData> {
    // Find the resources associated with this selcall
    const resourceIdentifierService = this.app.service('resource-identifiers')
    const resourceIdentifiers = await resourceIdentifierService.find({ query: { type: 'selcall', value: data.selcall }, paginate: false }) as ResourceIdentifierData[]
    const resourceIds = resourceIdentifiers.map(identifier => identifier.resourceId)
    const resourceService = this.app.service('resources')
    const resources = await resourceService.find({ query: { id: resourceIds }, paginate: false }) as ResourceData[]

    // Do not process the alert if there is no resource associated with this selcall
    if (resources.length === 0) {
      throw new NotFound()
    }

    // Forward the alert
    const incidentService = this.app.service('incidents')
    await incidentService.processAlert({
      resources: resources
    }, {
      processingStarted: new Date(),
      rawContent: data.selcall,
      source: {
        type: AlertSourceType.PAGER
      }
    })

    return data;
  }

  async update (id: NullableId, data: PagerData, params?: Params): Promise<PagerData> {
    throw new MethodNotAllowed()
  }

  async patch (id: NullableId, data: PagerData, params?: Params): Promise<PagerData> {
    throw new MethodNotAllowed()
  }

  async remove (id: NullableId, params?: Params): Promise<PagerData> {
    throw new MethodNotAllowed()
  }
}
