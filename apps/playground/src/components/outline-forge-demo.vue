<script setup lang="ts">
import { OutlineForge } from 'outline-forge'
import { onBeforeUnmount, onMounted, reactive, shallowRef } from 'vue'
import forgeAvatar from '@/assets/forge-avatar.png'

type StrokeStyle = 'solid' | 'dashed' | 'dotted'

interface DemoCard {
  id: number
  title: string
  description: string
  width: number
  offset: number
  color: string
  style: StrokeStyle
}

interface ShapeDemo {
  id: number
  title: string
  description: string
  width: number
  height: number
  borderRadius?: string
  clipPath?: string
  background: string
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: StrokeStyle
}

interface ImageDemo {
  title: string
  description: string
  src: string
  alt: string
  width: number
  height: number
  clipPath: string
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: StrokeStyle
}

const palette = ['#38bdf8', '#f472b6', '#22d3ee', '#f97316', '#a78bfa', '#4ade80'] as const
const strokeStyles = ['solid', 'dashed', 'dotted'] as const satisfies ReadonlyArray<StrokeStyle>

function pickRandom<T>(items: readonly T[]): T {
  const index = Math.floor(Math.random() * items.length)
  return items[index]!
}

const cards = reactive<DemoCard[]>([
  {
    id: 1,
    title: 'Keyboard focus',
    description: 'Mimics a11y focus rings on inputs & buttons.',
    width: 3,
    offset: 3,
    color: '#38bdf8',
    style: 'solid',
  },
  {
    id: 2,
    title: 'QA hover target',
    description: 'Use a dashed outline to inspect hit boxes.',
    width: 4,
    offset: 6,
    color: '#f97316',
    style: 'dashed',
  },
  {
    id: 3,
    title: 'Error boundary',
    description: 'Highlight nodes flagged by automated checks.',
    width: 2,
    offset: 5,
    color: '#f472b6',
    style: 'dotted',
  },
])

const shapeDemos = reactive<ShapeDemo[]>([
  {
    id: 1,
    title: 'Circle',
    description: 'Perfect for avatars or radar pings.',
    width: 180,
    height: 180,
    borderRadius: '9999px',
    background: 'radial-gradient(circle at 30% 30%, #bfdbfe, #1d4ed8)',
    outlineWidth: 6,
    outlineOffset: 6,
    outlineColor: '#38bdf8',
    outlineStyle: 'solid',
  },
  {
    id: 2,
    title: 'Ellipse',
    description: 'Shows pill-shaped buttons or badges.',
    width: 240,
    height: 140,
    borderRadius: '50% / 35%',
    background: 'linear-gradient(135deg, #fcd34d, #f97316)',
    outlineWidth: 5,
    outlineOffset: 8,
    outlineColor: '#fb923c',
    outlineStyle: 'dashed',
  },
  {
    id: 3,
    title: 'Polygon',
    description: 'Great for irregular hotspots or tooltips.',
    width: 220,
    height: 220,
    clipPath: 'polygon(50% 0%, 93% 25%, 100% 75%, 65% 100%, 35% 100%, 0% 60%, 7% 25%)',
    background: 'linear-gradient(160deg, #f472b6, #a855f7)',
    outlineWidth: 4,
    outlineOffset: 10,
    outlineColor: '#f472b6',
    outlineStyle: 'dotted',
  },
])

const pngPortrait = reactive<ImageDemo>({
  title: 'PNG avatar',
  description: 'A transparent PNG masked with clip-path to mimic a profile photo.',
  src: forgeAvatar,
  alt: 'Abstract PNG avatar',
  width: 220,
  height: 220,
  clipPath: 'circle(46% at 50% 42%)',
  outlineWidth: 6,
  outlineOffset: 12,
  outlineColor: '#fde047',
  outlineStyle: 'solid',
})

const forge = shallowRef<OutlineForge | null>(null)

function styleFor(card: DemoCard) {
  return {
    outline: `${card.width}px ${card.style} ${card.color}`,
    outlineOffset: `${card.offset}px`,
  }
}

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

