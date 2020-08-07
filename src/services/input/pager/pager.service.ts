// Initializes the `input/pager` service on path `/input/pager`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../../declarations';
import { Pager } from './pager.class';
import hooks from './pager.hooks';

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'input/pager': Pager & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/input/pager', new Pager(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('input/pager');

  service.hooks(hooks);
}
