<script setup lang="ts">
import forgeAvatar from '@/assets/forge-avatar.png'

interface FreeflowDemo {
  id: number
  title: string
  description: string
  clipPath: string
  width: number
  height: number
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: 'solid' | 'dashed'
  imageStyle: Record<string, string>
  accentColor: string
}

const demos: FreeflowDemo[] = [
  {
    id: 1,
    title: 'No overflow guard',
    description: 'SVG overlay keeps tracking even when the image bleeds without overflow hidden.',
    clipPath: 'polygon(20% 0%, 85% 10%, 100% 60%, 70% 100%, 5% 85%, 0% 30%)',
    width: 360,
    height: 260,
    outlineWidth: 6,
    outlineOffset: 14,
    outlineColor: '#fb7185',
    outlineStyle: 'solid',
    accentColor: '#fb7185',
    imageStyle: {
      width: '80%',
      top: '-15%',
      left: '55%',
      transform: 'translate(-50%, 0) rotate(-4deg)',
      borderRadius: '30px',
      boxShadow: '0 45px 90px rgba(190,24,93,0.55)',
    },
  },
  {
    id: 2,
    title: 'Offset witness',
    description: 'The DOM node keeps clip-path + outline while the image floats entirely outside.',
    clipPath: 'polygon(5% 15%, 45% 0%, 95% 15%, 80% 90%, 10% 100%)',
    width: 320,
    height: 240,
    outlineWidth: 5,
    outlineOffset: 18,
    outlineColor: '#38bdf8',
    outlineStyle: 'dashed',
    accentColor: '#38bdf8',
    imageStyle: {
      width: '85%',
      top: '70%',
      left: '120%',
      transform: 'translate(-50%, -40%) rotate(6deg)',
      borderRadius: '28px',
      boxShadow: '0 50px 110px rgba(14,116,144,0.55)',
    },
  },
]

function wrapperStyle(demo: FreeflowDemo) {
  return {
    width: `${demo.width}px`,
    height: `${demo.height}px`,
    clipPath: demo.clipPath,
    background: 'radial-gradient(circle at 30% 20%, rgba(248,250,252,0.15), rgba(15,23,42,0.4))',
  }
}

function imageStyle(demo: FreeflowDemo) {
  return {
    position: 'absolute',
    ...demo.imageStyle,
  }
}

function chipStyle(color: string) {
  return {
    color,
    backgroundColor: `color-mix(in oklab, ${color}, transparent 80%)`,
  }
}
</script>

<template>
  <section
    class="
      mt-10 rounded-3xl border border-playground-border bg-playground-surface
      p-6 text-playground-foreground shadow-[0_25px_80px_rgba(15,23,42,0.75)]
      ring-1 ring-playground-ring
    "
  >
    <div class="space-y-2">
      <p class="text-xs tracking-[0.25em] text-playground-accent uppercase">
        Overflow optional
      </p>
      <h3 class="text-2xl font-semibold text-playground-foreground">
        No overflow:hidden, still a single DOM node
      </h3>
      <p class="text-sm text-playground-muted">
        Sometimes you need the image to punch out of the polygon. This demo keeps the clip-path + outline
        on the parent but never sets overflow hidden, so the PNG can freely drift.
      </p>
    </div>
    <div
      class="
        mt-8 grid gap-6
        md:grid-cols-2
      "
    >
      <article
        v-for="demo in demos"
        :key="demo.id"
        class="
          flex flex-col gap-3 rounded-[32px] border border-playground-border
          bg-playground-panel p-4 text-playground-foreground-soft shadow-inner
          shadow-black/30
        "
      >
        <div class="flex items-center justify-between gap-2">
          <h4 class="text-lg font-semibold text-playground-foreground">
            {{ demo.title }}
          </h4>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :style="chipStyle(demo.accentColor)"
          >
            {{ demo.outlineStyle }} outline
          </span>
        </div>
        <p class="text-sm text-playground-muted">
          {{ demo.description }}
        </p>
        <div class="flex items-center justify-center">
          <div
            class="
              relative isolate rounded-[30px] border border-playground-border
              bg-playground-panel
            "
            :style="wrapperStyle(demo)"
            :data-tour="demo.id === 1 ? 'freeflow-target' : undefined"
          >
            <img
              :src="forgeAvatar"
              alt="Freeflow avatar"
              class="h-auto max-w-none object-cover"
              :style="imageStyle(demo)"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
