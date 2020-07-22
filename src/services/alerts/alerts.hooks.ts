import * as authentication from '@feathersjs/authentication';
import {HookContext} from "@feathersjs/feathers";
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ authenticate('jwt') ],
    find: [ includeAssociations ],
    get: [ includeAssociations ],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
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

function includeAssociations(context: HookContext) {
  const sequelize = context.app.get('sequelizeClient');
  const { locations, resource } = sequelize.models

  context.params.sequelize = Object.assign(context.params.sequelize || {}, {
    include: [
      { model: locations, as: 'location' },
      { model: resource, as: 'resources' }
    ],
    raw: false
  })

  return context;
}
