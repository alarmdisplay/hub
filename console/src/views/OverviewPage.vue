<template>
  <section class="section">
    <div class="container">
      <div class="level">
        <div class="level-left">
          <h1 class="title level-item">
            Letzte Einsätze
          </h1>
        </div>
        <div class="level-right">
          <div class="buttons level-item">
            <router-link
              class="button"
              :to="{ name: 'incident-form', params: { id: 'new' } }"
            >
              <span class="icon"><font-awesome-icon icon="plus" /></span>
              <span>Einsatz anlegen</span>
            </router-link>
            <router-link
              class="button"
              :to="{ name: 'incident-list' }"
            >
              <span>Alle Eins&auml;tze</span>
              <span class="icon"><font-awesome-icon icon="chevron-right" /></span>
            </router-link>
          </div>
        </div>
      </div>
      <FeathersVuexFind
        v-slot="{ items: incidents }"
        service="incidents"
        :query="{ $limit: 3, $sort: { time: -1 } }"
        qid="recentIncidents"
        watch="query"
      >
        <ol class="">
          <li
            v-for="incident in incidents"
            :key="incident.id"
            class="box"
          >
            <IncidentMediaObject :incident="incident" />
          </li>
        </ol>
      </FeathersVuexFind>
    </div>
  </section>
</template>

<script>

import IncidentMediaObject from '@/components/IncidentMediaObject'

export default {
  name: 'OverviewPage',
  components: { IncidentMediaObject }
}
</script>
