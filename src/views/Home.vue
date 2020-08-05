<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Letzte Einsätze</h1>
            <FeathersVuexFind service="incidents" :query="{ $limit: 5 }" qid="recentIncidents" watch="query">
                <ol class="" slot-scope="{ items: incidents }">
                    <li class="media" v-for="incident in incidents" :key="incident.id">
                        <div class="media-content">
                            <div class="content">
                                <p>
                                    <span class="tag is-danger">{{ incident.keyword }}</span>&nbsp;<strong>{{ incident.reason }}</strong><br>
                                    <span>{{ incident.description }}</span><br>
                                    <small>{{ incident.time }}</small>
                                </p>
                            </div>
                        </div>
                    </li>
                </ol>
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
