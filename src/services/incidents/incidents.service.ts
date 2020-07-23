// Initializes the `incidents` service on path `/incidents`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Incidents } from './incidents.class';
import createModel from '../../models/incidents.model';
import hooks from './incidents.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'incidents': Incidents & ServiceAddons<any>;
  }

  interface IncidentData {
    id: number
    sender: string
    ref: string
    caller_name: string
    caller_number: string
    locationId?: number
    reason: string
    keyword: string
    resources: number[]
    description: string
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/incidents', new Incidents(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('incidents');

  service.hooks(hooks);
}
