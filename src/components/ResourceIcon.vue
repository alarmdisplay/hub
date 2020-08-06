<template>
    <font-awesome-icon :icon="getIcon(resource)" :size="size"/>
</template>

<script>
const icons = {
  'ORGANIZATION': 'building',
  'GROUP': 'users',
  'VEHICLE': 'truck',
  'ROLE': 'user-tag',
  'OTHER': 'tools'
}

export default {
  name: "ResourceIcon",
  methods: {
    getIcon: function (resource) {
      if (!resource || !resource.type || !Object.keys(icons).includes(resource.type)) {
        return icons['other']
      }

      return icons[resource.type]
    },
  },
  props: {
    resource: {
      type: Object,
      required: true
    },
    size: {
      type: String,
      required: false
    }
  }
}
</script>

<style scoped>

</style>