function imageStyle(image: ImageDemo) {
  return {
    width: `${image.width}px`,
    height: `${image.height}px`,
    clipPath: image.clipPath,
    WebkitClipPath: image.clipPath,
    outline: `${image.outlineWidth}px ${image.outlineStyle} ${image.outlineColor}`,
    outlineOffset: `${image.outlineOffset}px`,
  }
}

function shuffleCard(card: DemoCard) {
  card.width = Math.max(1, Math.round(Math.random() * 4) + 1)
  card.offset = Math.round(Math.random() * 8)
  card.color = pickRandom(palette)
  card.style = pickRandom(strokeStyles)
}

function randomize() {
  cards.forEach(shuffleCard)
  forge.value?.refresh()
}

function refreshForge() {
  forge.value?.refresh()
}

onMounted(() => {
  const instance = new OutlineForge({
    selector: '[data-outline-forge]',
    showLabel: true,
  })
  instance.start()
  forge.value = instance
})

onBeforeUnmount(() => {
  forge.value?.destroy()
  forge.value = null
})
</script>

<template>
  <section
    class="
      rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 text-slate-50
      shadow-2xl ring-1 ring-white/5
    "
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <p
          class="
            text-xs font-semibold tracking-[0.25em] text-emerald-300 uppercase
          "
        >
          Outline Forge
        </p>
        <h2 class="text-2xl leading-snug font-semibold text-white">
          Inspect outlines with SVG overlays
        </h2>
        <p class="text-sm text-slate-300">
          Hover or focus a card to watch the overlay follow CSS outline width, style and offset.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button
          class="
            rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm
            font-semibold text-white transition
            hover:border-white/40 hover:bg-white/20
          "
          type="button"
          @click="randomize"
        >
          Randomize outlines
        </button>
        <button
          class="
            rounded-full border border-white/10 px-4 py-2 text-sm font-semibold
            text-white/70 transition
            hover:border-white/30 hover:text-white
          "
          type="button"
          @click="forge?.refresh()"
        >
          Refresh overlay
        </button>
      </div>
    </div>
    <div
      class="
        mt-6 grid gap-4
        md:grid-cols-3
      "
    >
      <article
        v-for="card in cards"
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
              rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide
              uppercase
            "
          >
            Width {{ card.width }}px
          </div>
          <div
            class="
              rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide
              uppercase
            "
          >
            Offset {{ card.offset }}px
          </div>
          <div
            class="
              rounded-full bg-black/30 px-3 py-1 font-mono tracking-wide
              uppercase
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
      <div
        class="
          mt-8 flex flex-wrap items-start justify-center gap-10
        "
      >
        <div
          v-for="shape in shapeDemos"
          :key="shape.id"
          class="flex w-64 flex-col items-center gap-3 text-center"
        >
          <div
            class="
              flex items-center justify-center shadow-2xl ring-1 ring-white/10
              transition hover:-translate-y-1
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

    <section
      class="
        mt-10 grid gap-6 rounded-3xl border border-white/10 bg-slate-950/60
        p-6 text-slate-100 shadow-2xl ring-1 ring-emerald-200/10
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
        <dl class="grid gap-3 text-xs text-slate-300 sm:grid-cols-2">
          <div class="rounded-2xl bg-white/5 px-3 py-2">
            <p class="uppercase tracking-wide text-slate-400">
              Outline width
            </p>
            <p class="mt-1 font-semibold text-white">
              {{ pngPortrait.outlineWidth }}px
            </p>
          </div>
          <div class="rounded-2xl bg-white/5 px-3 py-2">
            <p class="uppercase tracking-wide text-slate-400">
              Offset
            </p>
            <p class="mt-1 font-semibold text-white">
              {{ pngPortrait.outlineOffset }}px
            </p>
          </div>
        </dl>
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
              overflow-hidden rounded-[28px] bg-slate-900/60 shadow-2xl
              ring-1 ring-white/10
            "
            data-outline-forge
            :data-outline-forge-label="pngPortrait.title"
            :style="imageStyle(pngPortrait)"
          >
            <img
              :src="pngPortrait.src"
              :alt="pngPortrait.alt"
              class="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              @load="refreshForge"
            />
          </figure>
          <p class="mt-4 text-center text-sm text-slate-300">
            {{ pngPortrait.description }}
          </p>
        </div>
      </div>
    </section>
  </section>
</template>
