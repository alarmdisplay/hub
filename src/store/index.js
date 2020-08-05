import Vue from 'vue'
import Vuex from 'vuex'
import { FeathersVuex } from '@/feathers-client'
import auth from './store.auth'

import apiKeys from './services/api-keys'
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
    resources,
    users,
    watchedFolders
  ]
})
