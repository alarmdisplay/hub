<template>
    <section class="section">
        <div class="container">
            <h1 class="title">&Uuml;berwachte Ordner</h1>

            <div class="content">
                Ordner können auf Änderungen der enthaltenen Dateien überwacht werden.
                Taucht eine neue PDF-Datei im überwachten Ordner auf, wird sie der Texterkennung zugeführt.
            </div>

            <div class="buttons">
                <router-link tag="button" type="button" class="button" to="new" append>
                    <span class="icon"><font-awesome-icon icon="plus"/></span>
                    <span>Ordner überwachen</span>
                </router-link>
            </div>

            <FeathersVuexFind service="watchedfolders" :query="{ $limit: 50 }" qid="watchedFolderList" watch="query">
                <table class="table is-fullwidth" slot-scope="{ items: watchedFolders }">
                    <thead>
                    <tr>
                        <th>Pfad</th>
                        <th>Aktiv</th>
                        <th>Polling</th>
                        <th>Dateitypen</th>
                        <th>Aktionen</th>
                    </tr>
                    </thead>
                    <tbody>
                    <template v-for="watchedFolder in watchedFolders">
                        <tr :key="watchedFolder.id">
                            <th>{{ watchedFolder.path }}</th>
                            <td><font-awesome-icon :icon="watchedFolder.active ? 'check' : 'times'" size="lg"/></td>
                            <td><font-awesome-icon :icon="watchedFolder.polling ? 'check' : 'times'" size="lg"/></td>
                            <td>PDF</td>
                            <td class="is-narrow">
                                <div class="field is-grouped">
                                    <p class="control">
                                        <router-link tag="button" class="button is-outlined" title="Überwachung bearbeiten" :to="{ name: 'watched-folder-form', params: { id: watchedFolder.id } }">
                                            <span class="icon">
                                                <font-awesome-icon icon="edit"/>
                                            </span>
                                        </router-link>
                                    </p>
                                    <p class="control">
                                        <button class="button is-outlined" :title="getToggleLabel(watchedFolder)" @click="toggleActive(watchedFolder)">
                                            <span class="icon">
                                                <font-awesome-icon :icon="watchedFolder.active ? 'pause' : 'play'"/>
                                            </span>
                                            <span>{{ getToggleLabel(watchedFolder) }}</span>
                                        </button>
                                    </p>
                                    <p class="control">
                                        <button class="button is-danger is-outlined" title="Überwachung beenden" @click="removeWatchedFolder(watchedFolder.id)">
                                            <span class="icon">
                                                <font-awesome-icon icon="stop"/>
                                            </span>
                                            <span>Beenden</span>
                                        </button>
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </template>
                    </tbody>
                </table>
            </FeathersVuexFind>
        </div>
    </section>
</template>

<script>
  export default {
    name: 'WatchedFolderList',
    methods: {
      getToggleLabel: function (watchedFolder) {
        return watchedFolder.active ? 'Pausieren' : 'Fortsetzen'
      },
      removeWatchedFolder: function (id) {
        if (!id) {
          return
        }

        this.$store.dispatch('watchedfolders/remove', id)
      },
      toggleActive: function (watchedFolder) {
        watchedFolder.active = !watchedFolder.active
        watchedFolder.save()
      }
    }
  }
</script>

<style scoped>

</style>
