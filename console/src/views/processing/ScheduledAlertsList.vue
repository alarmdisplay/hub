<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Geplante Alarmierungen
      </h1>

      <div class="content">
        Im Voraus bekannte Alarmierungen wie Probealarme oder Übungen können hier eingetragen werden. Dadurch werden neue Einsätze in diesem Zeitraum nicht als tatsächliche Einsätze behandelt.
      </div>

      <div class="buttons">
        <router-link
          class="button"
          to="new"
          append
        >
          <span class="icon"><font-awesome-icon icon="plus" /></span>
          <span>Geplante Alarmierung anlegen</span>
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
          v-for="scheduledAlert in scheduledAlerts"
          :key="scheduledAlert.id"
        >
          <ScheduledAlertCard :scheduled-alert="scheduledAlert" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import PaginationUI from '@/components/PaginationUI'
import { models, useFind } from 'feathers-vuex'
import { computed, ref } from '@vue/composition-api'
import ScheduledAlertCard from '@/components/ScheduledAlertCard'

export default {
  name: 'ScheduledAlertsList',
  components: { ScheduledAlertCard, PaginationUI },
  setup() {
    const { ScheduledAlert } = models.api

    const pagination = ref({
      $limit: 10,
      $skip: 0
    })

    const params = computed(() => {
      const query = { $sort: { begin: 1 } }
      Object.assign(query, pagination.value)
      return { query, qid: 'scheduledAlertList', paginate: true }
    })

    const data = useFind({ model: ScheduledAlert, params: params })
    const { items: scheduledAlerts, latestQuery } = data

    return { scheduledAlerts, pagination, latestQuery }
  }
}
</script>

<style scoped>

</style>
