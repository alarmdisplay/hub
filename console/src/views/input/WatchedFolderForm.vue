<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        {{ id === 'new' ? 'Ordner überwachen' : 'Überwachten Ordner bearbeiten' }}
      </h1>

      <div class="buttons is-left">
        <BackButton />
      </div>

      <div class="content">
        <p>
          Der Ordner wird auf neue Dateien mit den Endungen .pdf, .tif, .tiff, .jpg, .jpeg, .png und .bmp überwacht.
          Der Dateiname muss mit einem Buchstaben oder einer Ziffer beginnen, die Groß- und Kleinschreibung spielt keine Rolle.
        </p>
        <p>
          Für einmal erkannte Dateien wird eine Prüfsumme gespeichert, um eine erneute Verarbeitung zu unterbinden.
          Dieses Verhalten kann in den Einstellungen deaktiviert werden.
        </p>
      </div>

      <ErrorMessage :form-error="formError" />

      <FeathersVuexFormWrapper
        :item="item"
        watch
      >
        <template #default="{ clone, save, reset, remove }">
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
          />
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
  data: function () {
    return {
      formError: null
    }
  },
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
