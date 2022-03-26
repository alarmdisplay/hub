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
              <input type="checkbox" v-model="item.active">
              &Uuml;berwachung aktiv
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label" for="port">Port</label>
      </div>
      <div class="field-body">
        <div class="field">
          <div class="control">
            <input class="input" type="text" id="port" v-model="item.port">
          </div>
          <p class="help">
            Unter UNIX- oder Linux-basierten Systemen in der Form <code>/dev/tty.usbmodem12345</code>, unter Windows z.&nbsp;B. <code>COM3</code>
          </p>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label" for="baudRate">Baudrate</label>
      </div>
      <div class="field-body">
        <div class="field is-expanded">
          <div class="field has-addons">
            <div class="control">
              <input class="input" type="number" min="1" max="115200" id="baudRate" v-model.number="item.baudRate">
            </div>
            <div class="control">
              <span class="button is-static">Baud</span>
            </div>
          </div>
          <p class="help">
            Die Baudrate, mit der das verbundene Gerät kommuniziert.
          </p>
        </div>
      </div>
    </div>

    <div class="field is-horizontal">
      <div class="field-label is-normal">
        <label class="label" for="timeout">Timeout</label>
      </div>
      <div class="field-body">
        <div class="field is-expanded">
          <div class="field has-addons">
            <div class="control">
              <input class="input" type="number" min="1" max="10000" id="timeout" v-model.number="item.timeout">
            </div>
            <div class="control">
              <span class="button is-static">Millisekunden</span>
            </div>
          </div>
          <p class="help">
            Wenn Daten über die Schnittstelle empfangen werden, wird diese Anzahl Millisekunden gewartet, ob noch weitere Daten folgen. Nach Ablauf der Zeit werden die Daten dann weiterverarbeitet.
          </p>
        </div>
      </div>
    </div>

    <div class="level">
      <div class="level-left">
        <div class="buttons">
          <button class="button level-item is-danger is-outlined" v-if="!isNewItem" type="button" @click="$emit('remove')">Überwachung beenden</button>
        </div>
      </div>
      <div class="level-right">
        <div class="buttons">
          <button class="button level-item" type="button" @click="$emit('reset')">Zur&uuml;cksetzen</button>
          <button class="button level-item is-success" type="submit" :disabled="!isValid()">Speichern</button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
export default {
  name: 'SerialMonitorEditor',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    isNewItem: function () {
      return this.item.id === undefined
    }
  },
  methods: {
    isValid: function () {
      return this.item.port !== '' &&
        Number.isInteger(this.item.baudRate) &&
        this.item.baudRate > 0 &&
        Number.isInteger(this.item.timeout) &&
        this.item.timeout > 0
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
#timeout {
    text-align: right;
}
</style>
