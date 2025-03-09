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
                    <input
                      v-model="item.status"
                      type="radio"
                      name="status"
                      value="Actual"
                    >
                    Tatsächlicher Einsatz
                  </label>
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
            <div class="field-label">
              <label class="label">Alarmzeit</label>
            </div>
            <div class="field-body">
              <span v-if="isNewItem">wird beim Anlegen gesetzt</span>
              <span v-else>{{ item.time | moment('L LTS') }}</span>
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
                    :placeholder="reasonPlaceholder"
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

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label
                class="label"
                for="description"
              >Freitext</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <textarea
                    id="description"
                    v-model="item.description"
                    class="textarea"
                  />
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
              <label
                class="label"
                for="caller_name"
              >Meldende Person</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input
                    id="caller_name"
                    v-model="item.caller_name"
                    class="input"
                    type="text"
                  >
                </div>
                <p class="help">
                  Name der Person
                </p>
              </div>
              <div class="field">
                <div class="control">
                  <input
                    id="caller_number"
                    v-model="item.caller_number"
                    class="input"
                    type="text"
                  >
                </div>
                <p class="help">
                  Rufnummer für Rückfragen
                </p>
              </div>
            </div>
          </div>

          <div class="field is-horizontal">
            <div class="field-label is-normal">
              <label
                class="label"
                for="sender"
              >Absender</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <input
                    id="sender"
                    v-model="item.sender"
                    class="input"
                    type="text"
                  >
                </div>
                <p class="help">
                  Stelle oder Organisation, die den Einsatz übermittelt hat
                </p>
              </div>
              <div class="field">
                <div class="control">
                  <input
                    id="ref"
                    v-model="item.ref"
                    class="input"
                    type="text"
                  >
                </div>
                <p class="help">
                  Eindeutige Referenz (Einsatznummer)
                </p>
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Einsatzmittel</legend>
          <div
            id="resources"
            class="field"
          >
            <span
              v-for="resource of resources"
              :key="resource.id"
              class="control"
            >
              <label class="checkbox">
                <input
                  v-model="item.resourceIds"
                  type="checkbox"
                  :value="resource.id"
                >
                <ResourceIcon :resource="resource" />
                {{ resource.name }}
              </label>
            </span>
          </div>
        </fieldset>
      </div>
    </div>

    <fieldset v-if="item.location">
      <legend>Einsatzort</legend>
      <button
        type="button"
        class="button"
        @click.prevent="item.location = null"
      >
        Einsatzort entfernen
      </button>
      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label
            class="label"
            for="location_name"
          >Objektname</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input
                id="location_name"
                v-model.trim="item.location.name"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Bezeichnung des Objekts oder der Örtlichkeit
            </p>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label
            class="label"
            for="street"
          >Adresse</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input
                id="street"
                v-model="item.location.street"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Straße
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="street-number"
                v-model="item.location.number"
                class="input"
                type="text"
                size="5"
              >
            </div>
            <p class="help">
              Hausnummer
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="detail"
                v-model="item.location.detail"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Detaillierte Angabe, z.&nbsp;B. Stockwerk
            </p>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label
            class="label"
            for="post-code"
          >Ort</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input
                id="post-code"
                v-model="item.location.postCode"
                class="input"
                type="text"
                size="5"
              >
            </div>
            <p class="help">
              Postleitzahl
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="municipality"
                v-model="item.location.municipality"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Stadt oder Gemeinde
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="district"
                v-model="item.location.district"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Stadt- oder Ortsteil
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="country"
                v-model="item.location.country"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Land
            </p>
          </div>
        </div>
      </div>

      <div class="field is-horizontal">
        <div class="field-label is-normal">
          <label
            class="label"
            for="longitude"
          >Koordinaten (WGS84)</label>
        </div>
        <div class="field-body">
          <div class="field">
            <div class="control">
              <input
                id="longitude"
                v-model.number="item.location.longitude"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Längengrad (dezimal)
            </p>
          </div>
          <div class="field">
            <div class="control">
              <input
                id="latitude"
                v-model.number="item.location.latitude"
                class="input"
                type="text"
              >
            </div>
            <p class="help">
              Breitengrad (dezimal)
            </p>
          </div>
        </div>
      </div>
    </fieldset>
    <button
      v-else
      type="button"
      class="button"
      @click="addLocation"
    >
      Einsatzort hinzufügen
    </button>

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
            :class="['button', 'level-item', isNewItem && item.status === 'Actual' ? 'is-danger' : 'is-success']"
            type="submit"
            :disabled="!isValid()"
          >
            {{ isNewItem ? 'Anlegen' : 'Speichern' }}
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import ResourceIcon from '@/components/ResourceIcon'
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: 'IncidentEditor',
  components: { ResourceIcon },
  mixins: [
    makeFindMixin({ service: 'resources', local: true }),
  ],
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props, context) {
    function handleSubmit() {
      if (this.isValid()) {
        if (this.item.location && this.item.location.latitude === '') {
          this.item.location.latitude = null
        }
        if (this.item.location && this.item.location.longitude === '') {
          this.item.location.longitude = null
        }
        context.emit('save')
      } else {
        // TODO show validation result
      }
    }
    return { handleSubmit }
  },
  data() {
    return {}
  },
  computed: {
    isNewItem: function () {
      return this.item.id === undefined
    },
    reasonPlaceholder () {
      switch (this.item.status) {
      case 'Exercise':
        return 'Übung'
      case 'Test':
        return  'Probealarm'
      default:
        return 'Einsatzgrund unbekannt'
      }
    },
    resourcesParams () {
      return {
        query: {
          $sort: {
            name: 1
          }
        }
      }
    }
  },
  async created () {
    const { Resource } = this.$FeathersVuex.api
    // Make sure all resources are loaded and up-to-date
    Resource.find()
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

fieldset + fieldset {
    margin-top: 0.75rem;
}

span.control {
    margin-right: 1em;
}

#resources .checkbox input {
    margin-right: 0.3em;
}
</style>
