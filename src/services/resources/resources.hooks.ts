import * as authentication from '@feathersjs/authentication';
// @ts-ignore
import { shallowPopulate } from 'feathers-shallow-populate'
import { createUpdateSchema, patchSchema } from './resources.schemas';
import { validateJoiSchema } from '../../hooks/validateJoiSchema';
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
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [ validateJoiSchema(createUpdateSchema) ],
    update: [ validateJoiSchema(createUpdateSchema) ],
    patch: [ validateJoiSchema(patchSchema) ],
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
