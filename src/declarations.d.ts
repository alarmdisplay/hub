import { Application as ExpressFeathers } from '@feathersjs/express';

// A mapping of service names to types. Will be extended in service files.
export interface ServiceTypes {}
// The application instance type that will be used everywhere else
export type Application = ExpressFeathers<ServiceTypes>;

export interface AlertData {
  sender?: string
  ref?: string
  caller_name?: string
  caller_number?: string
  location?: LocationData
  reason?: string
  keyword?: string
  resources?: ResourceData[]
  description?: string
}
