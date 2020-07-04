import api from './index'

const service = api.getService('users')

export default {
  find () {
    return service.find()
  }
}
