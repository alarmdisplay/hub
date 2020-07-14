// Initializes the `resource-identifiers` service on path `/resource-identifiers`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ResourceIdentifiers } from './resource-identifiers.class';
import createModel from '../../models/resource-identifiers.model';
import hooks from './resource-identifiers.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'resource-identifiers': ResourceIdentifiers & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/resource-identifiers', new ResourceIdentifiers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('resource-identifiers');

  service.hooks(hooks);
}
