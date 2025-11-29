<script setup lang="ts">
import type {
  ImageDemo,
  PngQuality,
  QualityOption,
} from './use-outline-forge-demo'

const props = defineProps<{
  portrait: ImageDemo
  qualityOptions: readonly QualityOption[]
  selectedQuality: PngQuality
  clipStatus: string
  isExtracting: boolean
}>()

const emit = defineEmits<{
  (e: 'quality-change', quality: PngQuality): void
  (e: 'image-load', event: Event): void
}>()

const activeQualityClasses = [
  'border-playground-accent',
  'bg-playground-accent-soft',
  'text-playground-foreground',
  'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
] as const

const inactiveQualityClasses = [
  'border-playground-border',
  'text-playground-muted',
  'hover:border-playground-ring',
  'hover:text-playground-foreground',
] as const

function figureStyle(image: ImageDemo) {
  const clip = image.clipPath
    ? {
        clipPath: image.clipPath,
        WebkitClipPath: image.clipPath,
      }
    : {}
  return {
    width: `${image.width}px`,
    height: `${image.height}px`,
    ...clip,
  }
}

function selectQuality(option: PngQuality) {
  if (option !== props.selectedQuality) {
    emit('quality-change', option)
  }
}

function textClass(option: PngQuality) {
  return option === props.selectedQuality ? 'text-playground-accent' : 'text-playground-subtle'
}
</script>

<template>
  <section
    class="
      mt-10 grid gap-6 rounded-3xl border border-playground-border
      bg-playground-surface p-6 text-playground-foreground shadow-2xl ring-1
      ring-playground-ring
      md:grid-cols-2
    "
  >
    <div class="space-y-3">
      <p class="text-xs tracking-[0.25em] text-playground-accent uppercase">
        PNG overlay
      </p>
      <h3 class="text-2xl font-semibold text-playground-foreground">
        Transparent PNG tracing
      </h3>
      <p class="text-sm text-playground-muted">
        This section highlights a PNG portrait so the Driver.js tour can jump to it and describe your
        onboarding cues.
      </p>
      <dl
        class="
          grid gap-3 text-xs text-playground-muted
          sm:grid-cols-2
        "
      >
        <div class="rounded-2xl bg-playground-soft px-3 py-2">
          <p class="tracking-wide text-playground-subtle uppercase">
            Outline width
          </p>
          <p class="mt-1 font-semibold text-playground-foreground">
            {{ props.portrait.outlineWidth }}px
          </p>
        </div>
        <div class="rounded-2xl bg-playground-soft px-3 py-2">
          <p class="tracking-wide text-playground-subtle uppercase">
            Offset
          </p>
          <p class="mt-1 font-semibold text-playground-foreground">
            {{ props.portrait.outlineOffset }}px
          </p>
        </div>
      </dl>
      <div class="mt-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
          <p class="tracking-[0.2em] text-playground-subtle uppercase">
            Tracing quality
          </p>
          <span
            v-if="props.isExtracting"
            class="
              inline-flex items-center gap-1 rounded-full
              bg-playground-accent-soft px-2 py-1 text-playground-accent
            "
          >
            <span class="size-1.5 rounded-full bg-playground-accent" />
            Recomputing…
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in props.qualityOptions"
            :key="option.value"
            type="button"
            class="
              flex min-w-[120px] flex-1 flex-col rounded-2xl border px-3 py-2
              text-left text-sm transition
              sm:flex-none
            "
            :class="
              option.value === props.selectedQuality
                ? activeQualityClasses
                : inactiveQualityClasses
            "
            @click="selectQuality(option.value)"
          >
            <span class="font-semibold">{{ option.label }}</span>
            <span
              class="text-[11px]"
              :class="textClass(option.value)"
            >
              {{ option.description }}
            </span>
          </button>
        </div>
        <p class="text-xs text-playground-subtle">
          {{ props.clipStatus }}
        </p>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div
        class="
          rounded-[32px] bg-linear-to-b from-playground-panel
          via-playground-elevated to-playground-glass p-5
          shadow-[0_25px_80px_rgba(8,145,178,0.35)] ring-1 ring-playground-ring
        "
      >
        <figure
          class="
            overflow-hidden rounded-[28px] bg-playground-panel shadow-2xl ring-1
            ring-playground-ring
          "
          :style="figureStyle(props.portrait)"
          data-tour="png-image"
        >
          <img
            :src="props.portrait.src"
            :alt="props.portrait.alt"
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            @load="emit('image-load', $event)"
          >
        </figure>
        <p class="mt-4 text-center text-sm text-playground-muted">
          {{ props.portrait.description }}
        </p>
      </div>
    </div>
  </section>
</template>
