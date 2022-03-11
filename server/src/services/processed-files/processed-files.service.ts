// Initializes the `processed files` service on path `/processed-files`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ProcessedFiles } from './processed-files.class';
import createModel from '../../models/processed-files.model';
import hooks from './processed-files.hooks';
import { SequelizeServiceOptions } from 'feathers-sequelize';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'processed-files': ProcessedFiles & ServiceAddons<any>;
  }

  interface ProcessedFilesData {
    hash: string
    createdAt: Date
  }
}

export default function (app: Application): void {
  const options: Partial<SequelizeServiceOptions> = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    id: 'hash'
  };

  // Initialize our service with any options it requires
  app.use('/processed-files', new ProcessedFiles(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('processed-files');

  service.hooks(hooks);
}
