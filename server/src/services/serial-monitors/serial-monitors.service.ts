// Initializes the `serial-monitors` service on path `/serial-monitors`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { SerialMonitors } from './serial-monitors.class';
import createModel from '../../models/serial-monitors.model';
import hooks from './serial-monitors.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'serial-monitors': SerialMonitors & ServiceAddons<any>;
  }

  interface SerialDataContext {
    serialMonitorId: number
    data: Buffer
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/serial-monitors', new SerialMonitors(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('serial-monitors');

  service.hooks(hooks);
}
