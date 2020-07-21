// Initializes the `alerts` service on path `/alerts`
import { ServiceAddons } from '@feathersjs/feathers';
import {Application} from '../../declarations';
import { Alerts } from './alerts.class';
import createModel from '../../models/alerts.model';
import hooks from './alerts.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'alerts': Alerts & ServiceAddons<any>;
  }

  interface AlertData {
    sender: string
    ref: string
    caller: {
      name: string
      number: string
    }
    location: LocationData
    reason: string
    keyword: string
    resources: ResourceData[]
    description: string
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/alerts', new Alerts(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('alerts');

  service.hooks(hooks);
}
