import * as authentication from '@feathersjs/authentication';
import {HookContext} from "@feathersjs/feathers";
import {Sequelize} from "sequelize";
import {ResourceData} from '../../declarations';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [ updateDispatchedResources ],
    update: [ updateDispatchedResources ],
    patch: [ updateDispatchedResources ],
    remove: []
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
 * Update the relationship with dispatched resources
 *
 * @param context
 */
async function updateDispatchedResources(context: HookContext) {
  let resources: ResourceData[] = context.data.resources
  if (!resources || !Array.isArray(resources)) {
    return
  }

  const sequelizeClient: Sequelize = context.app.get('sequelizeClient')
  const model = sequelizeClient.model('dispatched_resources');

  // Get the currently associated resources
  const dispatchedResources = await model.findAll({ where: { incidentId: context.result.id } })
  const associatedIds = dispatchedResources.map(r => r.get('resourceId') as number)

  // Determine, which resources have to be added or removed
  const submittedResourceIds = resources.map(resource => resource.id)
  const addedResources = submittedResourceIds.filter(resourceId => !associatedIds.includes(resourceId))
  const removedResources = associatedIds.filter(resourceId => !submittedResourceIds.includes(resourceId))

  // Associate new resources
  if (addedResources.length > 0) {
    await model.bulkCreate(addedResources.map(resourceId => {
      return { incidentId: context.result.id, resourceId: resourceId }
    }))
  }

  // Remove resources that are no longer assigned to the incident
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
