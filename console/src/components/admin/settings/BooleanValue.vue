<template>
  <FeathersVuexFormWrapper
    v-if="settingsItem"
    :item="settingsItem"
    :eager="false"
  >
    <template #default="{ clone, save }">
      <div class="level">
        <div class="level-left">
          <div
            class="level-item"
            style="flex-direction: column"
          >
            <input
              v-model="clone.value"
              type="checkbox"
              class="checkbox is-small"
              :disabled="$store.state.settings.isIdPatchPending.includes(settingsKey)"
              @change="
                () => {
                  $data.formError = null
                  save().catch(reason => { $data.formError = reason })
                }"
            >
            <ErrorMessage
              :form-error="formError"
              :short="true"
            />
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
  props: {
    settingsKey: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      formError: null
    }
  },
  computed: {
    settingsItem () {
      const { Setting } = this.$FeathersVuex.api
      return Setting.getFromStore(this.settingsKey)
    },
    value () {
      return this.$store.getters['settings/getBooleanValue'](this.settingsKey)
    }
  }
}
</script>

<style scoped>

</style>
