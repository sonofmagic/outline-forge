<script setup lang="ts">
const props = defineProps<{ theme: 'light' | 'dark' }>()

const emit = defineEmits<{
  (e: 'randomize'): void
  (e: 'refresh'): void
  (e: 'toggle-theme'): void
}>()
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div class="space-y-1">
      <p
        class="
          text-xs font-semibold tracking-[0.25em] text-playground-accent
          uppercase
        "
      >
        Driver.js Demo
      </p>
      <h2 class="text-2xl leading-snug font-semibold text-playground-foreground">
        Tour irregular shapes & floating PNGs
      </h2>
      <p class="text-sm text-playground-muted">
        Outline Forge overlays are disabled for now; use the guided tour to explore each irregular element.
      </p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        class="
          rounded-full border border-playground-border bg-playground-soft px-4
          py-2 text-sm font-semibold text-playground-foreground transition
          hover:border-playground-ring hover:bg-playground-panel
        "
        type="button"
        @click="emit('randomize')"
      >
        Shuffle demo data
      </button>
      <button
        class="
          rounded-full border border-playground-border px-4 py-2 text-sm
          font-semibold text-playground-muted transition
          hover:border-playground-ring hover:text-playground-foreground
        "
        type="button"
        @click="emit('refresh')"
      >
        Restart tour
      </button>
      <button
        class="
          rounded-full border border-playground-border px-4 py-2 text-sm
          font-semibold text-playground-foreground-soft transition
          hover:border-playground-ring hover:text-playground-foreground
        "
        type="button"
        @click="emit('toggle-theme')"
      >
        {{ props.theme === 'light' ? 'Switch to dark' : 'Switch to light' }} mode
      </button>
    </div>
  </div>
</template>
