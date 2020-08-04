import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class WatchedFolder extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'WatchedFolder'

  static instanceDefaults() {
    return {
      path: '',
      active: true
    }
  }
}

const servicePath = 'watchedfolders'
const servicePlugin = makeServicePlugin({
  Model: WatchedFolder,
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
