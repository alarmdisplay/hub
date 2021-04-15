<template>
    <div class="card">
        <div class="card-header">
            <div class="card-header-title">
                Überwachter Ordner
            </div>
            <router-link class="card-header-icon" :to="{ name: 'watched-folder-form', params: {id: watchedFolder.id} }" title="Bearbeiten">
                <span class="icon">
                    <font-awesome-icon icon="edit"/>
                </span>
            </router-link>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-left">
                    <font-awesome-icon icon="folder" style="font-size: 2.5em"/>
                </div>
                <div class="media-content">
                    <p class="title is-4">{{ watchedFolder.path }}</p>
                    <p class="subtitle is-6">
                        <span v-if="watchedFolder.active" class="has-text-success"><font-awesome-icon icon="circle" size="sm"/> Aktiv</span>
                        <span v-else class=""><font-awesome-icon icon="pause"/> Pausiert</span>
                    </p>
                </div>
            </div>
            <div class="content">
                <b>Dateityp:</b> PDF
            </div>

            <hr>

            <div v-if="textAnalysisJob" class="media">
                <div class="media-left">
                    <span class="icon">
                        <font-awesome-icon icon="file-alt" size="2x"/>
                    </span>
                </div>
                <div class="media-content">
                    Texterkennung mit Layout<br>
                    <b>{{ getConfigDisplayName(textAnalysisJob.config) }}</b>
                </div>
                <div class="media-right">
                    <button class="delete is-small" @click="removeTextAnalysisJob" title="Texterkennung entfernen"></button>
                </div>
            </div>
            <div v-else class="content">
                <p class="has-text-warning-dark">PDF-Dateien müssen eine Texterkennung durchlaufen, bevor sie als Alarmquelle verwendet werden können.</p>
                <div class="field">
                    <label class="label">Layout</label>
                    <div class="control">
                        <div class="select">
                            <select ref="analysis-config-select">
                                <option v-for="config in Object.entries(textAnalysisConfigs)" :key="config[0]" :value="config[0]">
                                    {{ config[1] }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <p class="help">Ein Layout definiert, wie das Dokument analysiert wird. Wähle das zur Quelle passende Layout aus.</p>
                </div>

                <button type="button" class="button is-success" @click="addTextAnalysisJob">Texterkennung einrichten</button>
            </div>

            <template v-for="printTask in printTasks">
                <div class="media" :key="printTask.id">
                    <div class="media-left">
                    <span class="icon">
                        <font-awesome-icon icon="print" size="2x"/>
                    </span>
                    </div>
                    <div class="media-content">
                        <p>
                            Drucke {{ printTask.numberCopies }} Exemplar(e) auf
                            <span v-if="printTask.printerName" class="printer-name">{{ printTask.printerName }}</span>
                            <span v-else>dem Standard&shy;drucker</span>
                        </p>
                    </div>
                    <div class="media-right">
                        <a href="#" @click.prevent="$emit('edit-step', { type: 'PrintTask', item: printTask })">
                            <span class="icon">
                                <font-awesome-icon icon="edit"/>
                            </span>
                        </a>
                    </div>
                </div>
            </template>
        </div>
        <div class="card-footer">
            <div class="card-footer-item">
                <div class="dropdown is-hoverable">
                    <div class="dropdown-trigger">
                        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
                            <span>Datei weiterverarbeiten &hellip;</span>
                            <span class="icon is-small">
                                <font-awesome-icon icon="angle-down"/>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <a href="#" @click.prevent="addPrintTask" class="dropdown-item is-flex is-align-items-center">
                                <span class="icon is-small mr-1">
                                    <font-awesome-icon icon="print"/>
                                </span>
                                <span>Druckauftrag</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: "WatchedFolder",

  computed: {
    printTasksParams() {
      return {
        query: { event: 'found_file', sourceId: this.watchedFolder.id }
      }
    },
    textAnalysisConfigs() {
      // TODO This should be retrieved from the backend
      return {
        'ils_augsburg': 'Alarmfax ILS Augsburg',
      }
    },
    textAnalysisJob () {
      if (this.textAnalysisJobs.length) {
        return this.textAnalysisJobs[0]
      }

      return undefined
    },
    textanalysisParams() {
      return {
        query: { event: 'found_file', sourceId: this.watchedFolder.id }
      }
    }
  },
  methods: {
    addPrintTask() {
      const { PrintTask } = this.$FeathersVuex.api
      let printTask = new PrintTask()
      printTask.sourceId = this.watchedFolder.id
      printTask.event = 'found_file'
      this.$emit('edit-step', { type: 'PrintTask', item: printTask })
    },
    addTextAnalysisJob() {
      let configName = this.$refs['analysis-config-select'].value
      const { TextAnalysis } = this.$FeathersVuex.api
      let textAnalysis = new TextAnalysis()
      textAnalysis.sourceId = this.watchedFolder.id
      textAnalysis.event = 'found_file'
      textAnalysis.config = configName
      textAnalysis.save()
    },
    getConfigDisplayName(configSlug) {
      let index = Object.keys(this.textAnalysisConfigs).indexOf(configSlug)
      if (index === -1) {
        return configSlug
      }

      return Object.values(this.textAnalysisConfigs)[index]
    },
    removeTextAnalysisJob() {
      const job = this.textAnalysisJob
      if (!job) {
        return
      }

      job.remove()
    }
  },
  mixins: [
    makeFindMixin({ service: 'textanalysis', items: 'textAnalysisJobs' }),
    makeFindMixin({ service: 'print-tasks', items: 'printTasks' }),
  ],
  props: {
    watchedFolder: Object
  }
}
</script>

<style scoped>
.printer-name {
    word-break: break-all;
    font-style: italic;
}
</style>
