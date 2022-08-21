import { Params } from '@feathersjs/feathers';
import { AlertContext, Application, IncidentData, LocationData, RawLocation, ResourceData } from '../../declarations';
import logger from '../../logger';

export interface AlertData {
  sender?: string
  ref?: string
  caller_name?: string
  caller_number?: string
  location?: RawLocation
  reason?: string
  keyword?: string
  resources?: ResourceData[]
  description?: string
  context?: AlertContext
}

interface ServiceOptions {}

/**
 * The properties of an incident, that can be updated or filled by later alerts. Keyed by their AlertData counterpart
 */
const updatableProperties: Map<keyof AlertData, keyof IncidentData> = new Map([
  ['ref', 'ref'],
  ['sender', 'sender'],
  ['caller_name', 'caller_name'],
  ['caller_number', 'caller_number'],
  ['reason', 'reason'],
  ['keyword', 'keyword'],
  ['description', 'description']
]);

export class Alerts {
  app: Application;
  options: ServiceOptions;

  /**
   * A duration in milliseconds, during which a new incident may be updated by a new alert that has no unique identifier.
   * @private
   */
  private readonly maxAge: number;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;

    const fallbackConfig = {
      minutesBeforeNewIncident: 15
    };

    const config = app.get('incidents') || fallbackConfig;
    this.maxAge = config.minutesBeforeNewIncident * 60 * 1000;
  }

  /**
   * Takes new alerts and either creates a new incident or updates an existing one.
   *
   * @param alert
   * @param params
   */
  async create (alert: AlertData, params?: Params): Promise<IncidentData> {
    const LocationsService = this.app.service('locations');
    const IncidentsService = this.app.service('incidents');

    const incidentToUpdate = await this.getIncidentToUpdate(alert);

    let existingIncidentHasLocation = false;
    if (incidentToUpdate !== false) {
      const locations = await LocationsService.find({query: { incidentId: incidentToUpdate.id }, paginate: false}) as LocationData[];
      if (locations.length > 0) {
        existingIncidentHasLocation = true;
      }
    }

    // Process the location if it is a new incident or the existing one does not have a location record
    let locationData = undefined;
    if (alert.location && (incidentToUpdate === false || !existingIncidentHasLocation)) {
      locationData = await LocationsService.processRawLocation(alert.location);
      logger.debug('Processed location');
    }

    // If there is no existing incident to be updated, create a new one
    if (incidentToUpdate === false) {
      logger.debug('Creating a new incident');
      const newIncident: Partial<IncidentData> = {
        sender: alert.sender,
        ref: alert.ref,
        caller_name: alert.caller_name,
        caller_number: alert.caller_number,
        location: locationData,
        reason: alert.reason,
        keyword: alert.keyword,
        resources: alert.resources,
        description: alert.description,
        status: 'Actual', // TODO Add a mechanism to detect Test and Exercise status by keywords or date/time
        category: 'Other' // TODO Define the category according to reason or keyword
      };

      return await IncidentsService.create(newIncident) as IncidentData;
    }

    // Otherwise update the existing incident
    logger.debug('Updating incident %d...', incidentToUpdate.id);
    const incidentDiff = this.getIncidentDiff(incidentToUpdate, alert);

    // Do not include an empty location as that might remove an existing one
    if (locationData) {
      incidentDiff.location = locationData;
    }

    // Always include the resources, the difference is calculated in the hooks
    incidentDiff.resources = alert.resources;
    return await IncidentsService.patch(incidentToUpdate.id, incidentDiff, { appendResources: true }) as IncidentData;
  }

  /**
   * Checks if there is an incident on record that should be updated instead of creating a new one
   *
   * @param alert
   */
  async getIncidentToUpdate(alert: AlertData): Promise<IncidentData | false> {
    const IncidentsService = this.app.service('incidents');

    // The context can enforce the creation of a new incident
    if (alert.context?.forceNewIncident) {
      logger.debug('New incident enforced by alert context');
      return false;
    }

    // If given, try to find an incident with the same reference number
    if (alert.ref && alert.ref !== '') {
      const incidentWithSameRef = await IncidentsService.find({
        query: {
          ref: alert.ref,
          $limit: 1,
          $sort: { time: -1 }
        },
        paginate: false
      }) as IncidentData[];
      if (incidentWithSameRef.length > 0) {
        logger.debug('Found incident with same reference');
        return incidentWithSameRef[0];
      } else {
        logger.debug('Did not find incident with same reference');
      }
    }

    // Find the most recent incident that is not yet too old
    const recentIncidents = await IncidentsService.find({
      query: {
        time: { $gt: new Date().getTime() - this.maxAge },
        $limit: 1,
        $sort: { time: -1 }
      },
      paginate: false
    }) as IncidentData[];
    if (recentIncidents.length > 0) {
      const incident = recentIncidents[0];
      logger.debug('Found recent incident, ID %d', incident.id);

      // If existing incident and new alert have conflicting references, create a new incident
      if (incident.ref && alert.ref && incident.ref !== alert.ref) {
        logger.debug('Incident reference conflict, enforcing new incident');
        return false;
      }

      return incident;
    } else {
      logger.debug('No recent incident found');
    }

    return false;
  }

  /**
   * Determines the difference between an existing incident and an alert. Alerts can fill empty properties but not
   * overwrite them.
   *
   * @param incident
   * @param alert
   */
  getIncidentDiff(incident: IncidentData, alert: AlertData): Partial<IncidentData> {
    const newData: Partial<IncidentData> = {};

    // Check for properties that the incident is missing and the alert can provide
    for (const [alertProperty, incidentProperty] of updatableProperties.entries()) {
      const incidentValue = incident[incidentProperty];
      const alertValue = alert[alertProperty] as string;

      if ((incidentValue === undefined || incidentValue === '') && alertValue && alertValue !== '') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore The target property is always a string
        newData[incidentProperty] = alertValue;
      }
    }

    return newData;
  }
}
