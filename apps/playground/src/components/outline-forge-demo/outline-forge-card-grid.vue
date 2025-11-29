<script setup lang="ts">
import type { DemoCard } from './use-outline-forge-demo'

const props = defineProps<{ cards: DemoCard[] }>()

function styleFor(card: DemoCard) {
  return {
    outline: `${card.width}px ${card.style} ${card.color}`,
    outlineOffset: `${card.offset}px`,
  }
}
</script>

<template>
  <div
    class="
      mt-6 grid gap-4
      md:grid-cols-3
    "
  >
    <article
      v-for="card in props.cards"
      :key="card.id"
      class="
        rounded-2xl border border-white/10 bg-white/5 p-4 transition
        focus-within:border-white/30
        hover:border-white/30
      "
      data-outline-forge
      :data-outline-forge-label="card.title"
      :style="styleFor(card)"
    >
      <p class="text-sm font-semibold text-emerald-200">
        {{ card.title }}
      </p>
      <p class="mt-2 text-sm text-slate-200">
        {{ card.description }}
      </p>
      <dl class="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
        <div
          class="
            rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide uppercase
          "
        >
          Width {{ card.width }}px
        </div>
        <div
          class="
            rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide uppercase
          "
        >
          Offset {{ card.offset }}px
        </div>
        <div
          class="
            rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide uppercase
          "
        >
          {{ card.style }}
        </div>
      </dl>
      <button
        class="
          mt-4 inline-flex w-full items-center justify-center rounded-full
          border border-white/30 bg-black/30 px-3 py-2 text-sm font-semibold
          text-white transition
          hover:border-white/60 hover:bg-white/10
          focus-visible:ring-2 focus-visible:ring-emerald-400
          focus-visible:outline-none
        "
        type="button"
      >
        Focus to test
      </button>
    </article>
  </div>
</template>
