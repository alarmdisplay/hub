import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class TextAnalysis extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'TextAnalysis'

  static instanceDefaults() {
    return {
      config: '',
      event: '',
      sourceId: null,
    }
  }
}

const servicePath = 'textanalysis'
const servicePlugin = makeServicePlugin({
  Model: TextAnalysis,
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
