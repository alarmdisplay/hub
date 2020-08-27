<template>
  <div id="app">
    <Navbar v-if="loggedIn"/>
    <router-view v-if="loggedIn"/>
    <Setup v-else-if="$store.state.showSetup"/>
    <Login v-else/>
  </div>
</template>

<script>
import 'bulma/css/bulma.css'
import Navbar from './components/Navbar'
import Login from './views/Login'
import Setup from '@/views/Setup'

export default {
  name: 'App',
  components: {
    Setup,
    Login,
    Navbar
  },
  computed: {
    loggedIn: function () {
      return this.$store.getters['auth/isAuthenticated']
    }
  },
  created () {
    // Check if we have a valid authentication token
    this.$store.dispatch('auth/authenticate')
  }
}
</script>

<style>
</style>
