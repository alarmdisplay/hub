// Initializes the `uploads` service on path `/uploads`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import hooks from './uploads.hooks';
import BlobService from 'feathers-blob'
// @ts-ignore
import fsBlobStore from 'fs-blob-store'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'uploads': BlobService.Service & ServiceAddons<any>;
  }
}

// Store the blobs on the local file system
const blobStorage = fsBlobStore('./uploads');

export default function (app: Application) {
  app.use('/uploads', BlobService({ Model: blobStorage}));

  // Get our initialized service so that we can register hooks
  const service = app.service('uploads');

  service.hooks(hooks);
}
