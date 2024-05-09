<template>
  <tr>
    <th>{{ reasonText }}</th>
    <td>{{ incident.keyword }}</td>
    <td class="incident-location">
      {{ incident.location ? [incident.location.district || incident.location.municipality, incident.location.street].join('\n').trim() : '' }}
    </td>
    <td class="has-text-right">
      {{ incident.time | moment('LLL') }}
    </td>
    <td class="is-narrow">
      <div class="field is-grouped">
        <p class="control">
          <button
            class="button is-outlined"
            title="Einsatz bearbeiten"
            @click="$router.push({ name: 'incident-form', params: { id: incident.id } })"
          >
            <span class="icon"><font-awesome-icon icon="edit" /></span>
            <span>Bearbeiten</span>
          </button>
        </p>
      </div>
    </td>
  </tr>
</template>
<script>
export default {
  name: 'IncidentListRow',
  props: {
    incident: {
      type: Object,
      required: true
    }
  },
  computed: {
    reasonText() {
      const reason = this.incident.reason || ''
      switch (this.incident.status) {
      case 'Exercise':
        return `Übung: ${reason}`
      case 'Test':
        return reason ? `Probealarm: ${reason}` : 'Probealarm'
      default:
        return reason
      }
    }
  }
}
</script>
<style scoped>
.incident-location {
    white-space: pre-line;
}
</style>
