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
                <router-link tag="button" type="button" class="button" :to="{ name: 'serial-monitor-form', params: { id: 'new' } }" append>
                    <span class="icon"><font-awesome-icon icon="plus"/></span>
                    <span>Serielle Schnittstelle überwachen</span>
                </router-link>
            </div>

            <div class="columns is-multiline">
                <template v-for="watchedFolder in watchedFolders">
                    <div class="column is-3" :key="`watchedFolder-${watchedFolder.id}`">
                        <WatchedFolder :watched-folder="watchedFolder" @edit-step="onEditStep"/>
                    </div>
                </template>
                <template v-for="serialMonitor in serialMonitors">
                    <div class="column is-3" :key="`serialMonitor-${serialMonitor.id}`">
                        <SerialMonitor :serial-monitor="serialMonitor"/>
                    </div>
                </template>
            </div>

            <InputStepFormModal v-if="stepToEdit" :item="stepToEdit" :step-type="stepType" @close-request="closeModal"/>
        </div>
    </section>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'
import InputStepFormModal from '@/components/input/InputStepFormModal'
import SerialMonitor from '@/components/input/SerialMonitor'
import WatchedFolder from '@/components/input/WatchedFolder'

const knownStepTypes = ['PrintTask']

export default {
  name: "Input",
  components: { SerialMonitor, InputStepFormModal, WatchedFolder },
  computed: {
    serialMonitorsParams() {
      return {
        query: {}
      }
    },
    watchedfoldersParams() {
      return {
        query: {}
      }
    }
  },
  data() {
    return {
      stepToEdit: null,
      stepType: null,
    }
  },
  methods: {
    closeModal() {
      this.stepToEdit = null
      this.stepType = null
    },
    async onEditStep (args) {
      if (this.stepToEdit) {
        console.error('Already in the process of editing a step')
        return
      }

      if (!args || !args.item || !knownStepTypes.includes(args.type)) {
        console.error('Invalid arguments or step type')
        return
      }

      this.stepToEdit = args.item
      this.stepType = args.type
    }
  },
  mixins: [
    makeFindMixin({ service: 'watchedfolders', items: 'watchedFolders' }),
    makeFindMixin({ service: 'serial-monitors' }),
  ],
}
</script>

<style scoped>

</style>
