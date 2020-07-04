import api from '../../api/index'

// initial state
const state = () => ({
  currentUser: null
})

// getters
const getters = {}

// actions
const actions = {
  login ({ commit }, { email, password }) {
    console.log('Login')
    api.login(email, password)
      .then(response => {
        commit('setCurrentUser', response.user)
      })
      .catch(reason => {
        console.error('Login failed', reason)
      })
  },
  logout ({ commit }) {
    console.log('Logout...')
    api.logout()
      .then(() => {
        console.log('Logout successful')
        commit('setCurrentUser', null)
      })
  }
}

// mutations
const mutations = {
  setCurrentUser (state, user) {
    state.currentUser = user
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
