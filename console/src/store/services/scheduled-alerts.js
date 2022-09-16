import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class ScheduledAlert extends BaseModel {
  static modelName = 'ScheduledAlert'

  static instanceDefaults () {
    const date = new Date();
    return {
      begin: date.toJSON(),
      end: new Date(date.valueOf() + 15 * 60 * 1000).toJSON(),
      reason: '',
      keyword: '',
      status: 'Test',
      incidentId: undefined
    }
  }

  static setupInstance(data) {
    // Convert date strings into Date objects
    for (const prop of ['begin', 'end', 'createdAt', 'updatedAt']) {
      if (data[prop]) {
        data[prop] = new Date(data[prop])
      }
    }

    return data;
  }
}

const servicePath = 'scheduled-alerts'
const servicePlugin = makeServicePlugin({
  Model: ScheduledAlert,
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
