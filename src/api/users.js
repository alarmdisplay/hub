import api from './index'

const service = api.getService('users')

export default {
  create (email, password) {
    return service.create({ strategy: 'local', email: email, password: password })
  },
  find () {
    return service.find()
  },
  remove (id) {
    return service.remove(id)
  }
}
