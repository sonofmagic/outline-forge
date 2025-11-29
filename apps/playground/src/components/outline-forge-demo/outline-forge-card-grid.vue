<script setup lang="ts">
import type { DemoCard } from './use-outline-forge-demo'

const props = defineProps<{ cards: DemoCard[] }>()
</script>

<template>
  <div
    class="
      mt-6 grid gap-4
      md:grid-cols-3
    "
    data-tour="cards"
  >
    <article
      v-for="card in props.cards"
      :key="card.id"
      class="
        rounded-2xl border border-playground-border bg-playground-panel p-4
        transition
        focus-within:border-playground-ring
        hover:border-playground-ring
      "
    >
      <p class="text-sm font-semibold text-playground-accent">
        {{ card.title }}
      </p>
      <p class="mt-2 text-sm text-playground-foreground-soft">
        {{ card.description }}
      </p>
      <dl class="mt-4 flex flex-wrap gap-2 text-xs text-playground-muted">
        <div
          class="
            rounded-full bg-playground-glass px-3 py-1 font-mono tracking-wide
            text-playground-foreground uppercase
          "
        >
          Width {{ card.width }}px
        </div>
        <div
          class="
            rounded-full bg-playground-glass px-3 py-1 font-mono tracking-wide
            text-playground-foreground uppercase
          "
        >
          Offset {{ card.offset }}px
        </div>
        <div
          class="
            rounded-full bg-playground-glass px-3 py-1 font-mono tracking-wide
            text-playground-foreground uppercase
          "
        >
          {{ card.style }}
        </div>
      </dl>
      <button
        class="
          mt-4 inline-flex w-full items-center justify-center rounded-full
          border border-playground-border bg-playground-glass px-3 py-2 text-sm
          font-semibold text-playground-foreground transition
          hover:border-playground-ring hover:bg-playground-panel
          focus-visible:ring-2 focus-visible:ring-playground-accent
          focus-visible:outline-none
        "
        type="button"
      >
        Focus to test
      </button>
    </article>
  </div>
</template>
