<template>
    <div class="card mb-2">
        <div class="card-content">
            <article class="media">
                <div class="media-left">
                    <ResourceIcon :resource="resource" size="2x"/>
                </div>
                <div class="media-content">
                    <div class="content">
                        <p class="has-text-weight-bold">
                            <EditableText :item="resource" prop="name"/>
                        </p>
                        <p v-show="resource.identifiers.length">
                            Alternative Namen:
                            <span class="tags">

                            <template v-for="identifier in resource.identifiers">
                                <span class="tag" :key="identifier.id">{{ identifier.value }}</span>
                            </template>
                            </span>
                        </p>
                    </div>
                </div>
                <div class="media-right">
                    <div class="field is-grouped">
                        <p class="control">
                            <router-link class="icon" title="Einsatzmittel bearbeiten" :to="{ name: 'resource-form', params: { id: resource.id } }">
                                <font-awesome-icon icon="edit"/>
                            </router-link>
                        </p>
                        <p class="control">
                            <span class="icon has-text-danger" title="Einsatzmittel entfernen" @click="removeResource(resource.id)">
                                <font-awesome-icon icon="trash-alt"/>
                            </span>
                        </p>
                    </div>

                </div>
            </article>
        </div>
    </div>
</template>
<script>
import ResourceIcon from '@/components/ResourceIcon'
import EditableText from '@/components/EditableText'
export default {
  name: 'ResourceCard',
  components: { EditableText, ResourceIcon },
  props: {
    resource: {}
  }
}
</script>
