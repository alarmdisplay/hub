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
                        <div class="level">
                            <div class="level-left">
                                <div class="level-item" title="Anzahl hinterlegter Schleifen">
                                    <span :class="['icon-text', selcalls.length ? '' : 'has-text-grey-light']">
                                        <span class="icon">
                                            <font-awesome-icon icon="pager"/>
                                        </span>
                                        <span>{{ selcalls.length }}</span>
                                    </span>
                                </div>
                                <div class="level-item" title="Anzahl hinterlegter alternativer Bezeichnungen">
                                    <span :class="['icon-text', altNames.length ? '' : 'has-text-grey-light']">
                                        <span class="icon">
                                            <font-awesome-icon icon="tag"/>
                                        </span>
                                        <span>{{ altNames.length }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="media-right">
                    <router-link class="button" :to="{ name: 'resource-form', params: { id: resource.id } }" title="Einsatzmittel bearbeiten">
                        <span class="icon">
                            <font-awesome-icon icon="edit"/>
                        </span>
                    </router-link>
                </div>
            </article>
        </div>
    </div>
</template>
<script>
import ResourceIcon from '@/components/ResourceIcon'
import EditableText from '@/components/EditableText'
import { makeFindMixin } from 'feathers-vuex'
export default {
  name: 'ResourceCard',
  components: { EditableText, ResourceIcon },
  computed: {
    altNamesParams() {
      return { query: { resourceId: this.resource.id, type: "name" } }
    },
    selcallsParams() {
      return { query: { resourceId: this.resource.id, type: "selcall" } }
    },
  },
  mixins: [
    makeFindMixin({ service: 'resource-identifiers', name: "altNames", local: true }),
    makeFindMixin({ service: 'resource-identifiers', name: "selcalls", local: true }),
  ],
  props: {
    resource: Object
  }
}
</script>
<style>
.media-left {
    text-align: center;
    width: 40px;
}
</style>
