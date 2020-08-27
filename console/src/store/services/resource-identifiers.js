import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class ResourceIdentifier extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'ResourceIdentifier'

  static instanceDefaults() {
    return {
      type: 'name',
      value: ''
    }
  }
}

const servicePath = 'resource-identifiers'
const servicePlugin = makeServicePlugin({
  Model: ResourceIdentifier,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
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
})

export default servicePlugin
