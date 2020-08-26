import * as authentication from '@feathersjs/authentication';
import {allowApiKey} from '../../../hooks/allowApiKey';
import { createSchema } from './pager.schemas';
import { validateJoiSchema } from '../../../hooks/validateJoiSchema';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [ allowApiKey(), authenticate('jwt', 'api-key') ],
    find: [],
    get: [],
    create: [ validateJoiSchema(createSchema) ],
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
