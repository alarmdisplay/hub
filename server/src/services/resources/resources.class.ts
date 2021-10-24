import { SequelizeServiceOptions, Service } from 'feathers-sequelize';
import { Application, ResourceData, ResourceIdentifierData } from '../../declarations';
import { NullableId, Params } from '@feathersjs/feathers';

export class Resources extends Service<ResourceData> {
  private app: Application;
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async _update(id: NullableId, data: ResourceData, params?: Params): Promise<ResourceData> {
    if (data.identifiers && data.identifiers.length) {
      await this.diffIdentifiers(id as number, data.identifiers);
    } else {
      // The identifiers are intentionally left empty, remove all existing ones
      await this.app.service('resource-identifiers').remove(null, { query: { resourceId: id } });
    }

    return await super._update(id, data, params);
  }

  async _patch(id: NullableId, data: Partial<ResourceData>, params?: Params): Promise<ResourceData> {
    await this.diffIdentifiers(id as number, data.identifiers);
    return await super._patch(id, data, params);
  }

  private async diffIdentifiers(id: number, submittedIdentifiers: ResourceIdentifierData[] | undefined) {
    const ResourceIdentifiersService = this.app.service('resource-identifiers');

    if (submittedIdentifiers && submittedIdentifiers.length === 0) {
      // Shortcut: No identifiers should be assigned, so delete any that belong to this resource
      await ResourceIdentifiersService.remove(null, {query: {resourceId: id}});
    } else if (submittedIdentifiers && submittedIdentifiers.length > 0) {
      // Get the currently assigned identifiers
      const currentIdentifiers = await ResourceIdentifiersService.find({
        query: {resourceId: id},
        paginate: false
      }) as ResourceIdentifierData[];
      const currentIds = currentIdentifiers.map(identifier => identifier.id);

      // Patch identifiers with IDs, create the others
      const patchedIds: number[] = [];
      for (const submittedIdentifier of submittedIdentifiers) {
        submittedIdentifier.resourceId = id as number;
        if (submittedIdentifier.id) {
          const patchedIdentifier = await ResourceIdentifiersService.patch(submittedIdentifier.id, submittedIdentifier) as ResourceIdentifierData;
          patchedIds.push(patchedIdentifier.id);
        } else {
          await ResourceIdentifiersService.create(submittedIdentifier);
        }
      }

      // Remove all assigned identifiers that were not patched
      const removedIds = currentIds.filter(id => !patchedIds.includes(id));
      await ResourceIdentifiersService.remove(null, {query: {id: {$in: removedIds}}});
    }
  }
}
