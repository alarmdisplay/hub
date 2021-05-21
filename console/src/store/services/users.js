import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class User extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'User'

  static instanceDefaults() {
    return {
      name: '',
      email: '',
    }
  }

  get displayName() {
    return this.name || this.email
  }
}

const servicePath = 'users'
const servicePlugin = makeServicePlugin({
  Model: User,
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
