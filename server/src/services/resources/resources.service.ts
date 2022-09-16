// Initializes the `resources` service on path `/resources`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application, ResourceIdentifierData } from '../../declarations';
import { Resources } from './resources.class';
import createModel from '../../models/resources.model';
import hooks from './resources.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'resources': Resources & ServiceAddons<any>;
  }

  interface ResourceData {
    id: number
    name: string
    type: 'organization' | 'group' | 'vehicle' | 'role' | 'other'
    createdAt: Date
    updatedAt: Date
    identifiers: ResourceIdentifierData[]
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/resources', new Resources(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('resources');

  service.hooks(hooks);
}
