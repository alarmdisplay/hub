<template>
  <article class="content">
    <p class="is-size-4">
      <span :class="['tag', 'is-warning is-medium', incident.keyword ? '' : 'is-light']">
        {{ incident.keyword || '?' }}
      </span>&nbsp;
      <strong>
        {{ incident.reason || 'Grund unbekannt' }}
      </strong>
    </p>
    <p v-if="incident.description !== ''">
      {{ incident.description }}
    </p>
    <small :class="[isRecent ? 'has-text-danger has-text-weight-bold' : '']">
      {{ incident.time | moment('from', 'now') }}
    </small>
  </article>
</template>

<script>
export default {
  name: "IncidentSummary",
  props: {
    incident: {
      type: Object,
      required: true
    }
  },
  computed: {
    isRecent: function () {
      // Check if the incident began within the last hour
      return Date.now() - this.incident.time.getTime() < 3600000
    }
  }
}
</script>

<style scoped>

</style>
