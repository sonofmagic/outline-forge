<script setup lang="ts">
import type { ShapeDemo } from './use-outline-forge-demo'

const props = defineProps<{ shapes: ShapeDemo[] }>()

function shapeStyle(shape: ShapeDemo) {
  return {
    width: `${shape.width}px`,
    height: `${shape.height}px`,
    borderRadius: shape.borderRadius,
    clipPath: shape.clipPath,
    background: shape.background,
    outline: `${shape.outlineWidth}px ${shape.outlineStyle} ${shape.outlineColor}`,
    outlineOffset: `${shape.outlineOffset}px`,
  }
}
</script>

<template>
  <section
    class="
      mt-10 rounded-2xl border border-white/5 bg-white/5 p-6 text-center
      text-white/90 shadow-inner shadow-black/40
    "
  >
    <div class="space-y-2">
      <p class="text-xs tracking-[0.25em] text-emerald-200 uppercase">
        Shape overlays
      </p>
      <h3 class="text-xl font-semibold text-white">
        Circle, ellipse & polygon outlines
      </h3>
      <p class="text-sm text-slate-200">
        Hover any shape to see how Outline Forge respects non-rectangular outlines.
      </p>
    </div>
    <div class="mt-8 flex flex-wrap items-start justify-center gap-10">
      <div
        v-for="shape in props.shapes"
        :key="shape.id"
        class="flex w-64 flex-col items-center gap-3 text-center"
      >
        <div
          class="
            flex items-center justify-center shadow-2xl ring-1 ring-white/10
            transition
            hover:-translate-y-1
          "
          data-outline-forge
          :data-outline-forge-label="shape.title"
          :style="shapeStyle(shape)"
        >
          <span class="text-base font-semibold tracking-wide text-white">
            {{ shape.title }}
          </span>
        </div>
        <p class="text-sm text-slate-200">
          {{ shape.description }}
        </p>
      </div>
    </div>
  </section>
</template>
