// Initializes the `Scheduled alerts` service on path `/scheduled-alerts`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ScheduledAlerts } from './scheduled-alerts.class';
import createModel from '../../models/scheduled-alerts.model';
import hooks from './scheduled-alerts.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'scheduled-alerts': ScheduledAlerts & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/scheduled-alerts', new ScheduledAlerts(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scheduled-alerts');

  service.hooks(hooks);
}
