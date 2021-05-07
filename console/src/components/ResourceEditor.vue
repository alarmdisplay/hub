<template>
    <form @submit.prevent="handleSubmit">
        <div class="field">
            <label class="label" for="name">
                Name
            </label>
            <p class="control">
                <input class="input" type="text" id="name" v-model="item.name">
            </p>
        </div>
        <div class="field">
            <label class="label" for="type">
                Typ
            </label>
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
    isNewItem: function () {
      return this.item.id === undefined
    }
  },
  methods: {
    isValid: function () {
      return this.item.name !== ''
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
