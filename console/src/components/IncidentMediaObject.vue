<template>
  <div class="media">
    <div class="media-content">
      <IncidentDetails
        v-if="showDetails"
        :incident="incident"
      />
      <IncidentSummary
        v-else
        :incident="incident"
      />
    </div>
    <div class="media-right">
      <div class="buttons">
        <button
          type="button"
          class="button"
          @click="showDetails = !showDetails"
        >
          <span>
            {{ showDetails ? 'Verstecke Details' : 'Zeige Details' }}
          </span>
          <span class="icon">
            <font-awesome-icon :icon="showDetails ? 'chevron-up' : 'chevron-down'" />
          </span>
        </button>
        <router-link
          class="button"
          :to="{ name: 'incident-form', params: { id: incident.id } }"
          title="Einsatz bearbeiten"
        >
          <span class="icon"><font-awesome-icon icon="edit" /></span>
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
import IncidentSummary from '@/components/IncidentSummary'
import IncidentDetails from '@/components/IncidentDetails'
export default {
  name: 'IncidentMediaObject',
  components: { IncidentDetails, IncidentSummary },
  props: {
    incident: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showDetails: false
    }
  }
}
</script>
