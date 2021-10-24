import * as authentication from '@feathersjs/authentication';
import {HookContext} from '@feathersjs/feathers';
import {Sequelize} from 'sequelize';
import {ResourceData} from '../../declarations';
import {BadRequest} from '@feathersjs/errors';
// @ts-ignore
import { shallowPopulate } from 'feathers-shallow-populate';
import {allowApiKey} from '../../hooks/allowApiKey';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const populateOptions = {
  include: {
    service: 'locations',
    nameAs: 'location',
    keyHere: 'id',
    keyThere: 'incidentId',
    asArray: false
  }
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
  const sequelize = context.app.get('sequelizeClient');
  const Location = sequelize.models.locations;
  context.params.sequelize = { include: [ { model: Location } ] };
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

  // Get the currently associated resources
  const dispatchedResources = await model.findAll({ where: { incidentId: context.result.id } });
  const associatedIds = dispatchedResources.map(r => r.get('resourceId') as number);

  // Determine, which resources have to be added or removed
  const submittedResourceIds = resources.map(resource => resource.id);
  // @ts-ignore
  if (submittedResourceIds.includes(undefined)) {
    throw new BadRequest('Resources must have an id field');
  }

  // Associate new resources
  const addedResources = submittedResourceIds.filter(resourceId => !associatedIds.includes(resourceId));
  if (addedResources.length > 0) {
    await model.bulkCreate(addedResources.map(resourceId => {
      return { incidentId: context.result.id, resourceId: resourceId };
    }));
  }

  // Only associate new resources when patching, but don't remove any
  if (context.method === 'patch') {
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
