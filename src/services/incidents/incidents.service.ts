// Initializes the `incidents` service on path `/incidents`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Incidents } from './incidents.class';
import createModel from '../../models/incidents.model';
import hooks from './incidents.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'incidents': Incidents & ServiceAddons<any>;
  }

  interface IncidentData {
    id: number
    time: Date
    sender: string
    ref: string
    caller_name: string
    caller_number: string
    locationId?: number
    reason: string
    keyword: string
    resources: ResourceData[]
    description: string
  }

  export interface AlertContext {
    /**
     * The time and date of when the processing of the source started. Will be used as fallback if the alert itself does
     * not contain time and date and also the sourceTime is not provided.
     */
    processingStarted: Date

    /**
     * The unprocessed content of the source
     */
    rawContent: any

    /**
     * Details about the source, from which the alert originated. Can be used to give the alert data more or less weight
     * when it comes to combining multiple sources (e.g. OCR might introduce errors while other formats don't)
     */
    source: AlertSource

    /**
     * The time and date of the source (e.g. creation date of a PDF file, timestamp of an email)
     */
    sourceTime?: Date
  }

  export interface AlertSource {
    type: AlertSourceType
  }
}

export enum AlertSourceType {
  OCR
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/incidents', new Incidents(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('incidents');

  service.hooks(hooks);
}
