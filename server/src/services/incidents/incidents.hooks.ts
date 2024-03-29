import * as authentication from '@feathersjs/authentication';
import {HookContext} from '@feathersjs/feathers';
import {Sequelize} from 'sequelize';
import {ResourceData, IncidentData} from '../../declarations';
import {BadRequest} from '@feathersjs/errors';
import { shallowPopulate, PopulateOptions } from 'feathers-shallow-populate';
import {allowApiKey} from '../../hooks/allowApiKey';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const populateOptions : PopulateOptions = {
  include: [{
    service: 'locations',
    nameAs: 'location',
    keyHere: 'id',
    keyThere: 'incidentId',
    asArray: false
  }, {
    service: 'resources',
    nameAs: 'resources',
    asArray: true,
    params: async function (params, context) {
      if (!context) {
        return undefined;
      }

      // Find out, which resources are dispatched for this incident
      const sequelizeClient: Sequelize = context.app.get('sequelizeClient');
      const tableName = [context.app.get('db_prefix'), 'dispatched_resources'].join('_');
      const relations = await sequelizeClient.getQueryInterface().select(null, tableName, {
        where: {
          incidentId: (this as unknown as IncidentData).id // TypeScript assumes the wrong type for 'this'
        }
      }) as { resourceId: number, incidentId: number }[];

      // Query for those resources
      return {
        query: {
          id: {
            $in: relations.map(relation => relation.resourceId)
          }
        },
        paginate: false,
        skipPopulate: true // Custom parameter, prevents inclusion of resource identifiers
      };
    }
  }]
};

export default {
  before: {
    all: [ allowApiKey(), authenticate('jwt', 'api-key') ],
    find: [],
    get: [],
    create: [ includeLocation ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [ shallowPopulate(populateOptions) ],
    get: [ shallowPopulate(populateOptions) ],
    create: [ updateDispatchedResources, shallowPopulate(populateOptions) ],
    update: [ updateDispatchedResources, shallowPopulate(populateOptions) ],
    patch: [ updateDispatchedResources, shallowPopulate(populateOptions) ],
    remove: [ shallowPopulate(populateOptions) ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

/**
 * Automatically create nested location when creating an incident
 * @param context
 */
function includeLocation(context: HookContext): HookContext {
  if (context.data.location) {
    const sequelize = context.app.get('sequelizeClient');
    const Location = sequelize.models.locations;
    context.params.sequelize = { include: [ { model: Location } ] };
  }
  return context;
}

/**
 * Update the relationship with dispatched resources
 *
 * @param context
 */
async function updateDispatchedResources(context: HookContext) {
  const resources: ResourceData[] = context.data.resources;
  if ((context.method === 'create' || context.method === 'patch') && (!resources || !Array.isArray(resources))) {
    return;
  }

  const sequelizeClient: Sequelize = context.app.get('sequelizeClient');
  const modelName = [context.app.get('db_prefix'), 'dispatched_resources'].join('_');
  const model = sequelizeClient.model(modelName);

  // If the update data did not contain resources, remove all associated resources
  if (context.method === 'update' && (!resources || resources.length === 0)) {
    await model.destroy({
      where: {
        incidentId: context.result.id
      }
    });
    return;
  }

  // Validate resources array
  if (resources.some(resource => !resource.id)) {
    throw new BadRequest('Resources must have an id field');
  }

  // Get the currently associated resources
  const dispatchedResources = await model.findAll({ where: { incidentId: context.result.id } });
  const associatedIds = dispatchedResources.map(r => r.get('resourceId') as number);

  // Determine, which resources have to be added or removed
  const submittedResourceIds = resources.map(resource => resource.id);

  // Associate new resources
  const addedResources = submittedResourceIds.filter(resourceId => !associatedIds.includes(resourceId));
  if (addedResources.length > 0) {
    await model.bulkCreate(addedResources.map(resourceId => {
      return { incidentId: context.result.id, resourceId: resourceId };
    }));
  }

  // If requested, only associate new resources when patching, but don't remove any
  if (context.method === 'patch' && context.params.appendResources) {
    return context;
  }

  // Remove resources that are no longer assigned to the incident
  const removedResources = associatedIds.filter(resourceId => !submittedResourceIds.includes(resourceId));
  if (removedResources.length > 0) {
    await model.destroy({
      where: {
        incidentId: context.result.id,
        resourceId: removedResources
      }
    });
  }

  return context;
}
