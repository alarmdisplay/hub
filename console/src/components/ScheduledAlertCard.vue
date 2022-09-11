<template>
  <div class="card mb-2">
    <div class="card-content">
      <article class="media">
        <div class="media-left">
          <font-awesome-icon
            icon="bell-slash"
            size="2x"
          />
        </div>
        <div class="media-content">
          <div class="content">
            <p>
              <span v-if="scheduledAlert.keyword" class="tag is-warning is-medium">
                {{ scheduledAlert.keyword || '?' }}
              </span>
              <span class="has-text-weight-bold">{{ title }}</span>
            </p>
            <p v-if="scheduledAlert.reason">
              Einsatzgrund: {{ scheduledAlert. reason }}
            </p>
          </div>
        </div>
        <div class="media-right">
          <router-link
            class="button"
            :to="{ name: 'scheduled-alerts-form', params: { id: scheduledAlert.id } }"
            title="Geplante Alarmierung bearbeiten"
          >
            <span class="icon">
              <font-awesome-icon icon="edit" />
            </span>
          </router-link>
        </div>
      </article>
      <div class="level">
        <div class="level-left">
          <small class="level-item">{{ validityInfo }}</small>
        </div>
        <div class="level-right">
          <small>Stand</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduledAlertCard',
  components: {},
  props: {
    scheduledAlert: {
      type: Object,
      required: true
    }
  },
  computed: {
    title() {
      switch (this.scheduledAlert.status) {
      case 'Test':
        return 'Probealarm'
      case 'Exercise':
        return 'Übung'
      default:
        return 'Unbekannt'
      }
    },
    validityInfo() {
      return `Zwischen ${this.$moment(this.scheduledAlert.begin).format('LLL')} Uhr und ${this.$moment(this.scheduledAlert.end).format('LLL')} Uhr`
    },
  },
}
</script>

<style>
.media-left {
    text-align: center;
    width: 40px;
}
</style>
