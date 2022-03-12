<template>
    <FeathersVuexFormWrapper :item="settingsItem" :eager="false">
        <template v-slot="{ clone, save }">
            <div class="level">
                <div class="level-left">
                    <div class="level-item" style="flex-direction: column">
                        <input type="checkbox" class="checkbox is-small" v-model="clone.value" @change="
                        () => {
                          $data.formError = null
                          save().catch(reason => { $data.formError = reason })
                        }" :disabled="$store.state.settings.isIdPatchPending.includes(settingsKey)">
                        <ErrorMessage :form-error="formError" :short="true"/>
                    </div>
                </div>
            </div>
        </template>
    </FeathersVuexFormWrapper>
</template>

<script>
import ErrorMessage from '@/components/ErrorMessage'

export default {
  name: 'BooleanValue',
  components: {
    ErrorMessage
  },
  computed: {
    settingsItem () {
      const { Setting } = this.$FeathersVuex.api
      return Setting.getFromStore(this.settingsKey)
    },
    value () {
      return this.$store.getters['settings/getBooleanValue'](this.settingsKey)
    }
  },
  data () {
    return {
      formError: null
    }
  },
  props: {
    settingsKey: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>

</style>
