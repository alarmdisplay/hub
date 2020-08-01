<template>
    <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <a role="button" ref="hamburger" class="navbar-burger burger" aria-label="menu" aria-expanded="false" @click.prevent="toggleMenu">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div ref="navbarmenu" class="navbar-menu">
            <div class="navbar-start">
                <router-link tag="a" class="navbar-item" to="/">
                    Home
                </router-link>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        Administration
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" to="/admin/users">
                            Konten
                        </router-link>
                        <router-link tag="a" class="navbar-item" to="/admin/api-keys">
                            API-Keys
                        </router-link>
                    </div>
                </div>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        Hilfe
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" to="/about">
                            &Uuml;ber
                        </router-link>
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        {{ displayName }}
                    </a>

                    <div class="navbar-dropdown">
                        <a class="navbar-item" @click="$store.dispatch('auth/logout')">
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
  export default {
    name: 'Navbar',
    computed: {
      displayName: function () {
        const currentUser = this.$store.getters['auth/user']
        if (!currentUser) {
          return 'Nicht eingeloggt'
        }

        return currentUser.displayName || '???'
      }
    },
    methods: {
      toggleMenu: function () {
        this.$refs.hamburger.classList.toggle('is-active')
        this.$refs.navbarmenu.classList.toggle('is-active')
      }
    }
  }
</script>

<style scoped>

</style>
