<template>
    <div class="card">
        <div class="card-header">
            <div class="card-header-title">
                Serielle Schnittstelle
            </div>
            <router-link class="card-header-icon" :to="{ name: 'serial-monitor-form', params: {id: serialMonitor.id} }" title="Bearbeiten">
                <span class="icon">
                    <font-awesome-icon icon="edit"/>
                </span>
            </router-link>
        </div>
        <div class="card-content">
            <div class="media">
                <div class="media-left">
                    <font-awesome-icon icon="wave-square" style="font-size: 2em"/>
                </div>
                <div class="media-content">
                    <p class="title is-4">{{ serialMonitor.port }}</p>
                    <p class="subtitle is-6">
                        <span v-if="serialMonitor.active" class="has-text-success"><font-awesome-icon icon="circle" size="sm"/> Aktiv</span>
                        <span v-else class=""><font-awesome-icon icon="pause"/> Pausiert</span>
                    </p>
                </div>
            </div>

            <hr>

            <div v-if="textAnalysisJob" class="media">
                <div class="media-left">
                    <span class="icon">
                        <font-awesome-icon icon="file-alt" size="2x"/>
                    </span>
                </div>
                <div class="media-content">
                    Textanalyse mit Layout<br>
                    <b>{{ getConfigDisplayName(textAnalysisJob.config) }}</b>
                </div>
                <div class="media-right">
                    <button class="delete is-small" @click="removeTextAnalysisJob" title="Textanalyse entfernen"></button>
                </div>
            </div>
            <div v-else class="content">
                <p class="has-text-warning-dark">Eingehende Daten müssen analysiert werden, um sie als Alarm behandeln zu können.</p>
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
                    <p class="help">Ein Layout definiert, wie der Text analysiert wird. Wähle das zur Quelle passende Layout aus.</p>
                </div>

                <button type="button" class="button is-success" @click="addTextAnalysisJob">Analyse einrichten</button>
            </div>
        </div>
    </div>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: "SerialMonitor",
  computed: {
    textAnalysisConfigs() {
      // TODO This should be retrieved from the backend
      return {
		'ls_bodenseekreis': 'Pager LS Bodensee-Oberschwaben'
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
        query: { event: 'serial_input', sourceId: this.serialMonitor.id }
      }
    }
  },
  methods: {
    addTextAnalysisJob() {
      let configName = this.$refs['analysis-config-select'].value
      const { TextAnalysis } = this.$FeathersVuex.api
      let textAnalysis = new TextAnalysis()
      textAnalysis.sourceId = this.serialMonitor.id
      textAnalysis.event = 'serial_input'
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
  ],
  props: {
    serialMonitor: Object
  }
}
</script>

<style scoped>
</style>
