<template>
  <span>
    <span
      v-show="!isEditing"
      class="clickable"
      title="Zum Bearbeiten klicken"
      @click.prevent="startEditing"
    >{{ item[prop] || '' }}</span>
    <FeathersVuexInputWrapper
      :item="item"
      :prop="prop"
    >
      <template #default="{ current, createClone, handler }">
        <input
          v-show="isEditing"
          ref="input"
          v-model="current[prop]"
          type="text"
          :class="['input', error ? 'is-danger' : '']"
          @focus="createClone"
          @blur="e => handler(e, save)"
        >
      </template>
    </FeathersVuexInputWrapper>
    <p
      v-if="error"
      class="help is-danger"
    >{{ error.message || error.toString() }}</p>
  </span>
</template>

<script>
export default {
  name: "EditableText",
  props: {
    item: {
      type: Object,
      required: true
    },
    prop: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      error: null,
      isEditing: false
    }
  },
  methods: {
    startEditing() {
      this.isEditing = true
      this.$nextTick().then(() => this.focusInput())
    },
    focusInput() {
      this.$refs.input.focus()
    },
    async save({ clone, data }) {
      this.error = null

      // Save changes to the store
      const updatedItem = clone.commit()

      // Patch only the data that has changed
      return updatedItem.patch({ data: data })
        .then(() => {
          this.isEditing = false
        })
        .catch(reason => {
          this.error = reason
        })
    }
  }
}
</script>

<style scoped>
.clickable {
    cursor: pointer;
}

.clickable:hover {
    background-color: rgba(0, 0, 0, 0.07);
}
</style>
