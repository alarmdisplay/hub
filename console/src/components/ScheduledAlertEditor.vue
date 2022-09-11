<template>
  <form @submit.prevent="handleSubmit">
    <div class="field is-horizontal">
      <div class="field-label">
        <label class="label">Art</label>
      </div>
      <div class="field-body">
        <div class="field is-narrow">
          <div class="control">
            <label class="radio mr-2">
              <input
                v-model="item.status"
                type="radio"
                name="status"
                value="Exercise"
              >
              Übung
            </label>
            <label class="radio">
              <input
                v-model="item.status"
                type="radio"
                name="status"
                value="Test"
              >
              Probealarm
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label
          class="label"
          for="begin"
        >Beginn</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input
              id="begin"
              v-model="item.begin"
              class="input"
              type="text"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label
          class="label"
          for="end"
        >Ende</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input
              id="end"
              v-model="item.end"
              class="input"
              type="text"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label
          class="label"
          for="reason"
        >Einsatzgrund</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input
              id="reason"
              v-model="item.reason"
              class="input"
              type="text"
            >
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label
          class="label"
          for="keyword"
        >Stichwort</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input
              id="keyword"
              v-model="item.keyword"
              class="input"
              type="text"
            >
          </div>
        </div>
      </div>
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
            Löschen
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
  name: 'ScheduledAlertEditor',
  components: {},
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
    },
  },
  methods: {
    isValid: function () {
      return this.item.name !== ''
    },
  }
}
</script>

<style scoped>
/* Give the icon in the dropdown a less light color */
.control.has-icons-left .icon {
    color: unset;
}
</style>
