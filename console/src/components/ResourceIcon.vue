<template>
  <font-awesome-icon
    :icon="getIcon(resource)"
    :size="size"
  />
</template>

<script>
const icons = {
  'organization': 'building',
  'group': 'users',
  'vehicle': 'truck',
  'role': 'user-tag',
  'other': 'tools'
}

export default {
  name: "ResourceIcon",
  props: {
    resource: {
      type: Object,
      required: true
    },
    size: {
      type: String,
      default: null
    }
  },
  methods: {
    getIcon: function (resource) {
      if (!resource || !resource.type || !Object.keys(icons).includes(resource.type.toLowerCase())) {
        return icons['other']
      }

      return icons[resource.type.toLowerCase()]
    },
  }
}
</script>

<style scoped>

</style>
