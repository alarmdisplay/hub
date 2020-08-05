import Vue from 'vue'
import Vuex from 'vuex'
import { FeathersVuex } from '@/feathers-client'
import auth from './store.auth'

import apiKeys from './services/api-keys'
import incidents from './services/incidents'
import resources from './services/resources'
import users from './services/users'
import watchedFolders from './services/watched-folders'

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
    incidents,
    resources,
    users,
    watchedFolders
  ]
})
