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
    <div class="field">
      <label
        class="label"
        for="email"
      >
        E-Mail
      </label>
      <p class="control">
        <input
          id="email"
          v-model="item.email"
          class="input"
          type="email"
        >
      </p>
    </div>
    <div class="field">
      <label
        class="label"
        for="password"
      >
        Passwort
      </label>
      <p class="control">
        <input
          id="password"
          v-model="newPassword"
          class="input"
          type="password"
          autocomplete="new-password"
        >
      </p>
      <p
        v-if="!isNewItem"
        class="help"
      >
        Wird dieses Feld leer gelassen, bleibt das aktuelle Passwort bestehen. Zur Änderung ein neues Passwort eingeben.
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
  name: 'UserEditor',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    function handleSubmit() {
      if (this.isValid()) {
        if (this.isNewItem || this.newPassword !== '') {
          this.item.password = this.newPassword
        }
        context.emit('save')
      } else {
        // TODO show validation result
      }
    }
    return { handleSubmit }
  },
  data() {
    return {
      newPassword: ''
    }
  },
  computed: {
    isNewItem: function () {
      return this.item.id === undefined
    }
  },
  methods: {
    isValid: function () {
      return this.item.email !== '' && ((this.isNewItem && this.newPassword !== '') || !this.isNewItem)
    }
  }
}
</script>

<style scoped>

</style>
