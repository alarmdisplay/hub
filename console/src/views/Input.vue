<template>
    <section class="section">
        <div class="container">
            <h1 class="title">Eingang</h1>

            <div class="content">
                Konfiguriere hier die Quellen, aus denen Alarme ausgewertet werden sollen.
            </div>

            <div class="buttons">
                <router-link tag="button" type="button" class="button" :to="{ name: 'watched-folder-form', params: { id: 'new' } }" append>
                    <span class="icon"><font-awesome-icon icon="plus"/></span>
                    <span>Ordner überwachen</span>
                </router-link>
            </div>

            <div class="columns is-multiline">
                <template v-for="watchedFolder in watchedFolders">
                    <div class="column is-3" :key="watchedFolder.id">
                        <WatchedFolder :watched-folder="watchedFolder"/>
                    </div>
                </template>
            </div>

            <div class="tile is-ancestor">
                <div class="tile is-parent">

                </div>
            </div>
        </div>
    </section>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'
import WatchedFolder from '@/components/input/WatchedFolder'

export default {
  name: "Input",
  components: { WatchedFolder },
  computed: {
    watchedfoldersParams() {
      return {
        query: {}
      }
    }
  },
  mixins: [ makeFindMixin({ service: 'watchedfolders', items: 'watchedFolders' })],
}
</script>

<style scoped>

</style>
