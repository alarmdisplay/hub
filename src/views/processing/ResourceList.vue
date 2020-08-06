<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Einsatzmittel</h1>

            <div class="content">
                Hier konfigurierte Einsatzmittel werden in den eingehenden Alarmen identifiziert und den Einsätzen zugeordnet.
            </div>

            <div class="buttons">
                <router-link tag="button" type="button" class="button" to="new" append>
                    <span class="icon"><font-awesome-icon icon="plus"/></span>
                    <span>Einsatzmittel anlegen</span>
                </router-link>
            </div>

            <FeathersVuexFind service="resources" :query="{ $sort: { name: 1 }, $limit: 50 }" qid="resourceList" watch="query">
                <table class="table is-fullwidth" slot-scope="{ items: resources }">
                    <thead>
                    <tr>
                        <th>Typ</th>
                        <th>Name</th>
                        <th>Alternative Namen</th>
                        <th>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    <template v-for="resource in resources">
                        <tr :key="resource.id">
                            <td class="is-narrow">
                                <ResourceIcon :resource="resource"/>
                            </td>
                            <th>
                                {{ resource.name }}
                            </th>
                            <td>
                                <ul v-for="identifier in resource.identifiers" :key="identifier.id">
                                    <li>{{ identifier.value }}</li>
                                </ul>
                            </td>
                            <td class="is-narrow">
                                <div class="field is-grouped">
                                    <p class="control">
                                        <button class="button is-outlined" title="Einsatzmittel bearbeiten" @click="$router.push({ name: 'resource-form', params: { id: resource.id } })">
                                            <span class="icon">
                                                <font-awesome-icon icon="edit"/>
                                            </span>
                                            <span>Bearbeiten</span>
                                        </button>
                                    </p>
                                    <p class="control">
                                        <button class="button is-danger is-outlined" title="Einsatzmittel entfernen" @click="removeResource(resource.id)">
                                            <span class="icon">
                                                <font-awesome-icon icon="trash-alt"/>
                                            </span>
                                            <span>Entfernen</span>
                                        </button>
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </template>
                    </tbody>
                </table>
            </FeathersVuexFind>
        </div>
    </section>
</template>

<script>
  import ResourceIcon from '@/components/ResourceIcon'
  export default {
    name: 'WatchedFolderList',
    components: { ResourceIcon },
    methods: {
      removeResource: function (id) {
        if (!id) {
          return
        }

        this.$store.dispatch('resources/remove', id)
      }
    }
  }
</script>

<style scoped>

</style>
