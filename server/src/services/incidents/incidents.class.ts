import { SequelizeServiceOptions, Service } from 'feathers-sequelize';
import { Application, IncidentData } from '../../declarations';
import { NullableId, Params } from '@feathersjs/feathers';

export class Incidents extends Service<IncidentData> {
  private app: Application;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
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
}
