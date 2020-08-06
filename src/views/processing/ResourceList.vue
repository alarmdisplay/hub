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
                <ul slot-scope="{ items: resources }">
                    <li v-for="resource in resources" :key="resource.id">
                        <ResourceCard :resource="resource"/>
                    </li>
                </ul>
            </FeathersVuexFind>
        </div>
    </section>
</template>

<script>
  import ResourceCard from '@/components/ResourceCard'
  export default {
    name: 'WatchedFolderList',
    components: { ResourceCard },
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
