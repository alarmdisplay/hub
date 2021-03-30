import Vue from 'vue'
import Vuex from 'vuex'
import feathersClient, { FeathersVuex } from '@/feathers-client'
import auth from './store.auth'

import apiKeys from './services/api-keys'
import incidents from './services/incidents'
import locations from './services/locations'
import printTasks from './services/print-tasks'
import resourceIdentifiers from './services/resource-identifiers'
import resources from './services/resources'
import textAnalysis from './services/text-analysis'
import users from './services/users'
import watchedFolders from './services/watched-folders'
import socket, { createSocketPlugin } from '@/store/socket'

Vue.use(Vuex)
Vue.use(FeathersVuex)

export default new Vuex.Store({
  state: {
    showSetup: false
  },
  mutations: {
    setShowSetup (state, value) {
      state.showSetup = value === true
    }
  },
  actions: {
  },
  modules: {
    socket
  },
  plugins: [
    auth,
    createSocketPlugin(feathersClient.io),
    apiKeys,
    incidents,
    locations,
    printTasks,
    resourceIdentifiers,
    resources,
    textAnalysis,
    users,
    watchedFolders
  ]
})
