import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Location extends BaseModel {
  static modelName = 'Location'

  static instanceDefaults () {
    return {
      rawText: '',
      latitude: undefined,
      longitude: undefined,
      name: '',
      street: '',
      number: '',
      detail: '',
      postCode: '',
      municipality: '',
      district: '',
      country: '',
      incidentId: undefined
    }
  }
}

const servicePath = 'locations'
const servicePlugin = makeServicePlugin({
  Model: Location,
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
