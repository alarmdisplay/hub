<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Einsatzmittel
      </h1>

      <div class="content">
        Hier konfigurierte Einsatzmittel werden in den eingehenden Alarmen identifiziert und den Einsätzen zugeordnet.
      </div>

      <div class="buttons">
        <router-link
          class="button"
          to="new"
          append
        >
          <span class="icon"><font-awesome-icon icon="plus" /></span>
          <span>Einsatzmittel anlegen</span>
        </router-link>
      </div>

      <FeathersVuexPagination
        v-model="pagination"
        :latest-query="latestQuery"
      >
        <template #default="{ currentPage, pageCount, next, prev, canNext, canPrev }">
          <PaginationUI
            :current-page="currentPage"
            :page-count="pageCount"
            :can-prev="canPrev"
            :can-next="canNext"
            @next="next"
            @prev="prev"
          />
        </template>
      </FeathersVuexPagination>

      <ul>
        <li
          v-for="resource in resources"
          :key="resource.id"
        >
          <ResourceCard :resource="resource" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import PaginationUI from '@/components/PaginationUI'
import ResourceCard from '@/components/ResourceCard'
import { models, useFind } from 'feathers-vuex'
import { computed, ref } from '@vue/composition-api'

export default {
  name: 'ResourceList',
  components: { ResourceCard, PaginationUI },
  setup() {
    const { Resource } = models.api

    const pagination = ref({
      $limit: 10,
      $skip: 0
    })

    const params = computed(() => {
      const query = { $sort: { name: 1 } }
      Object.assign(query, pagination.value)
      return { query, qid: 'resourceList', paginate: true }
    })

    const data = useFind({ model: Resource, params: params })
    const { items: resources, latestQuery } = data

    return { resources, pagination, latestQuery }
  }
}
</script>

<style scoped>

</style>
