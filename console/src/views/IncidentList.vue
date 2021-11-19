<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Eins&auml;tze</h1>

            <div class="buttons">
                <router-link tag="button" type="button" class="button" to="new" append>
                    <span class="icon"><font-awesome-icon icon="plus"/></span>
                    <span>Einsatz anlegen</span>
                </router-link>
            </div>

            <FeathersVuexFind service="incidents" :query="{ $sort: { time: -1 }, $limit: 30 }" qid="incidentList" watch="query">
                <table class="table is-fullwidth" slot-scope="{ items: incidents }">
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
                        <IncidentListComponent v-for="incident in incidents" :key="incident.id" :incident="incident"/>
                    </tbody>
                </table>
            </FeathersVuexFind>
        </div>
    </section>
</template>

<script>
import IncidentListComponent from '@/components/IncidentListRow'

export default {
    name: 'IncidentList',
    components: { IncidentListComponent }
  }
</script>

