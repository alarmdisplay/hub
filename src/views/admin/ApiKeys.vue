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
                <button class="delete" @click="$store.commit('api-keys/clearCreatedApiKey')"></button>
                <p><strong>API-Key erzeugt</strong></p>
                <p class="is-family-code">{{ createdApiKey }}</p>
                <p>Dieser Key kann später nicht erneut angezeigt werden und sollte deshalb sofort notiert und sicher verwahrt werden.</p>
            </div>

            <FeathersVuexFind service="api-keys" :query="{}" qid="apiKeyList" watch="query">
                <table class="table" slot-scope="{ items: apiKeys }">
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
            </FeathersVuexFind>

            <div ref="new_apikey_modal" class="modal">
                <div class="modal-background"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">API-Key erzeugen</p>
                        <button class="delete" type="button" aria-label="close" @click="closeModal"></button>
                    </header>
                    <section class="modal-card-body">
                        <article class="message is-danger" v-if="$store.state['api-keys'].errorOnCreate">
                            <div class="message-body">
                                {{ $store.state['api-keys'].errorOnCreate.message }}
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
  export default {
    name: 'ApiKeys',
    data() {
      return {
        newApiKey: {
          name: ''
        }
      }
    },
    computed: {
      createdApiKey: function () {
        return this.$store.state['api-keys'].createdApiKey
      }
    },
    methods: {
      closeModal: function () {
        this.$refs.new_apikey_modal.classList.remove('is-active')
        this.resetNewApiKey()
      },
      createApiKey: function () {
        this.$store.commit('api-keys/clearError', 'create')
        this.$store.dispatch('api-keys/create', { name: this.newApiKey.name })
          .then(() => {
            this.closeModal()
          })
          .catch(() => {
            // Do nothing, the error is handled by feathers-vuex
          })
      },
      removeApiKey: function (id) {
        if (!id) {
          return
        }

        this.$store.dispatch('api-keys/remove', id)
      },
      resetNewApiKey: function () {
        this.newApiKey.name = ''
      }
    }
  }
</script>

<style scoped>

</style>
