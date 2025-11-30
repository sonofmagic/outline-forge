<script setup lang="ts">
import forgeAvatar from '@/assets/forge-avatar.png'

interface PolygonImageDemo {
  id: number
  title: string
  description: string
  clipPath: string
  width: number
  height: number
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: 'solid' | 'dotted'
  background: string
  badge: string
  imageStyle: Record<string, string>
}

function resolvePolygonTourId(demo: PolygonImageDemo): string | undefined {
  if (demo.id === 1) {
    return 'polygon-target'
  }
  if (demo.id === 2) {
    return 'polygon-bleed'
  }
  if (demo.id === 3) {
    return 'polygon-floating'
  }
  return undefined
}

const demos: PolygonImageDemo[] = [
  {
    id: 1,
    title: 'Contained portrait',
    description: 'Image sits fully inside the polygon mask and hugs the outline.',
    badge: 'Inside polygon',
    clipPath: 'polygon(10% 0%, 90% 8%, 100% 45%, 82% 90%, 15% 100%, 0% 60%)',
    width: 340,
    height: 260,
    outlineWidth: 6,
    outlineOffset: 12,
    outlineColor: '#34d399',
    outlineStyle: 'solid',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))',
    imageStyle: {
      width: '70%',
      top: '8%',
      left: '50%',
      transform: 'translate(-50%, 0)',
      borderRadius: '22px',
      boxShadow: '0 25px 50px rgba(15,118,110,0.45)',
    },
  },
  {
    id: 2,
    title: 'Edge breaker',
    description: 'Absolute image bleeds through the polygon edges but shares the same DOM node.',
    badge: 'Bleeding edges',
    clipPath: 'polygon(20% 5%, 80% 0%, 100% 50%, 70% 100%, 10% 90%, 0% 40%)',
    width: 360,
    height: 280,
    outlineWidth: 5,
    outlineOffset: 16,
    outlineColor: '#f97316',
    outlineStyle: 'dotted',
    background: 'linear-gradient(160deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
    imageStyle: {
      width: '85%',
      top: '-6%',
      left: '60%',
      transform: 'translate(-50%, 0) rotate(-3deg)',
      borderRadius: '20px',
      boxShadow: '0 30px 70px rgba(124,45,18,0.5)',
    },
  },
  {
    id: 3,
    title: 'Floating witness',
    description: 'Polygon anchor stays in view while the image floats completely outside.',
    badge: 'Outside anchor',
    clipPath: 'polygon(15% 0%, 85% 5%, 100% 60%, 75% 100%, 10% 90%, 0% 40%)',
    width: 320,
    height: 250,
    outlineWidth: 6,
    outlineOffset: 18,
    outlineColor: '#a78bfa',
    outlineStyle: 'solid',
    background: 'linear-gradient(145deg, rgba(167,139,250,0.25), rgba(79,70,229,0.08))',
    imageStyle: {
      width: '75%',
      top: '60%',
      left: '110%',
      transform: 'translate(-50%, -40%) rotate(4deg)',
      borderRadius: '26px',
      boxShadow: '0 40px 90px rgba(76,29,149,0.55)',
    },
  },
]

function wrapperStyle(demo: PolygonImageDemo) {
  return {
    width: `${demo.width}px`,
    height: `${demo.height}px`,
    clipPath: demo.clipPath,
    background: demo.background,
  }
}

function imageStyle(demo: PolygonImageDemo) {
  return {
    position: 'absolute',
    ...demo.imageStyle,
  }
}
</script>

<template>
  <section
    class="
      mt-10 rounded-3xl border border-playground-border bg-playground-surface
      p-6 text-playground-foreground shadow-[0_30px_120px_rgba(8,47,73,0.6)]
      ring-1 ring-playground-ring
    "
    data-tour="polygons"
  >
    <div class="space-y-2 text-left">
      <p class="text-xs tracking-[0.25em] text-playground-accent uppercase">
        Polygon collage
      </p>
      <h3 class="text-2xl font-semibold text-playground-foreground">
        Absolute imagery inside a single DOM node
      </h3>
      <p class="text-sm text-playground-muted">
        Outline Forge traces the polygon while absolutely positioned PNGs sit inside the same element,
        whether they stay inside the shape, bleed a bit, or float completely outside.
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
          flex flex-col gap-4 rounded-[36px] border border-playground-border
          bg-playground-panel p-4 text-playground-foreground-soft shadow-inner
          shadow-black/20
        "
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-sm tracking-[0.2em] text-playground-subtle uppercase">
              {{ demo.badge }}
            </p>
            <h4 class="text-xl font-semibold text-playground-foreground">
              {{ demo.title }}
            </h4>
          </div>
          <span
            class="
              rounded-full bg-playground-pill px-3 py-1 text-xs
              text-playground-foreground-soft
            "
          >
            {{ demo.outlineWidth }}px outline
          </span>
        </div>
        <p class="text-sm text-playground-muted">
          {{ demo.description }}
        </p>
        <div class="flex items-center justify-center overflow-visible">
          <div
            class="
              relative isolate overflow-visible rounded-[32px] border
              border-playground-border-muted bg-playground-elevated
            "
            :style="wrapperStyle(demo)"
            :data-tour="resolvePolygonTourId(demo)"
          >
            <div class="absolute inset-0">
              <img
                :src="forgeAvatar"
                alt="Polygon collage avatar"
                class="h-auto max-w-none object-cover"
                :style="imageStyle(demo)"
                loading="lazy"
                decoding="async"
              >
            </div>
            <div
              class="
                absolute inset-0 rounded-[32px] border
                border-playground-border-muted
              "
            />
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
