<template>
  <form @submit.prevent="handleSubmit">
    <div class="field">
      <label
        class="label"
        for="printerName"
      >
        Druckername
      </label>
      <p class="control">
        <input
          id="printerName"
          v-model.trim="item.printerName"
          class="input"
          type="text"
        >
      </p>
      <p class="help">
        Der Druckername, wie er in CUPS geführt wird. Das Feld kann leer gelassen werden, um den Standarddrucker zu verwenden.
      </p>
    </div>

    <div class="field">
      <label
        class="label"
        for="numberCopies"
      >
        Anzahl Kopien
      </label>
      <p class="control">
        <input
          id="numberCopies"
          v-model.number="item.numberCopies"
          class="input"
          type="number"
          min="1"
          max="99"
        >
      </p>
    </div>

    <div class="level mt-5">
      <div class="level-left">
        <div class="buttons">
          <button
            v-if="!isNewItem"
            class="button level-item is-danger is-outlined"
            type="button"
            @click="$emit('remove')"
          >
            Druckauftrag entfernen
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
  name: 'PrintTaskEditor',
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
      return Number.isInteger(this.item.numberCopies) && this.item.numberCopies > 0 &&
        (this.item.printerName === '' || /^\w+$/.test(this.item.printerName))
    }
  }
}
</script>

<style scoped>

</style>
