<template>
    <form @submit.prevent="handleSubmit">
        <div class="columns">
            <div class="column">
                <fieldset>
                    <legend>Basisdaten</legend>
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
                        <div class="field-label">
                            <label class="label">Alarmzeit</label>
                        </div>
                        <div class="field-body">
                            <span>{{ isNewItem ? 'wird beim Anlegen gesetzt' : item.time | moment('L LTS') }}</span>
                        </div>
                    </div>

                    <div class="field is-horizontal">
                        <div class="field-label is-normal">
                            <label class="label" for="reason">Einsatzgrund</label>
                        </div>
                        <div class="field-body">
                            <div class="field">
                                <div class="control">
                                    <input class="input" type="text" id="reason" placeholder="Grund unbekannt"
                                           v-model="item.reason">
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
                </fieldset>
            </div>

            <div class="column">
                <fieldset>
                    <legend>Quelle</legend>
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
                </fieldset>
            </div>
        </div>

        <fieldset v-if="item.location">
            <legend>Einsatzort</legend>
            <button type="button" class="button" @click.prevent="item.location = null">Einsatzort entfernen</button>
            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label" for="sender">Adresse</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="street" v-model="item.location.street">
                        </div>
                        <p class="help">Straße</p>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="street-number" size="5" v-model="item.location.number">
                        </div>
                        <p class="help">Hausnummer</p>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="detail" v-model="item.location.detail">
                        </div>
                        <p class="help">Detaillierte Angabe, z.&nbsp;B. Stockwerk</p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label" for="locality">Ort</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="post-code" size="5" v-model="item.location.postCode">
                        </div>
                        <p class="help">Postleitzahl</p>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="locality" v-model="item.location.locality">
                        </div>
                        <p class="help">Stadt, Ort oder Ortsteil</p>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="country" v-model="item.location.country">
                        </div>
                        <p class="help">Land</p>
                    </div>
                </div>
            </div>

            <div class="field is-horizontal">
                <div class="field-label is-normal">
                    <label class="label" for="locality">Koordinaten (WGS84)</label>
                </div>
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="longitude" v-model.number="item.location.longitude">
                        </div>
                        <p class="help">Längengrad (dezimal)</p>
                    </div>
                    <div class="field">
                        <div class="control">
                            <input class="input" type="text" id="latitude" v-model.number="item.location.latitude">
                        </div>
                        <p class="help">Breitengrad (dezimal)</p>
                    </div>
                </div>
            </div>
        </fieldset>
        <button v-else type="button" class="button" @click="addLocation">
            Einsatzort hinzufügen
        </button>

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
    addLocation () {
      const { Location } = this.$FeathersVuex.api
      this.item.location = new Location()
    },
    isValid: function () {
      // For now the form is also valid if it is completely empty
      return true
    }
  },
  setup(props, context) {
    function handleSubmit() {
      if (this.isValid()) {
        if (this.item.location.latitude === '') {
          this.item.location.latitude = null
        }
        if (this.item.location.longitude === '') {
          this.item.location.longitude = null
        }
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
fieldset {
    border: 1px solid gray;
    border-radius: 8px;
    padding: 20px;
}

fieldset > legend {
    padding: 0 0.5em;
}
</style>
