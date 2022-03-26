<template>
  <div :class="['modal', (item ? 'is-active' : '')]">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">{{ modalTitle }}</p>
        <button class="delete" aria-label="close" @click="$emit('close-request')"></button>
      </header>
      <section class="modal-card-body">
        <ErrorMessage :form-error="formError"/>

        <FeathersVuexFormWrapper :item="item" watch>
          <template v-slot="{ clone, save, reset, remove }">
            <PrintTaskEditor
              :item="clone"
              @save="
                () => {
                  $data.formError = null
                  save()
                    .then(() => { $emit('close-request') })
                    .catch(reason => { $data.formError = reason })
                }"
              @reset="reset"
              @remove="
                () => {
                  $data.formError = null
                  remove()
                    .then(() => { $emit('close-request') })
                    .catch(reason => { $data.formError = reason })
                }"
            ></PrintTaskEditor>
          </template>
        </FeathersVuexFormWrapper>
      </section>
    </div>
  </div>
</template>

<script>
import ErrorMessage from '@/components/ErrorMessage'
import PrintTaskEditor from '@/components/PrintTaskEditor'
export default {
  name: 'InputStepFormModal',
  components: { ErrorMessage, PrintTaskEditor },
  computed: {
    isNew() {
      return !this.item || this.item.id === undefined
    },
    modalTitle() {
      let stepName = ''
      switch (this.stepType) {
      case 'PrintTask':
        stepName = 'Druckauftrag'
        break
      default:
        stepName = 'Unbekannt'
      }
      return `${stepName} ${this.isNew ? 'hinzufügen' : 'bearbeiten'}`
    },
  },
  data: function () {
    return {
      formError: null
    }
  },
  props: {
    item: Object,
    stepType: String,
  },
}
</script>
