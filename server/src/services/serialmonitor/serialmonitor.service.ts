// Initializes the `serialmonitor` service on path `/serialmonitor`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Serialmonitor } from './serialmonitor.class';
import createModel from '../../models/serialmonitor.model';
import hooks from './serialmonitor.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'serialmonitor': Serialmonitor & ServiceAddons<any>;
  }

  interface AlarmContext {
    pager_id: number
    alarmText: string
    port: string
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/serialmonitor', new Serialmonitor(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('serialmonitor');

  service.hooks(hooks);
}
