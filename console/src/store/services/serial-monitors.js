import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class SerialMonitor extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'SerialMonitor'

  static instanceDefaults() {
    return {
      port: '',
      baudRate: 9600,
      active: true,
      timeout: 1000
    }
  }
}

const servicePath = 'serial-monitors'
const servicePlugin = makeServicePlugin({
  Model: SerialMonitor,
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
