import * as authentication from '@feathersjs/authentication';
import { allowApiKey } from "../../hooks/allowApiKey";
import { HookContext } from "@feathersjs/feathers";
import { BadRequest } from "@feathersjs/errors";
import configs from './configs'
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ allowApiKey(), authenticate('jwt', 'api-key') ],
    find: [],
    get: [],
    create: [ validateConfigName ],
    update: [ validateConfigName ],
    patch: [ validateConfigName ],
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

function validateConfigName(context: HookContext): HookContext {
  if (context.method === 'create' && !context.data.config) {
    throw new BadRequest('config not provided')
  }

  if (context.method === 'create' || context.method === 'update' || (context.method === 'patch' && context.data.config)) {
    if (!Object.keys(configs).includes(context.data.config)) {
      throw new BadRequest('config name invalid')
    }
  }

  return context
}
