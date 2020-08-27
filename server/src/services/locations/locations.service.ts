// Initializes the `locations` service on path `/locations`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Locations } from './locations.class';
import createModel from '../../models/locations.model';
import hooks from './locations.hooks';
import {DataTypes} from "sequelize";

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'locations': Locations & ServiceAddons<any>;
  }

  interface LocationData {
    id: number
    rawText: string,
    latitude?: number,
    longitude?: number,
    name: string,
    street: string,
    number: string,
    detail: string,
    postCode: string,
    locality: string,
    country: string
    incidentId?: number
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['remove']
  };

  // Initialize our service with any options it requires
  app.use('/locations', new Locations(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('locations');

  service.hooks(hooks);
}
