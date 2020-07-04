<template>
  <div id="app">
    <Navbar v-if="loggedIn"/>
    <router-view v-if="loggedIn"/>
    <Login v-else/>
  </div>
</template>

<script>
import 'bulma/css/bulma.css'
import Navbar from './components/Navbar'
import Login from './views/Login'
export default {
  name: 'App',
  components: {
    Login,
    Navbar
  },
  computed: {
    loggedIn: function () {
      return this.$store.state.user.currentUser !== null
    }
  }
}
</script>

<style>
</style>
