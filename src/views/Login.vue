<template>
    <section class="section">
        <div class="container">
            <h1 class="title">
                Login
            </h1>
            <p class="subtitle">
                Bitte einloggen
            </p>
            <form @submit.prevent="login">
                <div class="field">
                    <label class="label" for="email">E-Mail</label>
                    <div class="control">
                        <input class="input" type="email" id="email" placeholder="E-Mail" v-model="email">
                    </div>
                    <p class="help">This is a help text</p>
                </div>

                <label for="password">
                    Password
                </label>
                <input type="password" id="password" v-model="password">

                <button type="submit">Login</button>
            </form>
        </div>
    </section>
</template>

<script>
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: ''
      }
    },
    methods: {
      login: function () {
        this.$store.dispatch('user/login', { email: this.email, password: this.password })
      }
    }
  }
</script>

<style scoped>

</style>
