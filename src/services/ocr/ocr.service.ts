// Initializes the `ocr` service on path `/ocr`
import {ServiceAddons} from '@feathersjs/feathers';
import {Application} from '../../declarations';
import {Ocr} from './ocr.class';
import hooks from './ocr.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'ocr': Ocr & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  app.use('/ocr', new Ocr(app));

  // Get our initialized service so that we can register hooks
  const service = app.service('ocr');

  service.hooks(hooks);
}
