<template>
  <div class="level">
    <div class="level-left">
      <input
        type="date"
        class="input level-item"
        :value="dateValue"
        required
        @change="updateValue"
      >
      <input
        type="time"
        class="input level-item"
        :value="timeValue"
        required
        @change="updateValue"
      >
    </div>
  </div>
</template>

<script>
export default {
  name: 'DateTimePicker',
  props: {
    value: {
      type: Date,
      default: new Date()
    }
  },
  computed: {
    dateValue() {
      const monthNum = this.value.getMonth() + 1
      return `${this.value.getFullYear()}-${this.padZero(monthNum)}-${this.padZero(this.value.getDate())}`
    },
    timeValue() {
      return `${this.padZero(this.value.getHours())}:${this.padZero(this.value.getMinutes())}`
    }
  },
  methods: {
    padZero(value) {
      return value < 10 ? `0${value}` : value
    },
    updateValue(event) {
      const newValue = new Date(this.value.getTime());

      if (event.target.type === 'time') {
        const parts = event.target.value.split(':')
        newValue.setHours(parts[0], parts[1], 0, 0);
      } else if (event.target.type === 'date') {
        const parts = event.target.value.split('-')
        newValue.setFullYear(parts[0], parts[1] - 1, parts[2]);
      }

      this.$emit('input', newValue);
    }
  }
}
</script>

<style scoped>

</style>
