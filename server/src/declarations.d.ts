import { Application as ExpressFeathers } from '@feathersjs/express';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {
  'dummy': any; // just here to please @typescript-eslint/no-empty-object-type
}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

