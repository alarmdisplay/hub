<template>
    <form @submit.prevent="handleSubmit">
        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="name">Name</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control">
                        <input class="input" type="text" id="name" v-model="item.name">
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label" for="type">Typ</label>
            </div>
            <div class="field-body">
                <div class="field">
                    <div class="control has-icons-left">
                        <div class="select">
                            <select id="type" v-model="item.type">
                                <option value="organization">Organisation</option>
                                <option value="vehicle">Fahrzeug</option>
                                <option value="group">Gruppe</option>
                                <option value="role">Führungsdienstgrad</option>
                                <option value="other">Andere</option>
                            </select>
                        </div>
                        <div class="icon is-small is-left">
                            <ResourceIcon :resource="item"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label">Selektivrufe</label>
            </div>
            <div class="field-body">
                <div>
                    <div class="field is-grouped is-grouped-multiline">
                        <div class="control" v-for="selcall in selcalls" :key="selcall.id">
                            <div class="tags has-addons">
                                <span class="tag has-background-grey-dark has-text-white">{{ selcall.value }}</span>
                                <a class="tag is-delete" :title="`Selektivruf ${selcall.value} entfernen`" @click.prevent="removeIdentifier(selcall.id || selcall.__id)"></a>
                            </div>
                        </div>
                        <input type="text" class="input is-small is-inline mr-2" size="5" placeholder="12345" v-model.trim="selcallToAdd" @keydown="onSelcallKeydown">
                        <button type="button" class="button is-small" :disabled="!isSelcallValid(selcallToAdd)" @click="addSelcall">Hinzuf&uuml;gen</button>
                    </div>
                    <p class="help">
                        Derzeit werden nur 5-Tonfolgen unterstützt
                    </p>
                </div>
            </div>
        </div>

        <div class="field is-horizontal">
            <div class="field-label is-normal">
                <label class="label">Alternative Bezeichner</label>
            </div>
            <div class="field-body">
                <div>
                    <div class="field is-grouped is-grouped-multiline">
                        <div class="control" v-for="altName in altNames" :key="altName.id">
                            <div class="tags has-addons">
                                <span class="tag has-background-grey-dark has-text-white">{{ altName.value }}</span>
                                <a class="tag is-delete" :title="`Bezeichner ${altName.value} entfernen`" @click.prevent="removeIdentifier(altName.id || altName.__id)"></a>
                            </div>
                        </div>
                        <input type="text" class="input is-small is-inline mr-2" size="15" v-model.trim="altNameToAdd" @keydown="onAltNameKeydown">
                        <button type="button" class="button is-small" :disabled="!altNameToAdd.length" @click="addAltName">Hinzuf&uuml;gen</button>
                    </div>
                    <p class="help">
                        Trage hier ein, unter welchen Namen dieses Einsatzmittel auf einem Fax oder in anderen Texten auftaucht.
                    </p>
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
                    <button class="button level-item is-success" type="submit" :disabled="!isValid()">Speichern</button>
                </div>
            </div>
        </div>
    </form>
</template>

<script>
import ResourceIcon from '@/components/ResourceIcon'

export default {
  name: 'ResourceEditor',
  components: { ResourceIcon },
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    altNames () {
      return this.item.identifiers.filter(identifier => identifier.type === 'name')
    },
    isNewItem: function () {
      return this.item.id === undefined
    },
    selcalls () {
      return this.item.identifiers.filter(identifier => identifier.type === 'selcall')
    }
  },
  data() {
    return {
      altNameToAdd: '',
      selcallToAdd: ''
    }
  },
  methods: {
    addAltName () {
      this.addIdentifier('name', this.altNameToAdd)
      this.altNameToAdd = ''
    },
    addIdentifier (type, value) {
      const { ResourceIdentifier } = this.$FeathersVuex.api
      let identifier = new ResourceIdentifier({ type: type, value: value })
      this.item.identifiers.push(identifier)
    },
    addSelcall () {
      if (!this.isSelcallValid(this.selcallToAdd)) {
        return
      }

      this.addIdentifier('selcall', this.selcallToAdd)
      this.selcallToAdd = ''
    },
    isSelcallValid (selcall) {
      return /^\d{5}$/.test(selcall)
    },
    isValid: function () {
      return this.item.name !== ''
    },
    onAltNameKeydown (event) {
      if (event.keyCode === 13) {
        event.preventDefault()
        event.stopPropagation()
        this.addAltName()
      }
    },
    onSelcallKeydown (event) {
      if (event.keyCode === 13) {
        event.preventDefault()
        event.stopPropagation()
        this.addSelcall()
      }
    },
    removeIdentifier(idToRemove) {
      this.item.identifiers = this.item.identifiers.filter(idendifier => {
        return idendifier.id !== idToRemove && (!idendifier.__id || idendifier.__id !== idToRemove)
      })
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
/* Give the icon in the dropdown a less light color */
.control.has-icons-left .icon {
    color: unset;
}
</style>
