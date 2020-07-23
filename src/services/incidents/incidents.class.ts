import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import {AlertData, Application, IncidentData} from '../../declarations';
import logger from "../../logger";

export class Incidents extends Service<IncidentData> {
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  /**
   *
   * @param alert
   */
  async processAlert(alert: AlertData): Promise<IncidentData> {
    const incidentToUpdate = await this.getIncidentToUpdate(alert)

    // If there is no existing incident to be updated, create a new one
    if (incidentToUpdate === false) {
      logger.debug('Creating a new incident')
      const newIncident = {
        sender: alert.sender,
        ref: alert.ref,
        caller_name: alert.caller_name,
        caller_number: alert.caller_number,
        locationId: alert.location?.id,
        reason: alert.reason,
        keyword: alert.keyword,
        resources: alert.resources,
        description: alert.description
      };
      return await this.create(newIncident) as IncidentData
    }

    // Otherwise update the existing incident
    logger.debug('Updating incident %d...', incidentToUpdate.id)
    return await this.patch(incidentToUpdate.id, this.getIncidentDiff(incidentToUpdate, alert)) as IncidentData
  }

  /**
   * Checks if there is an incident on record that should be updated instead of creating a new one
   *
   * @param alert
   */
  async getIncidentToUpdate(alert: AlertData): Promise<IncidentData | false> {
    // TODO check if we can update an existing incident
    return false
  }

  /**
   * Determines the difference between an existing incident and an alert. Alerts can fill empty properties but not
   * overwrite them.
   *
   * @param incident
   * @param alert
   */
  getIncidentDiff(incident: IncidentData, alert: AlertData): Partial<IncidentData> {
    // TODO determine the difference
    return {
      reason: alert.reason
    }
  }
}
