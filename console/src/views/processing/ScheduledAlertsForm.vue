<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Geplante Alarmierung {{ id === 'new' ? 'anlegen' : 'bearbeiten' }}
      </h1>

      <div class="buttons is-left">
        <BackButton />
      </div>

      <ErrorMessage :form-error="formError" />

      <FeathersVuexFormWrapper
        v-if="item"
        :item="item"
        :watch="false"
        :eager="false"
      >
        <template #default="{ clone, save, reset, remove }">
          <ScheduledAlertEditor
            :item="clone"
            @save="
              () => {
                $data.formError = null
                save()
                  .then(() => $router.push({name: 'scheduled-alerts-list'}))
                  .catch(reason => { $data.formError = reason })
              }"
            @reset="reset"
            @remove="
              () => {
                $data.formError = null
                remove()
                  .then(() => $router.push({name: 'scheduled-alerts-list'}))
                  .catch(reason => { $data.formError = reason })
              }"
          />
        </template>
      </FeathersVuexFormWrapper>
    </div>
  </section>
</template>

<script>
import BackButton from '@/components/BackButton'
import ErrorMessage from '@/components/ErrorMessage'
import ScheduledAlertEditor from '@/components/ScheduledAlertEditor'

export default {
  name: 'ScheduledAlertsForm',
  components: { ScheduledAlertEditor, ErrorMessage, BackButton },
  data: function () {
    const { ScheduledAlert } = this.$FeathersVuex.api
    return {
      formError: null,
      newItem : new ScheduledAlert()
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    item() {
      const { ScheduledAlert } = this.$FeathersVuex.api
      // Get the ScheduledAlert for the given ID or create a new one if the ID is 'new'
      return this.id === 'new' ? this.newItem : ScheduledAlert.getFromStore(this.id)
    },
  },
  watch: {
    id: {
      handler(value) {
        if (value === 'new') {
          return
        }
        const { ScheduledAlert } = this.$FeathersVuex.api
        const existingRecord = ScheduledAlert.getFromStore(value)

        // If the record was not in the store, we have to fetch it from the server
        if (!existingRecord) {
          ScheduledAlert.get(value)
        }
      },
      immediate: true // Run this handler when the component is created
    }
  }
}
</script>
