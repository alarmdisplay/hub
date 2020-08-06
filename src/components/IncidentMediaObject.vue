<template>
    <div class="media-content">
        <div class="content">
            <p>
                <span class="tag is-danger">{{ incident.keyword }}</span>&nbsp;<strong>{{ incident.reason
                }}</strong><br>
                <span>{{ incident.description }}</span><br>
                <small>{{ incident.time | moment("LLLL") }}</small>
            </p>
        </div>
    </div>
</template>
<script>
export default {
  name: 'IncidentMediaObject',
  props: {
    incident: {}
  }
}
</script>
