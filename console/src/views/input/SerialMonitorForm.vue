<template>
  <section class="section">
    <div class="container">
      <h1 class="title">{{ id === 'new' ? 'Serielle Schnittstelle überwachen' : 'Überwachte serielle Schnittstelle bearbeiten' }}</h1>

      <div class="buttons is-left">
        <BackButton/>
      </div>

      <ErrorMessage :form-error="formError"/>

      <FeathersVuexFormWrapper :item="item" watch>
        <template v-slot="{ clone, save, reset, remove }">
          <SerialMonitorEditor
            :item="clone"
            @save="
              () => {
                $data.formError = null
                save()
                  .then(() => $router.push({name: 'input'}))
                  .catch(reason => { $data.formError = reason })
              }"
            @reset="reset"
            @remove="
              () => {
                $data.formError = null
                remove()
                  .then(() => $router.push({name: 'input'}))
                  .catch(reason => { $data.formError = reason })
              }
            "
          ></SerialMonitorEditor>
        </template>
      </FeathersVuexFormWrapper>
    </div>
  </section>
</template>

<script>
import BackButton from '@/components/BackButton'
import ErrorMessage from '@/components/ErrorMessage'
import SerialMonitorEditor from '@/components/SerialMonitorEditor'
export default {
  name: 'SerialMonitorForm',
  components: { BackButton, ErrorMessage, SerialMonitorEditor },
  computed: {
    id() {
      return this.$route.params.id
    },
    item() {
      const { SerialMonitor } = this.$FeathersVuex.api
      // Get the serial monitor for the given ID or create a new one if the ID is 'new'
      return this.id === 'new' ? new SerialMonitor() : SerialMonitor.getFromStore(this.id)
    },
  },
  data: function () {
    return {
      formError: null
    }
  },
  watch: {
    id: {
      handler(value) {
        if (value === 'new') {
          return
        }
        const { SerialMonitor } = this.$FeathersVuex.api
        const existingRecord = SerialMonitor.getFromStore(value)

        // If the record was not in the store, we have to fetch it from the server
        if (!existingRecord) {
          SerialMonitor.get(value)
        }
      },
      immediate: true // Run this handler when the component is created
    }
  }
}
</script>
