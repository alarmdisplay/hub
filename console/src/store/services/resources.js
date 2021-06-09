import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Resource extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'Resource'

  static instanceDefaults() {
    return {
      identifiers: [],
      name: '',
      type: 'vehicle'
    }
  }

  static setupInstance(data, { models }) {
    if (data.identifiers && Array.isArray(data.identifiers)) {
      data.identifiers = data.identifiers.map(identifier => new models.api.ResourceIdentifier(identifier))
    }
    return data
  }

  clone (data) {
    let clone = super.clone(data)
    clone.identifiers = clone.identifiers.map(identifier => identifier.clone())
    return clone
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
