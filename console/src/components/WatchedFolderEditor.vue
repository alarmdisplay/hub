<template>
  <form @submit.prevent="handleSubmit">
    <div class="field is-horizontal">
      <div class="field-label">
        <label class="label is-normal">Status</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input
                v-model="item.active"
                type="checkbox"
              >
              &Uuml;berwachung aktiv
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label
          class="label"
          for="path"
        >Pfad</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input
              id="path"
              v-model.trim="item.path"
              class="input"
              type="text"
            >
          </div>
          <p class="help">
            Der Pfad kann sowohl absolut (empfohlen) als auch relativ zum Arbeitsverzeichnis des Servers angegeben werden.
          </p>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label">
        <label class="label is-normal">Polling</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input
                v-model="item.polling"
                type="checkbox"
              >
              Polling verwenden
            </label>
          </div>
          <p class="help">
            Regelmäßig den Inhalt des Ordners abfragen, anstatt auf Benachrichtigungen des Betriebssystems zu warten. Dies kann für eingebundene Netzlaufwerke erforderlich sein.
          </p>
        </div>
      </div>
    </div>

    <div class="level">
      <div class="level-left">
        <div class="buttons">
          <button
            v-if="!isNewItem"
            class="button level-item is-danger is-outlined"
            type="button"
            @click="$emit('remove')"
          >
            Überwachung beenden
          </button>
        </div>
      </div>
      <div class="level-right">
        <div class="buttons">
          <button
            class="button level-item"
            type="button"
            @click="$emit('reset')"
          >
            Zur&uuml;cksetzen
          </button>
          <button
            class="button level-item is-success"
            type="submit"
            :disabled="!isValid()"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'WatchedFolderEditor',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    function handleSubmit() {
      if (this.isValid()) {
        context.emit('save')
      } else {
        // TODO show validation result
      }
    }
    return { handleSubmit }
  },
  computed: {
    isNewItem: function () {
      return this.item.id === undefined
    }
  },
  methods: {
    isValid: function () {
      return this.item.path !== ''
    }
  }
}
</script>

<style scoped>

</style>
