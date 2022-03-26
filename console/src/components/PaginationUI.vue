<template>
  <nav
    class="my-5"
    role="navigation"
    aria-label="Paginierung"
  >
    <div class="buttons is-centered has-addons">
      <button
        class="button"
        :disabled="!canPrev"
        @click="e => $emit('prev', e)"
      >
        <span class="is-sr-only">Vorherige Seite</span>
        <font-awesome-icon icon="chevron-left" />
      </button>
      <span class="button is-static">Seite {{ currentPage }} von {{ pageCount }}</span>
      <button
        class="button"
        :disabled="!canNext"
        @click="e => $emit('next', e)"
      >
        <span class="is-sr-only">Nächste Seite</span>
        <font-awesome-icon icon="chevron-right" />
      </button>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'PaginationUI',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageCount: {
      type: Number,
      required: true
    },
    canPrev: {
      type: Boolean,
      required: true
    },
    canNext: {
      type: Boolean,
      required: true
    }
  }
}
</script>
