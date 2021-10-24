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
                    <template v-for="incident in incidents">
                        <tr :key="incident.id">
                            <th>{{ incident.reason }}</th>
                            <td>{{ incident.keyword }}</td>
                            <td class="incident-location">{{ incident.location ? [incident.location.locality, incident.location.street].join('\n').trim() : '' }}</td>
                            <td class="has-text-right">{{ incident.time | moment('LLL') }}</td>
                            <td class="is-narrow">
                                <div class="field is-grouped">
                                    <p class="control">
                                        <button class="button is-outlined" title="Einsatz bearbeiten" @click="$router.push({ name: 'incident-form', params: { id: incident.id } })">
                                            <span class="icon">
                                                <font-awesome-icon icon="edit"/>
                                            </span>
                                            <span>Bearbeiten</span>
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
  export default {
    name: 'IncidentList',
    components: {}
  }
</script>

<style scoped>
.incident-location {
    white-space: pre-line;
}
</style>
