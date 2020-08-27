<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Letzte Einsätze</h1>
            <FeathersVuexFind service="incidents" :query="{ $limit: 3, $sort: { time: -1 } }" qid="recentIncidents" watch="query">
                <ol class="" slot-scope="{ items: incidents }">
                    <li class="media" v-for="incident in incidents" :key="incident.id">
                        <IncidentMediaObject :incident="incident"/>
                    </li>
                </ol>
            </FeathersVuexFind>
        </div>
    </section>
</template>

<script>

import IncidentMediaObject from '@/components/IncidentMediaObject'

export default {
  name: 'Home',
  components: { IncidentMediaObject }
}
</script>
