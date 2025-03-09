<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Einsatz {{ id === 'new' ? 'anlegen' : 'bearbeiten' }}
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
          <IncidentEditor
            :item="clone"
            @save="
              () => {
                $data.formError = null
                save()
                  .then(() => $router.push({name: 'incident-list'}))
                  .catch(reason => { $data.formError = reason })
              }"
            @reset="reset"
            @remove="
              () => {
                $data.formError = null
                remove()
                  .then(() => $router.push({name: 'incident-list'}))
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
import IncidentEditor from '@/components/IncidentEditor'

export default {
  name: 'IncidentForm',
  components: { IncidentEditor, ErrorMessage, BackButton },
  data: function () {
    const { Incident } = this.$FeathersVuex.api
    return {
      formError: null,
      newItem : new Incident()
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    item() {
      const { Incident } = this.$FeathersVuex.api
      // Get the Incident for the given ID or create a new one if the ID is 'new'
      return this.id === 'new' ? this.newItem : Incident.getFromStore(this.id)
    },
  },
  watch: {
    id: {
      handler(value) {
        if (value === 'new') {
          return
        }
        const { Incident } = this.$FeathersVuex.api
        const existingRecord = Incident.getFromStore(value)

        // If the record was not in the store, we have to fetch it from the server
        if (!existingRecord) {
          Incident.get(value)
        }
      },
      immediate: true // Run this handler when the component is created
    }
  }
}
</script>
