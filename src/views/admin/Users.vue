<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Konten</h1>
            <button class="button" type="button" @click="$refs.new_user_modal.classList.add('is-active')">
                <span class="icon">
                    <font-awesome-icon icon="user-plus"/>
                </span>
                <span>Konto anlegen</span>
            </button>
            <table class="table">
                <thead>
                <tr>
                    <th>Email</th>
                    <th>Angelegt am</th>
                    <th>Aktionen</th>
                </tr>
                </thead>
                <tbody>
                <template v-for="user in users">
                    <tr :key="user.id">
                        <th>{{ user.email }}</th>
                        <td>{{ user.createdAt }}</td>
                        <td>
                            <div class="buttons">
                                <button class="button is-danger is-outlined" title="Konto entfernen" :disabled="user.id === $store.state.user.currentUser.id">
                                    <span class="icon" @click="removeUser(user.id)">
                                        <font-awesome-icon icon="user-minus"/>
                                    </span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
                </tbody>
            </table>

            <div ref="new_user_modal" class="modal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Konto anlegen</p>
                        <button class="delete" type="button" aria-label="close" @click="closeModal"></button>
                    </header>
                    <section class="modal-card-body">
                        <article class="message is-danger" v-if="createErrors.length > 0">
                            <div class="message-body">
                                <ul>
                                    <li v-for="error in createErrors" :key="error">{{ error }}</li>
                                </ul>
                            </div>
                        </article>
                        <form @submit.prevent="createUser">
                            <div class="field">
                                <label class="label" for="email">
                                    E-Mail
                                </label>
                                <p class="control">
                                    <input class="input" type="email" id="email" v-model="newUser.email">
                                </p>
                            </div>
                            <div class="field">
                                <label class="label" for="password">
                                    Passwort
                                </label>
                                <p class="control">
                                    <input class="input" type="password" id="password" v-model="newUser.password">
                                </p>
                            </div>
                            <div class="buttons is-right">
                                <button class="button" type="button" @click="closeModal">Cancel</button>
                                <button class="button is-success" type="submit" :disabled="newUser.password === '' || newUser.email === ''">Anlegen</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
  import api from '../../api/users'

  export default {
    name: 'Users',
    data() {
      return {
        createErrors: [],
        newUser: {
          email: '',
          password: ''
        },
        users: []
      }
    },
    created () {
      this.getUsers()
    },
    methods: {
      closeModal: function () {
        this.$refs.new_user_modal.classList.remove('is-active')
        this.resetNewUser()
        this.createErrors = []
      },
      createUser: function () {
        this.createErrors = []
        api.create(this.newUser.email, this.newUser.password)
          .then(user => {
            this.users.push(user)
            this.closeModal()
          })
          .catch(reason => {
            if (reason.type === 'FeathersError') {
              if (reason.errors.length > 0) {
                this.createErrors = reason.errors.map(error => error.message)
              } else {
                this.createErrors = [reason.message]
              }
            } else {
              this.createErrors = [reason.toString()]
            }
          })
      },
      getUsers: function () {
        api.find()
          .then(response => {
            this.users = response.data
          })
          .catch(reason => {
            console.error('Could not get users', reason)
          })
      },
      removeUser: function (id) {
        if (!id) {
          return
        }

        api.remove(id)
          .then(removedUser => {
            this.users = this.users.filter(user => user.id !== removedUser.id)
          })
          .catch(reason => {
            console.error('Could not delete user', reason)
          })
      },
      resetNewUser: function () {
        this.newUser.email = ''
        this.newUser.password = ''
      }
    },
    watch: {
      '$route': 'getUsers'
    }
  }
</script>

<style scoped>

</style>
