import * as authentication from '@feathersjs/authentication';
// @ts-ignore
import { shallowPopulate } from 'feathers-shallow-populate'
import {allowApiKey} from "../../hooks/allowApiKey";
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
    create: [],
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
