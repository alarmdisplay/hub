<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Letzte Einsätze</h1>
            <FeathersVuexFind service="incidents" :query="{ $limit: 5 }" qid="recentIncidents" watch="query">
                <table class="table is-fullwidth" slot-scope="{ items: incidents }">
                    <thead>
                    <tr>
                        <th>Einsatzgrund</th>
                        <th>Stichwort</th>
                        <th>Kategorie</th>
                        <th>Uhrzeit</th>
                    </tr>
                    </thead>
                    <tbody>
                    <template v-for="incident in incidents">
                        <tr :key="incident.id">
                            <th>{{ incident.reason }}</th>
                            <th>{{ incident.keyword }}</th>
                            <th>{{ incident.category }}</th>
                            <td>{{ incident.time }}</td>
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
  name: 'Home',
  components: {}
}
</script>
