<template>
    <form @submit.prevent="handleSubmit">
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="reason">Einsatzgrund</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="reason" placeholder="Grund unbekannt" v-model="item.reason">
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="keyword">Stichwort</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="keyword" v-model="item.keyword">
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label">
                <label class="label">Art</label>
            </div>
            <div class="field-body">
                <div class="field is-narrow">
                    <div class="control">
                        <label class="radio mr-2">
                            <input type="radio" name="status" value="Actual" v-model="item.status">
                            Tatsächlicher Einsatz
                        </label>
                        <label class="radio mr-2">
                            <input type="radio" name="status" value="Exercise" v-model="item.status">
                            Übung
                        </label>
                        <label class="radio">
                            <input type="radio" name="status" value="Test" v-model="item.status">
                            Probealarm
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="description">Freitext</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <textarea class="textarea" id="description" v-model="item.description"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <hr class="has-background-grey-light">

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="caller_name">Meldende Person</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="caller_name" v-model="item.caller_name">
                    </div>
                    <p class="help">Name der Person</p>
                </div>
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="caller_number" v-model="item.caller_number">
                    </div>
                    <p class="help">Rufnummer für Rückfragen</p>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="sender">Absender</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="sender" v-model="item.sender">
                    </div>
                    <p class="help">Stelle oder Organisation, die den Einsatz übermittelt hat</p>
                </div>
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="ref" v-model="item.ref">
                    </div>
                    <p class="help">Eindeutige Referenz (Einsatznummer)</p>
                </div>
            </div>
        </div>

        <div class="level mt-5">
            <div class="level-left">
                <div class="buttons">
                    <button class="button level-item is-danger is-outlined" v-if="!isNewItem" type="button" @click="$emit('remove')">Löschen</button>
                </div>
            </div>
            <div class="level-right">
                <div class="buttons">
                    <button class="button level-item" type="button" @click="$emit('reset')">Zur&uuml;cksetzen</button>
                    <button :class="['button', 'level-item', isNewItem && item.status === 'Actual' ? 'is-danger' : 'is-success']" type="submit" :disabled="!isValid()">
                        {{ isNewItem ? 'Anlegen' : 'Speichern' }}
                    </button>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
export default {
  name: 'IncidentEditor',
  components: {},
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
  data() {
    return {}
  },
  methods: {
    isValid: function () {
      // For now the form is also valid if it is completely empty
      return true
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
