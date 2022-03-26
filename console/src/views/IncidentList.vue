<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Eins&auml;tze</h1>

      <div class="buttons">
        <router-link class="button" to="new" append>
          <span class="icon"><font-awesome-icon icon="plus"/></span>
          <span>Einsatz anlegen</span>
        </router-link>
      </div>

      <FeathersVuexPagination v-model="pagination" :latest-query="latestQuery">
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

      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>Einsatzgrund</th>
            <th>Stichwort</th>
            <th>Einsatzort</th>
            <th class="has-text-right">Alarmzeitpunkt</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <IncidentListRow v-for="incident in incidents" :key="incident.id" :incident="incident"/>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script>
import IncidentListRow from '@/components/IncidentListRow'
import PaginationUI from '@/components/PaginationUI'
import { computed, ref } from '@vue/composition-api'
import { models, useFind, FeathersVuexPagination } from 'feathers-vuex'

export default {
  name: 'IncidentList',
  components: { FeathersVuexPagination, IncidentListRow, PaginationUI },
  setup() {
    const { Incident } = models.api

    const pagination = ref({
      $limit: 10,
      $skip: 0
    })

    const params = computed(() => {
      const query = { $sort: { time: -1 } }
      Object.assign(query, pagination.value)
      return { query, qid: 'incidentList', paginate: true }
    })

    const data = useFind({ model: Incident, params: params })
    const { items: incidents, latestQuery } = data

    return { incidents, pagination, latestQuery }
  }
}
</script>

