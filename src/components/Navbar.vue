<template>
    <nav class="navbar is-dark" role="navigation" aria-label="main navigation">
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
                    <span class="icon"><font-awesome-icon icon="home"/></span>
                    <span>Home</span>
                </router-link>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="inbox"/></span>
                        <span>Alarmeingang</span>
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" to="/input/watched-folders">
                            <span class="icon"><font-awesome-icon icon="folder"/></span>
                            <span>&Uuml;berwachte Ordner</span>
                        </router-link>
                        <router-link tag="a" class="navbar-item" :to="{ name: 'ocr' }">
                            <span class="icon"><font-awesome-icon icon="file-alt"/></span>
                            <span>Texterkennung</span>
                        </router-link>
                    </div>
                </div>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="cogs"/></span>
                        <span>Verarbeitung</span>
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" :to="{ name: 'resource-list' }">
                            <span class="icon"><font-awesome-icon icon="truck"/></span>
                            <span>Einsatzmittel</span>
                        </router-link>
                    </div>
                </div>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="paper-plane"/></span>
                        <span>Weiterleitung</span>
                    </a>

                    <div class="navbar-dropdown">
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="wrench"/></span>
                        <span>Administration</span>
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" to="/admin/users">
                            <span class="icon"><font-awesome-icon icon="user"/></span>
                            <span>Konten</span>
                        </router-link>
                        <router-link tag="a" class="navbar-item" to="/admin/api-keys">
                            <span class="icon"><font-awesome-icon icon="key"/></span>
                            <span>API-Keys</span>
                        </router-link>
                    </div>
                </div>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="question-circle"/></span>
                        <span>Hilfe</span>
                    </a>

                    <div class="navbar-dropdown">
                        <router-link tag="a" class="navbar-item" to="/about">
                            <span class="icon"><font-awesome-icon icon="info-circle"/></span>
                            <span>&Uuml;ber</span>
                        </router-link>
                    </div>
                </div>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        <span class="icon"><font-awesome-icon icon="user"/></span>
                        <span>{{ displayName }}</span>
                    </a>

                    <div class="navbar-dropdown">
                        <a class="navbar-item" @click="$store.dispatch('auth/logout')">
                            <span class="icon"><font-awesome-icon icon="sign-out-alt"/></span>
                            <span>Logout</span>
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
