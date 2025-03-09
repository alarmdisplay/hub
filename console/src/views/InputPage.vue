<template>
  <section class="section">
    <div class="container">
      <h1 class="title">
        Eingang
      </h1>

      <div class="content">
        Konfiguriere hier die Quellen, aus denen Alarme ausgewertet werden sollen.
      </div>


      <div class="dropdown is-hoverable mb-5">
        <div class="dropdown-trigger">
          <button
            class="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
          >
            <span>Quelle hinzufügen &hellip;</span>
            <span class="icon is-small">
              <font-awesome-icon icon="angle-down" />
            </span>
          </button>
        </div>
        <div
          id="dropdown-menu"
          class="dropdown-menu"
          role="menu"
        >
          <div class="dropdown-content">
            <router-link
              class="dropdown-item is-flex is-align-items-center"
              :to="{ name: 'serial-monitor-form', params: { id: 'new' } }"
              append
            >
              <span class="icon is-small mr-1">
                <font-awesome-icon icon="wave-square" />
              </span>
              <span>Serielle Schnittstelle</span>
            </router-link>
            <router-link
              class="dropdown-item is-flex is-align-items-center"
              :to="{ name: 'watched-folder-form', params: { id: 'new' } }"
              append
            >
              <span class="icon is-small mr-1">
                <font-awesome-icon icon="folder" />
              </span>
              <span>Überwachter Ordner</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="columns is-multiline">
        <template v-for="watchedFolder in watchedFolders">
          <div
            :key="`watchedFolder-${watchedFolder.id}`"
            class="column is-4 is-3-widescreen"
          >
            <WatchedFolder
              :watched-folder="watchedFolder"
              @edit-step="onEditStep"
            />
          </div>
        </template>
        <template v-for="serialMonitor in serialMonitors">
          <div
            :key="`serialMonitor-${serialMonitor.id}`"
            class="column is-4 is-3-widescreen"
          >
            <SerialMonitor :serial-monitor="serialMonitor" />
          </div>
        </template>
      </div>

      <InputStepFormModal
        v-if="stepToEdit"
        :item="stepToEdit"
        :step-type="stepType"
        @close-request="closeModal"
      />
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
  name: "InputPage",
  components: { SerialMonitor, InputStepFormModal, WatchedFolder },
  mixins: [
    makeFindMixin({ service: 'watchedfolders', items: 'watchedFolders' }),
    makeFindMixin({ service: 'serial-monitors' }),
  ],
  data() {
    return {
      stepToEdit: null,
      stepType: null,
    }
  },
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
}
</script>

<style scoped>
.dropdown:focus-within .dropdown-menu {
    display: block;
}
</style>
