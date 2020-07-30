<template>
    <section class="section">
        <div class="container">
            <h1 class="title">API-Keys</h1>
            <button class="button" type="button" @click="$refs.new_apikey_modal.classList.add('is-active')">
                <span class="icon">
                    <font-awesome-icon icon="plus"/>
                </span>
                <span>API-Key erzeugen</span>
            </button>

            <div class="notification is-success" v-if="createdApiKey">
                <button class="delete" @click="createdApiKey = null"></button>
                <p><strong>API-Key erzeugt</strong></p>
                <p class="is-family-code">{{createdApiKey.id}}:{{ createdApiKey.token }}</p>
                <p>Dieser Key kann später nicht erneut angezeigt werden und sollte deshalb sofort notiert und sicher verwahrt werden.</p>
            </div>

            <table class="table">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Angelegt am</th>
                    <th>Aktionen</th>
                </tr>
                </thead>
                <tbody>
                <template v-for="apiKey in apiKeys">
                    <tr :key="apiKey.id">
                        <th>{{ apiKey.name }}</th>
                        <td>{{ apiKey.createdAt }}</td>
                        <td>
                            <div class="buttons">
                                <button class="button is-danger is-outlined" title="API-Key widerrufen" @click="removeApiKey(apiKey.id)">
                                    <span class="icon">
                                        <font-awesome-icon icon="trash-alt"/>
                                    </span>
                                    <span>Widerrufen</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
                </tbody>
            </table>

            <div ref="new_apikey_modal" class="modal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">API-Key erzeugen</p>
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
                        <form @submit.prevent="createApiKey">
                            <div class="field">
                                <label class="label" for="name">
                                    Name
                                </label>
                                <p class="control">
                                    <input class="input" type="text" id="name" v-model="newApiKey.name">
                                </p>
                            </div>
                            <div class="buttons is-right">
                                <button class="button" type="button" @click="closeModal">Cancel</button>
                                <button class="button is-success" type="submit" :disabled="newApiKey.name === ''">Anlegen</button>
                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
  import api from '../../api/api-keys'

  export default {
    name: 'ApiKeys',
    data() {
      return {
        apiKeys: [],
        createdApiKey: null,
        createErrors: [],
        newApiKey: {
          name: ''
        }
      }
    },
    created () {
      this.getApiKeys()
    },
    methods: {
      closeModal: function () {
        this.$refs.new_apikey_modal.classList.remove('is-active')
        this.resetNewApiKey()
        this.createErrors = []
      },
      createApiKey: function () {
        this.createErrors = []
        api.create(this.newApiKey.name)
          .then(apiKey => {
            console.log('response', apiKey)

            // Create a copy of the new key for one-time display
            this.createdApiKey = {
              id: apiKey.id,
              token: apiKey.token
            }

            // Store the new key without the token
            delete apiKey.token
            this.apiKeys.push(apiKey)

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
      getApiKeys: function () {
        api.find()
          .then(response => {
            this.apiKeys = response.data
          })
          .catch(reason => {
            console.error('Could not get API keys', reason)
          })
      },
      removeApiKey: function (id) {
        if (!id) {
          return
        }

        api.remove(id)
          .then(removedApiKey => {
            this.apiKeys = this.apiKeys.filter(apiKey => apiKey.id !== removedApiKey.id)
          })
          .catch(reason => {
            console.error('Could not delete API key', reason)
          })
      },
      resetNewApiKey: function () {
        this.newApiKey.name = ''
      }
    },
    watch: {
      '$route': 'getApiKeys'
    }
  }
</script>

<style scoped>

</style>
