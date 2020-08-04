<template>
    <form @submit.prevent="handleSubmit">
        <div class="field">
            <label class="label" for="path">
                Pfad
            </label>
            <p class="control">
                <input class="input" type="text" id="path" v-model="item.path">
            </p>
        </div>

        <div class="field">
            <p class="control">
                <label class="checkbox">
                    <input type="checkbox" v-model="item.active">
                    &Uuml;berwachung aktiv
                </label>
            </p>
        </div>
        <div class="buttons is-right">
            <button class="button" type="button" @click="$emit('reset')">Zur&uuml;cksetzen</button>
            <button class="button is-success" type="submit" :disabled="!isValid()">Speichern</button>
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
  methods: {
    isValid: function () {
      return this.item.path !== ''
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
  }
}
</script>

<style scoped>

</style>
