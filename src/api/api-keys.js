import api from './index'

const service = api.getService('api-keys')

export default {
  create (name) {
    return service.create({ name: name })
  },
  find () {
    return service.find()
  },
  remove (id) {
    return service.remove(id)
  }
}
