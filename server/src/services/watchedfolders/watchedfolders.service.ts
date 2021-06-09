// Initializes the `watchedfolders` service on path `/watchedfolders`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { WatchedFolders } from './watchedfolders.class';
import createModel from '../../models/watchedfolders.model';
import hooks from './watchedfolders.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'watchedfolders': WatchedFolders & ServiceAddons<any>;
  }

  interface FoundFileContext {
    watchedFolderId: number
    path: string
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/watchedfolders', new WatchedFolders(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('watchedfolders');

  service.hooks(hooks);
}
