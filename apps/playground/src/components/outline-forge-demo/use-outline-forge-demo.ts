import { computed, reactive, ref } from 'vue'
import forgeAvatar from '@/assets/forge-avatar.png'

export type StrokeStyle = 'solid' | 'dashed' | 'dotted'

export interface DemoCard {
  id: number
  title: string
  description: string
  width: number
  offset: number
  color: string
  style: StrokeStyle
}

export interface ShapeDemo {
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

export interface ImageDemo {
  title: string
  description: string
  src: string
  alt: string
  width: number
  height: number
  clipPath?: string
  outlineWidth: number
  outlineOffset: number
  outlineColor: string
  outlineStyle: StrokeStyle
}

export type PngQuality = 'eco' | 'balanced' | 'high'

export interface QualityOption {
  value: PngQuality
  label: string
  description: string
}

const palette = ['#38bdf8', '#f472b6', '#22d3ee', '#f97316', '#a78bfa', '#4ade80'] as const
const strokeStyles = ['solid', 'dashed', 'dotted'] as const satisfies ReadonlyArray<StrokeStyle>

const qualityOptions = [
  {
    value: 'eco',
    label: 'Eco',
    description: 'Fast & rough',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Default trade-off',
  },
  {
    value: 'high',
    label: 'High fidelity',
    description: 'Smoothest outline',
  },
] as const satisfies ReadonlyArray<QualityOption>

export function useOutlineForgeDemo() {
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

  const isExtractingPngClipPath = ref(false)
  const pngQuality = ref<PngQuality>('balanced')

  const pngClipStatus = computed(() => 'Driver tour only — outlines disabled for now')

  function shuffleCard(card: DemoCard) {
    card.width = Math.max(1, Math.round(Math.random() * 4) + 1)
    card.offset = Math.round(Math.random() * 8)
    card.color = palette[Math.floor(Math.random() * palette.length)]!
    card.style = strokeStyles[Math.floor(Math.random() * strokeStyles.length)]!
  }

  function randomizeCards() {
    cards.forEach(shuffleCard)
  }

  function refreshForge() {
    // Outline Forge is disabled; placeholder for button wiring.
  }

  function handlePngLoad() {
    // No-op while Outline Forge is disabled.
  }

  return {
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
    setQuality: (quality: PngQuality) => {
      pngQuality.value = quality
    },
  }
}
