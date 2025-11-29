<script setup lang="ts">
const emit = defineEmits<{
  (e: 'randomize'): void
  (e: 'refresh'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="space-y-1">
      <p
        class="
          text-xs font-semibold tracking-[0.25em] text-emerald-300 uppercase
        "
      >
        Outline Forge
      </p>
      <h2 class="text-2xl leading-snug font-semibold text-white">
        Inspect outlines with SVG overlays
      </h2>
      <p class="text-sm text-slate-300">
        Hover or focus a card to watch the overlay follow CSS outline width, style and offset.
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        class="
          rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm
          font-semibold text-white transition
          hover:border-white/40 hover:bg-white/20
        "
        type="button"
        @click="emit('randomize')"
      >
        Randomize outlines
      </button>
      <button
        class="
          rounded-full border border-white/10 px-4 py-2 text-sm font-semibold
          text-white/70 transition
          hover:border-white/30 hover:text-white
        "
        type="button"
        @click="emit('refresh')"
      >
        Refresh overlay
      </button>
    </div>
  </div>
</template>
