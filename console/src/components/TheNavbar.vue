<template>
  <nav
    class="navbar is-dark"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <span class="navbar-item has-text-weight-bold">
        Zentrale
      </span>

      <a
        ref="hamburger"
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        @click.prevent="toggleMenu"
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </a>
    </div>

    <div
      ref="navbarmenu"
      class="navbar-menu"
    >
      <div class="navbar-start">
        <router-link
          class="navbar-item is-tab"
          :to="{ name: 'overview' }"
          exact
        >
          <span class="icon"><font-awesome-icon icon="home" /></span>
          <span>&Uuml;bersicht</span>
        </router-link>

        <router-link
          class="navbar-item is-tab"
          :to="{ name: 'input' }"
        >
          <span class="icon"><font-awesome-icon icon="inbox" /></span>
          <span>Eingang</span>
        </router-link>

        <div class="navbar-item has-dropdown is-hoverable">
          <a
            class="navbar-link"
            tabindex="0"
          >
            <span class="icon"><font-awesome-icon icon="cogs" /></span>
            <span>Verarbeitung</span>
          </a>

          <div class="navbar-dropdown">
            <router-link
              class="navbar-item"
              :to="{ name: 'resource-list' }"
            >
              <span class="icon"><font-awesome-icon icon="truck" /></span>
              <span>Einsatzmittel</span>
            </router-link>
            <router-link
              class="navbar-item"
              :to="{ name: 'scheduled-alerts-list' }"
            >
              <span class="icon"><font-awesome-icon icon="bell-slash" /></span>
              <span>Geplante Alarmierungen</span>
            </router-link>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <a
            class="navbar-link"
            tabindex="0"
          >
            <span class="icon"><font-awesome-icon icon="paper-plane" /></span>
            <span>Ausgabe</span>
          </a>

          <div class="navbar-dropdown">
            <router-link
              class="navbar-item"
              :to="{ name: 'display' }"
            >
              <span class="icon"><font-awesome-icon icon="desktop" /></span>
              <span>Anzeige</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item has-dropdown is-hoverable">
          <a
            class="navbar-link"
            tabindex="0"
          >
            <span class="icon"><font-awesome-icon icon="wrench" /></span>
            <span>Administration</span>
          </a>

          <div class="navbar-dropdown">
            <router-link
              class="navbar-item"
              :to="{ name: 'settings' }"
            >
              <span class="icon"><font-awesome-icon icon="cog" /></span>
              <span>Einstellungen</span>
            </router-link>

            <hr class="navbar-divider">

            <router-link
              class="navbar-item"
              to="/admin/users"
            >
              <span class="icon"><font-awesome-icon icon="user" /></span>
              <span>Konten</span>
            </router-link>
            <router-link
              class="navbar-item"
              to="/admin/api-keys"
            >
              <span class="icon"><font-awesome-icon icon="key" /></span>
              <span>API-Keys</span>
            </router-link>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <a
            class="navbar-link"
            tabindex="0"
          >
            <span class="icon"><font-awesome-icon icon="question-circle" /></span>
            <span>Hilfe</span>
          </a>

          <div class="navbar-dropdown">
            <router-link
              class="navbar-item"
              to="/about"
            >
              <span class="icon"><font-awesome-icon icon="info-circle" /></span>
              <span>&Uuml;ber</span>
            </router-link>
          </div>
        </div>

        <div class="navbar-item has-dropdown is-hoverable">
          <a
            class="navbar-link"
            tabindex="0"
          >
            <span class="icon"><font-awesome-icon icon="user" /></span>
            <span>{{ displayName }}</span>
            <span
              v-if="isSessionAboutToExpire"
              class="tag is-warning ml-2 has-text-weight-bold"
              style="width: 6em"
            >
              <span class="icon"><font-awesome-icon icon="stopwatch" /></span>
              {{ remainingSecondsForSession | durationAsDigits }}
            </span>
          </a>

          <div class="navbar-dropdown">
            <div
              v-if="isSessionAboutToExpire"
              class="navbar-item has-background-warning"
              style="white-space: normal"
            >
              <p>Die Sitzung läuft in Kürze ab. Sie kann durch Ab- und wieder Anmelden erneuert werden.</p>
            </div>

            <a
              class="navbar-item"
              @click="logout"
            >
              <span class="icon"><font-awesome-icon icon="sign-out-alt" /></span>
              <span>Abmelden</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'TheNavbar',
  computed: {
    displayName: function () {
      const currentUser = this.$store.getters['auth/user']
      if (!currentUser) {
        return 'Nicht eingeloggt'
      }

      return currentUser.displayName || '???'
    },
    isSessionAboutToExpire () {
      // Gets true 15 minutes before session expiration
      return this.remainingSecondsForSession < 900
    },
    remainingSecondsForSession () {
      const expiresAt = this.$store.getters['auth/expiresAt']
      if (!expiresAt) {
        return 0
      }

      return expiresAt - this.$root.$data.seconds
    }
  },
  watch: {
    remainingSecondsForSession (value) {
      // Automatically log out if the session has expired
      if (value <= 1) {
        this.logout()
      }
    }
  },
  methods: {
    logout() {
      this.$store.dispatch('auth/logout')
        .then(() => {
          // Reload the page to clear the data store
          window.location.reload()
        })
    },
    toggleMenu: function () {
      this.$refs.hamburger.classList.toggle('is-active')
      this.$refs.navbarmenu.classList.toggle('is-active')
    }
  }
}
</script>

<style scoped>

</style>
