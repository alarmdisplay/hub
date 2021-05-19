import * as authentication from '@feathersjs/authentication';
// @ts-ignore
import { shallowPopulate } from 'feathers-shallow-populate'
import {allowApiKey} from "../../hooks/allowApiKey";
import { HookContext } from "@feathersjs/feathers";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const populateOptions = {
  include: {
    service: 'resource-identifiers',
    nameAs: 'identifiers',
    keyHere: 'id',
    keyThere: 'resourceId',
  }
}

export default {
  before: {
    all: [ allowApiKey(), authenticate('jwt', 'api-key') ],
    find: [],
    get: [],
    create: [ includeIdentifiers ],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ shallowPopulate(populateOptions) ],
    find: [],
    get: [],
    create: [],
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
 * Automatically create nested resource identifiers when creating a resource
 * @param context
 */
function includeIdentifiers(context: HookContext): HookContext {
  const sequelize = context.app.get('sequelizeClient');
  const ResourceIdentifier = sequelize.models.resource_identifier;
  context.params.sequelize = { include: [ { model: ResourceIdentifier, as: 'identifiers' } ] };
  return context
}
