<template>
    <section class="section">
        <div class="container">
            <h1 class="title">{{ id === 'new' ? 'Ordner überwachen' : 'Überwachten Ordner bearbeiten' }}</h1>

            <div class="buttons is-left">
                <BackButton/>
            </div>

            <ErrorMessage :form-error="formError"/>

            <FeathersVuexFormWrapper :item="item" watch>
                <template v-slot="{ clone, save, reset, remove }">
                    <WatchedFolderEditor
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
                    ></WatchedFolderEditor>
                </template>
            </FeathersVuexFormWrapper>
        </div>
    </section>
</template>

<script>
import BackButton from '@/components/BackButton'
import ErrorMessage from '@/components/ErrorMessage'
import WatchedFolderEditor from '@/components/WatchedFolderEditor'
export default {
name: 'WatchedFolderForm',
  components: { WatchedFolderEditor, BackButton, ErrorMessage },
  computed: {
    id() {
      return this.$route.params.id
    },
    item() {
      const { WatchedFolder } = this.$FeathersVuex.api
      // Get the watched folder for the given ID or create a new one if the ID is 'new'
      return this.id === 'new' ? new WatchedFolder() : WatchedFolder.getFromStore(this.id)
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
        const { WatchedFolder } = this.$FeathersVuex.api
        const existingRecord = WatchedFolder.getFromStore(value)

        // If the record was not in the store, we have to fetch it from the server
        if (!existingRecord) {
          WatchedFolder.get(value)
        }
      },
      immediate: true // Run this handler when the component is created
    }
  }
}
</script>
