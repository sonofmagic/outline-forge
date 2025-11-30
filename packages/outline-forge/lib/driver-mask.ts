import type { OutlineVisualStyle } from './types'
import { resolveOutlinePath } from './path-resolver'

const DEFAULT_STAGE_PADDING = 10
const DEFAULT_STAGE_RADIUS = 5
const LENGTH_RE = /(-?\d*\.?\d+)/g

export interface DriverMaskOptions {
  stagePadding?: number
  stageRadius?: number
  viewportWidth?: number
  viewportHeight?: number
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return '0'
  }
  return value.toFixed(2)
}

function resolveViewportSize(
  element: HTMLElement,
  options: DriverMaskOptions,
): { width: number, height: number } {
  const doc = element.ownerDocument ?? (typeof document !== 'undefined' ? document : null)
  const view = doc?.defaultView ?? (typeof window !== 'undefined' ? window : null)

  const fallbackWidth = view?.innerWidth ?? doc?.documentElement?.clientWidth ?? 0
  const fallbackHeight = view?.innerHeight ?? doc?.documentElement?.clientHeight ?? 0

  const width = options.viewportWidth ?? fallbackWidth
  const height = options.viewportHeight ?? fallbackHeight
  return {
    width: Number.isFinite(width) && width >= 0 ? width : 0,
    height: Number.isFinite(height) && height >= 0 ? height : 0,
  }
}

function hasClipPath(style: CSSStyleDeclaration): boolean {
  const clip = style.clipPath && style.clipPath !== 'none'
    ? style.clipPath
    : style.getPropertyValue('-webkit-clip-path')
  return Boolean(clip && clip !== 'none')
}

function hasRoundedCorners(style: CSSStyleDeclaration): boolean {
  const corners = [
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ]
  return corners.some((corner) => {
    if (!corner) {
      return false
    }
    const matches = corner.match(LENGTH_RE)
    if (!matches) {
      return false
    }
    return matches.some(value => Number.parseFloat(value) > 0)
  })
}

export function shouldUseElementGeometry(style: CSSStyleDeclaration): boolean {
  return hasClipPath(style) || hasRoundedCorners(style)
}

function buildRoundedStagePath(
  rect: DOMRectReadOnly,
  stagePadding: number,
  stageRadius: number,
): string {
  const paddedWidth = rect.width + stagePadding * 2
  const paddedHeight = rect.height + stagePadding * 2
  const radius = Math.floor(
    Math.max(
      Math.min(stageRadius, paddedWidth / 2, paddedHeight / 2),
      0,
    ),
  )
  const startX = rect.left - stagePadding + radius
  const startY = rect.top - stagePadding
  const innerWidth = paddedWidth - radius * 2
  const innerHeight = paddedHeight - radius * 2

  const r = formatNumber(radius)
  return [
    `M${formatNumber(startX)},${formatNumber(startY)}`,
    `h${formatNumber(innerWidth)}`,
    `a${r},${r} 0 0 1 ${r},${r}`,
    `v${formatNumber(innerHeight)}`,
    `a${r},${r} 0 0 1 -${r},${r}`,
    `h-${formatNumber(innerWidth)}`,
    `a${r},${r} 0 0 1 -${r},-${r}`,
    `v-${formatNumber(innerHeight)}`,
    `a${r},${r} 0 0 1 ${r},-${r}`,
    'z',
  ].join(' ')
}

export function resolveDriverHolePath(
  element: HTMLElement,
  options: DriverMaskOptions = {},
): string | null {
  const stagePadding = options.stagePadding ?? DEFAULT_STAGE_PADDING
  const stageRadius = options.stageRadius ?? DEFAULT_STAGE_RADIUS
  const rect = element.getBoundingClientRect()
  const doc = element.ownerDocument
  const view = doc?.defaultView ?? (typeof window !== 'undefined' ? window : null)
  const style = view?.getComputedStyle(element)
  if (!style) {
    return null
  }

  if (shouldUseElementGeometry(style)) {
    const marker: OutlineVisualStyle = {
      width: 0,
      offset: stagePadding,
      color: 'transparent',
      style: 'solid',
    }
    return resolveOutlinePath(element, rect, marker)
  }

  return buildRoundedStagePath(rect, stagePadding, stageRadius)
}

export function resolveViewportPath(
  element: HTMLElement,
  options: DriverMaskOptions = {},
): string {
  const { width, height } = resolveViewportSize(element, options)
  return `M${formatNumber(width)},0L0,0L0,${formatNumber(height)}L${formatNumber(width)},${formatNumber(height)}L${formatNumber(width)},0Z`
}

export function resolveDriverMaskPath(
  element: HTMLElement,
  options: DriverMaskOptions = {},
): string | null {
  const hole = resolveDriverHolePath(element, options)
  if (!hole) {
    return null
  }
  const viewport = resolveViewportPath(element, options)
  return `${viewport}\n${hole}`
}
