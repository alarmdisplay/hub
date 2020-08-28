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
        <div class="columns">
            <div class="column is-one-third">
                <strong>Alarmzeit:</strong> {{ incident.time | moment('LLL') }} Uhr
            </div>
            <div class="column is-one-third">
                <strong>Gemeldet von:</strong> {{ incident.caller_name }}
                <span v-if="incident.caller_number">({{ incident.caller_number }})</span>
            </div>
            <div class="column is-one-third">
                <strong>Absender:</strong> {{ incident.sender }}<br>
                <strong>Referenz:</strong> {{ incident.ref }}
            </div>
        </div>
        <p>
            <strong>Einsatzort:</strong> {{ locationText || '-/-'}}
        </p>
        <p>
            <strong>Freitext:</strong> {{ incident.description || '-/-' }}
        </p>
    </article>
</template>

<script>
export default {
  name: "IncidentDetails",
  computed: {
    locationText () {
      if (!this.incident.location) {
        return undefined
      }

      return this.incident.location.rawText
    }
  },
  props: {
    incident: Object
  }
}
</script>

<style scoped>

</style>
