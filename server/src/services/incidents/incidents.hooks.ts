import * as authentication from '@feathersjs/authentication';
import {HookContext} from "@feathersjs/feathers";
import {Sequelize} from "sequelize";
import {ResourceData, LocationData} from '../../declarations';
import {BadRequest} from "@feathersjs/errors";
import {Service} from "feathers-sequelize";
import logger from "../../logger";
// @ts-ignore
import { shallowPopulate } from 'feathers-shallow-populate'
import {allowApiKey} from "../../hooks/allowApiKey";
import {checkContext, getItems, replaceItems} from "feathers-hooks-common";
import has = Reflect.has;
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
}

export default {
  before: {
    all: [ allowApiKey(), authenticate('jwt', 'api-key') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [ shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ],
    get: [ shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ],
    create: [ updateLocation, updateDispatchedResources, shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ],
    update: [ updateLocation, updateDispatchedResources, shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ],
    patch: [ updateLocation, updateDispatchedResources, shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ],
    remove: [ shallowPopulate(populateOptions), nullifyEmptyObjects(['location']) ]
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

async function updateLocation(context: HookContext) {
  const LocationService = context.app.services.locations as Service<LocationData>
  if (context.method === 'create' && context.data.location) {
    if (context.data.location.id) {
      // If the location record already exists, associate it with this incident
      await LocationService.patch(context.data.location.id, { incidentId: context.result.id })
    } else {
      // Otherwise create the location record, including the association
      context.data.location.incidentId = context.result.id
      await LocationService.create(context.data.location)
    }
  } else if (context.method === 'update' && !context.data.location) {
    // If the update did not contain a location, make sure we don't have one on record
    await LocationService.remove(null, { query: { incidentId: context.result.id } })
  } else if ((context.method === 'update' || context.method === 'patch') && context.data.location) {
    // If the update/patch contains a location, update or create the location record
    let locationData
    const rows = await LocationService.find({ query: { incidentId: context.result.id, $limit: 1 }, paginate: false }) as LocationData[]
    logger.debug('found locations:', rows)
    if (rows.length > 0) {
      locationData = rows[0]
    }

    // Make sure that the ID for the association is correct
    context.data.location.incidentId = context.result.id
    if (locationData && context.method === 'patch') {
      logger.debug('patching the location')
      await LocationService.patch(locationData.id, context.data.location)
    } else if (locationData && context.method === 'update') {
      logger.debug('updating the location')
      await LocationService.update(locationData.id, context.data.location)
    } else {
      logger.debug('creating the location')
      await LocationService.create(context.data.location)
    }
  }

  return context
}

/**
 * Update the relationship with dispatched resources
 *
 * @param context
 */
async function updateDispatchedResources(context: HookContext) {
  let resources: ResourceData[] = context.data.resources
  if ((context.method === 'create' || context.method === 'patch') && (!resources || !Array.isArray(resources))) {
    return
  }

  const sequelizeClient: Sequelize = context.app.get('sequelizeClient')
  const modelName = [context.app.get('db_prefix'), 'dispatched_resources'].join('_');
  const model = sequelizeClient.model(modelName);

  // If the update data did not contain resources, remove all associated resources
  if (context.method === 'update' && (!resources || resources.length === 0)) {
    await model.destroy({
      where: {
        incidentId: context.result.id
      }
    })
    return
  }

  // Get the currently associated resources
  const dispatchedResources = await model.findAll({ where: { incidentId: context.result.id } })
  const associatedIds = dispatchedResources.map(r => r.get('resourceId') as number)

  // Determine, which resources have to be added or removed
  const submittedResourceIds = resources.map(resource => resource.id)
  // @ts-ignore
  if (submittedResourceIds.includes(undefined)) {
    throw new BadRequest('Resources must have an id field')
  }

  // Associate new resources
  const addedResources = submittedResourceIds.filter(resourceId => !associatedIds.includes(resourceId))
  if (addedResources.length > 0) {
    await model.bulkCreate(addedResources.map(resourceId => {
      return { incidentId: context.result.id, resourceId: resourceId }
    }))
  }

  // Only associate new resources when patching, but don't remove any
  if (context.method === 'patch') {
    return context
  }

  // Remove resources that are no longer assigned to the incident
  const removedResources = associatedIds.filter(resourceId => !submittedResourceIds.includes(resourceId))
  if (removedResources.length > 0) {
    await model.destroy({
      where: {
        incidentId: context.result.id,
        resourceId: removedResources
      }
    })
  }

  return context
}

function nullifyEmptyObjects(fields: string[]): (context: HookContext) => HookContext {
  return function (context: HookContext): HookContext {
    checkContext(context, 'after');

    const items = getItems(context);
    if (Array.isArray(items)) {
      items.forEach(item => replaceEmptyObjects(item));
    } else {
      replaceEmptyObjects(items);
    }
    replaceItems(context, items);


    function replaceEmptyObjects(item: object) {
      for (let field of fields) {
        if (!has(item, field)) {
          continue;
        }

        let value = Reflect.get(item, field);
        if (typeof value === 'object' && Object.keys(value).length === 0) {
          Reflect.set(item, field, null);
        }
      }
    }

    return context;
  }
}
