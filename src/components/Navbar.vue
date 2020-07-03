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
                <a class="navbar-item">
                    Home
                </a>

                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        Administration
                    </a>

                    <div class="navbar-dropdown">
                        <a class="navbar-item">
                            Konten
                        </a>
                    </div>
                </div>
            </div>

            <div class="navbar-end">
                <div class="navbar-item has-dropdown is-hoverable">
                    <a class="navbar-link">
                        Vorname Nachname
                    </a>

                    <div class="navbar-dropdown">
                        <a class="navbar-item">
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
