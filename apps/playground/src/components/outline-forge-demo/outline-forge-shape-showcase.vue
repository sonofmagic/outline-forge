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
  }
}
</script>

<template>
  <section
    class="
      mt-10 rounded-2xl border border-playground-border bg-playground-panel p-6
      text-center text-playground-foreground shadow-inner shadow-black/40
    "
    data-tour="shapes"
  >
    <div class="space-y-2">
      <p class="text-xs tracking-[0.25em] text-playground-accent uppercase">
        Shape overlays
      </p>
      <h3 class="text-xl font-semibold text-playground-foreground">
        Circle, ellipse & polygon outlines
      </h3>
      <p class="text-sm text-playground-foreground-soft">
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
            flex items-center justify-center shadow-2xl ring-1
            ring-playground-ring transition
            hover:-translate-y-1
          "
          :style="shapeStyle(shape)"
          :data-tour="shape.id === 1 ? 'shape-circle' : undefined"
        >
          <span
            class="
              text-base font-semibold tracking-wide text-playground-foreground
            "
          >
            {{ shape.title }}
          </span>
        </div>
        <p class="text-sm text-playground-foreground-soft">
          {{ shape.description }}
        </p>
      </div>
    </div>
  </section>
</template>
