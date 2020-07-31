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

            <FeathersVuexFind service="users" :query="{}" qid="userList" watch="query">
                <table class="table" slot-scope="{ items: users }">
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
                                    <button class="button is-danger is-outlined" title="Konto entfernen" :disabled="user.id === $store.getters['auth/user'].id">
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
            </FeathersVuexFind>

            <div ref="new_user_modal" class="modal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">Konto anlegen</p>
                        <button class="delete" type="button" aria-label="close" @click="closeModal"></button>
                    </header>
                    <section class="modal-card-body">
                        <article class="message is-danger" v-if="$store.state['users'].errorOnCreate">
                            <div class="message-body">
                                {{ $store.state['users'].errorOnCreate.message }}
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
                                    <input class="input" type="password" id="password" autocomplete="new-password" v-model="newUser.password">
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
  export default {
    name: 'Users',
    data() {
      return {
        newUser: {
          email: '',
          password: ''
        }
      }
    },
    methods: {
      closeModal: function () {
        this.$refs.new_user_modal.classList.remove('is-active')
        this.resetNewUser()
      },
      createUser: function () {
        this.$store.commit('users/clearError', 'create')
        this.$store.dispatch('users/create', { email: this.newUser.email, password: this.newUser.password })
          .then(() => {
            this.closeModal()
          })
          .catch(() => {
            // Do nothing, the error is handled by feathers-vuex
          })
      },
      removeUser: function (id) {
        if (!id) {
          return
        }

        this.$store.dispatch('users/remove', id)
      },
      resetNewUser: function () {
        this.newUser.email = ''
        this.newUser.password = ''
      }
    }
  }
</script>

<style scoped>

</style>
