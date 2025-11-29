<script setup lang="ts">
import type { PngQuality } from './outline-forge-demo/use-outline-forge-demo'
import { usePlaygroundTheme } from '@/composables/use-playground-theme'
import OutlineForgeCardGrid from './outline-forge-demo/outline-forge-card-grid.vue'
import OutlineForgeFreeflow from './outline-forge-demo/outline-forge-freeflow.vue'
import OutlineForgeHero from './outline-forge-demo/outline-forge-hero.vue'
import OutlineForgePngShowcase from './outline-forge-demo/outline-forge-png-showcase.vue'
import OutlineForgePolygonCollage from './outline-forge-demo/outline-forge-polygon-collage.vue'
import OutlineForgeRectGallery from './outline-forge-demo/outline-forge-rect-gallery.vue'
import OutlineForgeShapeShowcase from './outline-forge-demo/outline-forge-shape-showcase.vue'
import { useOutlineForgeDemo } from './outline-forge-demo/use-outline-forge-demo'
import PlaygroundTour from './playground-tour.vue'

const { theme, toggleTheme } = usePlaygroundTheme()

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
      rounded-3xl border border-playground-border bg-playground-surface p-6
      text-playground-foreground shadow-2xl ring-1 ring-playground-ring
    "
  >
    <PlaygroundTour />
    <OutlineForgeHero
      :theme="theme"
      @randomize="randomizeCards"
      @refresh="refreshForge"
      @toggle-theme="toggleTheme"
    />
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
    <OutlineForgeRectGallery />
    <OutlineForgePolygonCollage />
    <OutlineForgeFreeflow />
  </section>
</template>
