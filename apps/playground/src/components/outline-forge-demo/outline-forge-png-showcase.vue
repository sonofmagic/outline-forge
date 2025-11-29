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
  'border-emerald-300/80',
  'bg-emerald-400/10',
  'text-white',
  'shadow-[0_0_25px_rgba(16,185,129,0.35)]',
] as const

const inactiveQualityClasses = [
  'border-white/10',
  'text-slate-300',
  'hover:border-white/30',
  'hover:text-white',
] as const

function imageStyle(image: ImageDemo) {
  const clip = image.clipPath
    ? {
        clipPath: image.clipPath,
        WebkitClipPath: image.clipPath,
      }
    : {}
  return {
    width: `${image.width}px`,
    height: `${image.height}px`,
    outline: `${image.outlineWidth}px ${image.outlineStyle} ${image.outlineColor}`,
    outlineOffset: `${image.outlineOffset}px`,
    ...clip,
  }
}

function selectQuality(option: PngQuality) {
  if (option !== props.selectedQuality) {
    emit('quality-change', option)
  }
}

function textClass(option: PngQuality) {
  return option === props.selectedQuality ? 'text-emerald-200' : 'text-slate-400'
}
</script>

<template>
  <section
    class="
      mt-10 grid gap-6 rounded-3xl border border-white/10 bg-slate-950/60 p-6
      text-slate-100 shadow-2xl ring-1 ring-emerald-200/10
      md:grid-cols-2
    "
  >
    <div class="space-y-3">
      <p class="text-xs tracking-[0.25em] text-emerald-200 uppercase">
        PNG overlay
      </p>
      <h3 class="text-2xl font-semibold text-white">
        Transparent PNG tracing
      </h3>
      <p class="text-sm text-slate-300">
        Outline Forge reads clip-path data on an actual PNG so the stroke hugs the portrait,
        instead of defaulting to its rectangular box.
      </p>
      <dl
        class="
          grid gap-3 text-xs text-slate-300
          sm:grid-cols-2
        "
      >
        <div class="rounded-2xl bg-white/5 px-3 py-2">
          <p class="tracking-wide text-slate-400 uppercase">
            Outline width
          </p>
          <p class="mt-1 font-semibold text-white">
            {{ props.portrait.outlineWidth }}px
          </p>
        </div>
        <div class="rounded-2xl bg-white/5 px-3 py-2">
          <p class="tracking-wide text-slate-400 uppercase">
            Offset
          </p>
          <p class="mt-1 font-semibold text-white">
            {{ props.portrait.outlineOffset }}px
          </p>
        </div>
      </dl>
      <div class="mt-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 text-xs">
          <p class="tracking-[0.2em] text-slate-400 uppercase">
            Tracing quality
          </p>
          <span
            v-if="props.isExtracting"
            class="
              inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2
              py-1 text-emerald-200
            "
          >
            <span class="size-1.5 rounded-full bg-emerald-300" />
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
        <p class="text-xs text-slate-400">
          {{ props.clipStatus }}
        </p>
      </div>
    </div>
    <div class="flex items-center justify-center">
      <div
        class="
          rounded-[32px] bg-linear-to-b from-slate-900 via-slate-950 to-black/80
          p-5 shadow-[0_25px_80px_rgba(8,145,178,0.35)] ring-1 ring-white/10
        "
      >
        <figure
          class="
            overflow-hidden rounded-[28px] bg-slate-900/60 shadow-2xl ring-1
            ring-white/10
          "
          data-outline-forge
          :data-outline-forge-label="props.portrait.title"
          :style="imageStyle(props.portrait)"
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
        <p class="mt-4 text-center text-sm text-slate-300">
          {{ props.portrait.description }}
        </p>
      </div>
    </div>
  </section>
</template>
