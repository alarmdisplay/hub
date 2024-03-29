import feathersClient, { makeServicePlugin, BaseModel } from '../../feathers-client'

class Incident extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  static modelName = 'Incident'

  static instanceDefaults() {
    return {
      time: undefined,
      sender: '',
      ref: '',
      caller_name: '',
      caller_number: '',
      reason: '',
      keyword: '',
      description: '',
      status: 'Actual',
      category: 'Other',
      resourceIds: [],
      location: null
    }
  }

  static setupInstance(data, { models }) {
    // Convert date strings into Date objects
    for (const prop of ['time']) {
      if (data[prop]) {
        data[prop] = new Date(data[prop])
      }
    }

    // Add nested location object to storage
    if (data.location) {
      new models.api.Location(data.location)
    }

    // Replace the nested location with a getter
    Object.defineProperty(data, 'location', {
      get: function () {
        let locations = models.api.Location.findInStore({
          query: {
            incidentId: data.id,
            $sort: {
              updatedAt: -1
            },
            $limit: 1
          }
        })
        return locations.data.length ? locations.data[0] : null
      },
      configurable: true,
      enumerable: true
    })

    // Add nested resource objects to the store
    if (data.resources && Array.isArray(data.resources)) {
      data.resourceIds = data.resources.map(resource => {
        new models.api.Resource(resource);
        return resource.id;
      })
    }

    // Replace the nested resources with a getter
    Object.defineProperty(data, 'resources', {
      get: function () {
        let resources = models.api.Resource.findInStore({
          query: {
            id: {
              $in: data.resourceIds || []
            }
          },
          paginate: false
        })
        return resources.data
      },
      configurable: true,
      enumerable: true
    })

    return data
  }
}

const servicePath = 'incidents'
const servicePlugin = makeServicePlugin({
  Model: Incident,
  service: feathersClient.service(servicePath),
  servicePath
})

// Setup the client-side Feathers hooks.
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [ ensureResources ],
    update: [ ensureResources ],
    patch: [ ensureResources ],
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

/**
 * Translates the resourceIds field to the resources field, because the dynamic getter is not updated on clones.
 *
 * @param {HookContext} context
 * @return {HookContext}
 */
function ensureResources(context) {
  const resourceIds = context.data.resourceIds || []
  context.data.resources = resourceIds.map(id => {
    // The incidents endpoint only needs the id property
    return { id: id }
  })
  return context;
}

export default servicePlugin
