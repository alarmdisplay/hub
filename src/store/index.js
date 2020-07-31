import Vue from 'vue'
import Vuex from 'vuex'
import { FeathersVuex } from '@/feathers-client'
import auth from './store.auth'

import apiKeys from './services/api-keys'
import users from './services/users'

Vue.use(Vuex)
Vue.use(FeathersVuex)

export default new Vuex.Store({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  plugins: [
    auth,
    apiKeys,
    users
  ]
})
