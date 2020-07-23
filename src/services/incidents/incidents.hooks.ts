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
    update: [],
    patch: [],
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
  let resources = context.data.resources
  if (!resources || !Array.isArray(resources)) {
    return
  }

  const sequelizeClient: Sequelize = context.app.get('sequelizeClient')
  const model = sequelizeClient.model('dispatched_resources');
  const resourceAssignments = (<ResourceData[]>resources).map(resource => { return { incidentId: context.result.id, resourceId: resource.id } });
  await model.bulkCreate(resourceAssignments)
  return context
}
