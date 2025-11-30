<script setup lang="ts">
import { reactive } from 'vue'
import forgeAvatar from '@/assets/forge-avatar.png'

type StrokeStyle = 'solid' | 'dashed'

interface RectDemo {
  id: number
  title: string
  description: string
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: StrokeStyle
  width: number
  height: number
  borderRadius: string
  background: string
  imageStyle: Record<string, string>
  label: string
  target?: 'container' | 'image'
}

function resolveTourId(demo: RectDemo): string | undefined {
  if (demo.id === 1) {
    return 'rect-inline-image'
  }
  if (demo.id === 2) {
    return 'rect-pinned-png'
  }
  return undefined
}

function shouldTargetImage(demo: RectDemo): boolean {
  return demo.target === 'image'
}

const demos = reactive<RectDemo[]>([
  {
    id: 1,
    title: 'Layered dashboard',
    description: 'Plain rectangle container with absolute PNG layered on top.',
    label: 'Inline image',
    width: 380,
    height: 220,
    borderRadius: '28px',
    outlineWidth: 6,
    outlineOffset: 10,
    outlineColor: '#facc15',
    outlineStyle: 'solid',
    background: 'linear-gradient(135deg, rgba(250,204,21,0.12), rgba(15,23,42,0.6))',
    imageStyle: {
      top: '-20px',
      right: '40px',
      width: '46%',
      transform: 'rotate(-2deg)',
      borderRadius: '20px',
      boxShadow: '0 30px 60px rgba(250,204,21,0.25)',
    },
    target: 'image',
  },
  {
    id: 2,
    title: 'Pinned status',
    description: 'Same DOM node holds gradient background and floating PNG, no clip-path needed.',
    label: 'Pinned PNG',
    width: 340,
    height: 200,
    borderRadius: '24px',
    outlineWidth: 5,
    outlineOffset: 14,
    outlineColor: '#0ea5e9',
    outlineStyle: 'dashed',
    background: 'linear-gradient(145deg, rgba(14,165,233,0.15), rgba(14,165,233,0.04))',
    imageStyle: {
      bottom: '-15px',
      left: '18px',
      width: '55%',
      borderRadius: '18px',
      boxShadow: '0 35px 70px rgba(14,116,144,0.35)',
    },
  },
  {
    id: 3,
    title: 'Metric overlay',
    description: 'Rectangular tile with two PNG panels stacked inside the same element.',
    label: 'Dual panes',
    width: 360,
    height: 230,
    borderRadius: '30px',
    outlineWidth: 6,
    outlineOffset: 12,
    outlineColor: '#a78bfa',
    outlineStyle: 'solid',
    background: 'linear-gradient(160deg, rgba(167,139,250,0.18), rgba(79,70,229,0.08))',
    imageStyle: {
      top: '30px',
      left: '50%',
      width: '60%',
      transform: 'translateX(-50%)',
      borderRadius: '22px',
      boxShadow: '0 25px 65px rgba(76,29,149,0.35)',
    },
  },
])

function wrapperStyle(demo: RectDemo) {
  return {
    width: `${demo.width}px`,
    height: `${demo.height}px`,
    borderRadius: demo.borderRadius,
    background: demo.background,
  }
}

function imageStyle(demo: RectDemo) {
  return {
    position: 'absolute',
    ...demo.imageStyle,
  }
}

function handleImageLoad() {}
</script>

<template>
  <section
    class="
      mt-10 rounded-3xl border border-playground-border bg-playground-surface
      p-6 text-playground-foreground shadow-[0_20px_80px_rgba(15,23,42,0.5)]
      ring-1 ring-playground-ring
    "
  >
    <div class="space-y-2">
      <p class="text-xs tracking-[0.25em] text-playground-accent uppercase">
        Rect canvases
      </p>
      <h3 class="text-2xl font-semibold text-playground-foreground">
        Plain rectangles with layered PNGs
      </h3>
      <p class="text-sm text-playground-muted">
        These tiles skip clip-path completely. Use the Driver.js tour to spotlight the floating PNGs and
        rectangular anchors even without Outline Forge overlays.
      </p>
    </div>
    <div
      class="
        mt-8 grid gap-6
        md:grid-cols-2
        lg:grid-cols-3
      "
    >
      <article
        v-for="demo in demos"
        :key="demo.id"
        class="
          flex flex-col gap-3 rounded-[30px] border border-playground-border
          bg-playground-panel p-4 text-playground-foreground-soft shadow-inner
          shadow-black/30
        "
      >
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs tracking-[0.2em] text-playground-subtle uppercase">
              {{ demo.label }}
            </p>
            <h4 class="text-lg font-semibold text-playground-foreground">
              {{ demo.title }}
            </h4>
          </div>
          <span
            class="
              rounded-full bg-playground-pill px-3 py-1 text-xs
              text-playground-foreground-soft
            "
          >
            {{ demo.outlineWidth }}px / {{ demo.outlineStyle }}
          </span>
        </div>
        <p class="text-sm text-playground-muted">
          {{ demo.description }}
        </p>
        <div class="flex items-center justify-center">
          <div
            class="
              relative isolate overflow-visible border border-playground-border
              bg-playground-elevated
            "
            :style="wrapperStyle(demo)"
            :data-tour="!shouldTargetImage(demo) ? resolveTourId(demo) : undefined"
          >
            <img
              :src="forgeAvatar"
              alt="Rectangle demo"
              class="h-auto max-w-none object-cover"
              :style="imageStyle(demo)"
              loading="lazy"
              decoding="async"
              :data-tour="shouldTargetImage(demo) ? resolveTourId(demo) : undefined"
              @load="handleImageLoad"
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
