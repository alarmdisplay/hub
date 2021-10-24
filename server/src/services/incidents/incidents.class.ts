import { Service } from 'feathers-sequelize';
import {AlertContext, AlertData, Application, IncidentData, LocationData} from '../../declarations';
import logger from '../../logger';
import {IncidentCategory, IncidentStatus} from './incidents.service';
import { NullableId, Params } from '@feathersjs/feathers';

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

export class Incidents extends Service<IncidentData> {
  private app!: Application;

  /**
   * A duration in milliseconds, during which a new incident may be updated by a new alert that has no unique identifier.
   * @private
   */
  private maxAge!: number;

  async setup(app: Application) {
    const fallbackConfig = {
      minutesBeforeNewIncident: 15
    };

    this.app = app;
    const config = app.get('incidents') || fallbackConfig;
    this.maxAge = config.minutesBeforeNewIncident * 60 * 1000;
  }

  async _patch(id: NullableId, data: Partial<IncidentData>, params?: Params): Promise<IncidentData> {
    if (Object.keys(data).includes('location')) {
      const LocationsService = this.app.service('locations');
      if (data.location && data.location.id) {
        // Existing location submitted, try to patch it
        data.location.incidentId = id as number;
        await LocationsService.patch(data.location.id, data.location);
      } else if (data.location) {
        // New location submitted, create it and remove any locations that might belong to this incident beforehand
        await LocationsService.remove(null, { query: { incidentId: id } });
        data.location.incidentId = id as number;
        await LocationsService.create(data.location);
      } else {
        // The location is intentionally left empty, remove all existing ones
        await LocationsService.remove(null, { query: { incidentId: id } });
      }
    }
    return await super._patch(id, data, params);
  }

  async _update(id: NullableId, data: IncidentData, params?: Params): Promise<IncidentData> {
    if (data.location && data.location.id) {
      await this.app.service('locations').update(data.location.id, data.location);
    } else {
      // The location is intentionally left empty, remove all existing ones
      await this.app.service('locations').remove(null, { query: { incidentId: id } });
    }
    return super._update(id, data, params);
  }

  /**
   * Takes new alerts and either creates a new incident or updates an existing one
   *
   * @param alert The content of the alert
   * @param context Metadata on how the alert came to be
   */
  async processAlert(alert: AlertData, context: AlertContext): Promise<IncidentData> {
    const incidentToUpdate = await this.getIncidentToUpdate(alert, context);

    let existingIncidentHasLocation = false;
    const LocationsService = this.app.service('locations');
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
      const newIncident = {
        sender: alert.sender,
        ref: alert.ref,
        caller_name: alert.caller_name,
        caller_number: alert.caller_number,
        location: locationData,
        reason: alert.reason,
        keyword: alert.keyword,
        resources: alert.resources,
        description: alert.description,
        status: IncidentStatus.Actual, // TODO Add a mechanism to detect Test and Exercise status by keywords or date/time
        category: IncidentCategory.Other // TODO Define the category according to reason or keyword
      };

      return await this.create(newIncident) as IncidentData;
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
    return await this.patch(incidentToUpdate.id, incidentDiff) as IncidentData;
  }

  /**
   * Checks if there is an incident on record that should be updated instead of creating a new one
   *
   * @param alert
   * @param context
   */
  async getIncidentToUpdate(alert: AlertData, context: AlertContext): Promise<IncidentData | false> {
    // The context can enforce the creation of a new incident
    if (context.forceNewIncident) {
      logger.debug('New incident enforced by alert context');
      return false;
    }

    // If given, try to find an incident with the same reference number
    if (alert.ref && alert.ref !== '') {
      const incidentWithSameRef = await this.find({
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
    const recentIncidents = await this.find({
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
