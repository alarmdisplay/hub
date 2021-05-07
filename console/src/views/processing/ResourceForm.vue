<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Einsatzmittel {{ id === 'new' ? 'anlegen' : 'bearbeiten' }}</h1>

            <div class="buttons is-left">
                <BackButton/>
            </div>

            <ErrorMessage :form-error="formError"/>

            <FeathersVuexFormWrapper v-if="item" :item="item" watch>
                <template v-slot="{ clone, save, reset, remove }">
                    <ResourceEditor
                        :item="clone"
                        @save="
                        () => {
                          $data.formError = null
                          save()
                            .then(() => $router.push({name: 'resource-list'}))
                            .catch(reason => { $data.formError = reason })
                        }"
                        @reset="reset"
                        @remove="
                        () => {
                          $data.formError = null
                          remove()
                            .then(() => $router.push({name: 'resource-list'}))
                            .catch(reason => { $data.formError = reason })
                        }"
                    ></ResourceEditor>
                </template>
            </FeathersVuexFormWrapper>
        </div>
    </section>
</template>

<script>
import BackButton from '@/components/BackButton'
import ErrorMessage from '@/components/ErrorMessage'
import ResourceEditor from '@/components/ResourceEditor'

export default {
name: 'ResourceForm',
  components: { ResourceEditor, ErrorMessage, BackButton },
  computed: {
    id() {
      return this.$route.params.id
    },
    item() {
      const { Resource } = this.$FeathersVuex.api
      // Get the Resource for the given ID or create a new one if the ID is 'new'
      return this.id === 'new' ? this.newItem : Resource.getFromStore(this.id)
    },
  },
  data: function () {
    const { Resource } = this.$FeathersVuex.api
    return {
      formError: null,
      newItem : new Resource()
    }
  },
  watch: {
    id: {
      handler(value) {
        if (value === 'new') {
          return
        }
        const { Resource } = this.$FeathersVuex.api
        const existingRecord = Resource.getFromStore(value)

        // If the record was not in the store, we have to fetch it from the server
        if (!existingRecord) {
          Resource.get(value)
        }
      },
      immediate: true // Run this handler when the component is created
    }
  }
}
</script>
