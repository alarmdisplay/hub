import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class PrintTask extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'PrintTask'

  static instanceDefaults() {
    return {
      event: '',
      sourceId: null,
      printerName: '',
      numberCopies: 1,
    }
  }
}

const servicePath = 'print-tasks'
const servicePlugin = makeServicePlugin({
  Model: PrintTask,
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
