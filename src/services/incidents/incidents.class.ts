import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import {AlertContext, AlertData, Application, IncidentData, LocationData} from '../../declarations';
import logger from "../../logger";
import {IncidentCategory, IncidentStatus} from "./incidents.service";

// Maximum age of an incident, before a new one gets created
const MAX_AGE = process.env.NODE_ENV && process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000;

/**
 * The properties of an incident, that can be updated or filled by later alerts
 */
const updatableProperties = ['ref', 'sender', 'caller_name', 'caller_number', 'reason', 'keyword', 'description'];

export class Incidents extends Service<IncidentData> {
  private app: Application;
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  /**
   * Takes new alerts and either creates a new incident or updates an existing one
   *
   * @param alert The content of the alert
   * @param context Metadata on how the alert came to be
   */
  async processAlert(alert: AlertData, context: AlertContext): Promise<IncidentData> {
    const incidentToUpdate = await this.getIncidentToUpdate(alert, context)

    let existingIncidentHasLocation = false
    const LocationsService = this.app.service('locations')
    if (incidentToUpdate !== false) {
      const locations = await LocationsService.find({query: { incidentId: incidentToUpdate.id }, paginate: false}) as LocationData[]
      if (locations.length > 0) {
        existingIncidentHasLocation = true
      }
    }

    // Process the location if it is a new incident or the existing one does not have a location record
    let locationData
    if (incidentToUpdate === false || !existingIncidentHasLocation) {
      locationData = await LocationsService.processRawLocation(alert.location)
      logger.debug('Processed location')
    }

    // If there is no existing incident to be updated, create a new one
    if (incidentToUpdate === false) {
      logger.debug('Creating a new incident')
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
      // @ts-ignore Ignore that LocationData is only partial
      return await this.create(newIncident) as IncidentData
    }

    // Otherwise update the existing incident
    logger.debug('Updating incident %d...', incidentToUpdate.id)
    const incidentDiff = this.getIncidentDiff(incidentToUpdate, alert, locationData);
    // Always include the resources and the location, the difference is calculated in the hooks
    // @ts-ignore
    incidentDiff.location = locationData
    incidentDiff.resources = alert.resources
    return await this.patch(incidentToUpdate.id, incidentDiff) as IncidentData
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
      logger.debug('New incident enforced by alert context')
      return false
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
      }) as IncidentData[]
      if (incidentWithSameRef.length > 0) {
        logger.debug('Found incident with same reference')
        return incidentWithSameRef[0]
      } else {
        logger.debug('Did not find incident with same reference')
      }
    }

    // Find the most recent incident that is not yet too old
    const recentIncidents = await this.find({
      query: {
        time: { $gt: new Date().getTime() - MAX_AGE },
        $limit: 1,
        $sort: { time: -1 }
      },
      paginate: false
    }) as IncidentData[]
    if (recentIncidents.length > 0) {
      const incident = recentIncidents[0]
      logger.debug('Found recent incident, ID %d', incident.id)

      // If existing incident and new alert have conflicting references, create a new incident
      if (incident.ref && alert.ref && incident.ref !== alert.ref) {
        logger.debug('Incident reference conflict, enforcing new incident')
        return false
      }

      return incident
    } else {
      logger.debug('No recent incident found')
    }

    return false
  }

  /**
   * Determines the difference between an existing incident and an alert. Alerts can fill empty properties but not
   * overwrite them.
   *
   * @param incident
   * @param alert
   * @param locationData
   */
  getIncidentDiff(incident: IncidentData, alert: AlertData, locationData?: Partial<LocationData>): Partial<IncidentData> {
    const newData = {}

    // Check for properties that the incident is missing and the alert can provide
    for (const property of updatableProperties) {
      // @ts-ignore
      const incidentValue = incident[property]
      // @ts-ignore
      const alertValue = alert[property]

      if ((incidentValue === undefined || incidentValue === '') && alertValue && alertValue !== '') {
        // @ts-ignore
        newData[property] = alertValue
      }
    }

    return newData
  }
}
