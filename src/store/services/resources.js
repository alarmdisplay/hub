import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Resource extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'Resource'

  static instanceDefaults() {
    return {
      name: '',
      type: 'VEHICLE'
    }
  }
}

const servicePath = 'resources'
const servicePlugin = makeServicePlugin({
  Model: Resource,
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
