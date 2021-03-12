// Initializes the `print-tasks` service on path `/print-tasks`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { PrintTasks } from './print-tasks.class';
import createModel from '../../models/print-tasks.model';
import hooks from './print-tasks.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'print-tasks': PrintTasks & ServiceAddons<any>;
  }

  interface PrintTaskData {
    id: number
    event: string
    sourceId: number
    printerName: string
    numberCopies: number
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/print-tasks', new PrintTasks(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('print-tasks');

  service.hooks(hooks);
}
