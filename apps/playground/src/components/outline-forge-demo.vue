<script setup lang="ts">
import type { PngQuality } from './outline-forge-demo/use-outline-forge-demo'

import OutlineForgeCardGrid from './outline-forge-demo/outline-forge-card-grid.vue'
import OutlineForgeHero from './outline-forge-demo/outline-forge-hero.vue'
import OutlineForgePngShowcase from './outline-forge-demo/outline-forge-png-showcase.vue'
import OutlineForgeShapeShowcase from './outline-forge-demo/outline-forge-shape-showcase.vue'
import { useOutlineForgeDemo } from './outline-forge-demo/use-outline-forge-demo'

const {
  cards,
  shapeDemos,
  pngPortrait,
  pngQuality,
  pngClipStatus,
  qualityOptions,
  isExtractingPngClipPath,
  randomizeCards,
  refreshForge,
  handlePngLoad,
  setQuality,
} = useOutlineForgeDemo()

function handleQualityChange(quality: PngQuality) {
  if (pngQuality.value !== quality) {
    setQuality(quality)
  }
}
</script>

<template>
  <section
    class="
      rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-slate-50
      shadow-2xl ring-1 ring-white/5
    "
  >
    <OutlineForgeHero @randomize="randomizeCards" @refresh="refreshForge" />
    <OutlineForgeCardGrid :cards="cards" />
    <OutlineForgeShapeShowcase :shapes="shapeDemos" />
    <OutlineForgePngShowcase
      :portrait="pngPortrait"
      :quality-options="qualityOptions"
      :selected-quality="pngQuality"
      :clip-status="pngClipStatus"
      :is-extracting="isExtractingPngClipPath"
      @quality-change="handleQualityChange"
      @image-load="handlePngLoad"
    />
  </section>
</template>
