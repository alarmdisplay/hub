<template>
  <form @submit.prevent="handleSubmit">
    <div class="field">
      <label
        class="label"
        for="name"
      >
        Name
      </label>
      <p class="control">
        <input
          id="name"
          v-model="item.name"
          class="input"
          type="text"
        >
      </p>
    </div>
    <div class="buttons is-right">
      <button
        class="button"
        type="button"
        @click="$emit('reset')"
      >
        Zur&uuml;cksetzen
      </button>
      <button
        class="button is-success"
        type="submit"
        :disabled="!isValid()"
      >
        Speichern
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'ApiKeyEditor',
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
  methods: {
    isValid: function () {
      return this.item.name !== ''
    }
  }
}
</script>

<style scoped>

</style>
