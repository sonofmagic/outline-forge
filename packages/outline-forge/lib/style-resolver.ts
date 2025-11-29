import type { OutlineStyleName, OutlineVisualStyle } from './types'

const SVG_STROKE_STYLES: Partial<Record<OutlineStyleName, string | undefined>> = {
  dotted: '2 4',
  dashed: '8 5',
  double: '3 4',
  groove: '5 3',
  ridge: '5 3',
  inset: '4 3',
  outset: '4 3',
}

const KEYWORD_LENGTHS: Record<string, number> = {
  thin: 1,
  medium: 3,
  thick: 5,
}

const FALLBACK_COLOR = 'rgba(99, 102, 241, 0.9)' // indigo accent for visibility

function normalizeDatasetStyle(raw?: string | null): OutlineStyleName | undefined {
  if (!raw) {
    return undefined
  }
  const style = raw.toLowerCase() as OutlineStyleName
  if (style === 'auto') {
    return 'solid'
  }
  return style
}

function parseDatasetLength(value?: string | null): number {
  if (!value) {
    return 0
  }
  return parseCssLength(value)
}

function resolveDatasetStyle(element: HTMLElement): OutlineVisualStyle | null {
  const width = parseDatasetLength(element.dataset.outlineForgeWidth)
  if (width <= 0) {
    return null
  }
  const offset = parseDatasetLength(element.dataset.outlineForgeOffset)
  const color = element.dataset.outlineForgeColor || FALLBACK_COLOR
  const style = normalizeDatasetStyle(element.dataset.outlineForgeStyle) ?? 'solid'

  return {
    width,
    offset,
    color,
    style,
    dasharray: mapStrokeDasharray(style),
  }
}

export function parseCssLength(raw?: string | null): number {
  if (!raw) {
    return 0
  }

  const value = Number.parseFloat(raw)
  if (!Number.isNaN(value)) {
    return value
  }

  const keywordValue = KEYWORD_LENGTHS[raw.toLowerCase()]
  return keywordValue ?? 0
}

function normalizeStyle(raw: string): OutlineStyleName {
  const normalized = (raw || 'none').toLowerCase() as OutlineStyleName
  if (normalized === 'auto') {
    return 'solid'
  }
  return normalized
}

export function mapStrokeDasharray(style: OutlineStyleName): string | undefined {
  return SVG_STROKE_STYLES[style]
}

export function resolveOutlineStyle(element: HTMLElement): OutlineVisualStyle | null {
  const view = element.ownerDocument?.defaultView
  if (!view) {
    return null
  }

  const datasetStyle = resolveDatasetStyle(element)
  if (datasetStyle) {
    return datasetStyle
  }

  const computed = view.getComputedStyle(element)
  const inline = element.style
  const style = normalizeStyle(
    computed.outlineStyle
    || inline.outlineStyle
    || inline.outline,
  )
  if (!style || style === 'none') {
    return null
  }

  let width = parseCssLength(computed.outlineWidth)
  if (width <= 0) {
    width = parseCssLength(inline.outlineWidth || inline.outline)
  }
  if (width <= 0) {
    return null
  }

  let offset = parseCssLength(computed.outlineOffset)
  if (offset <= 0) {
    offset = parseCssLength(inline.outlineOffset)
  }

  let color = computed.outlineColor || inline.outlineColor || FALLBACK_COLOR
  if (color === 'invert' || color === 'currentcolor') {
    color = computed.color || FALLBACK_COLOR
  }

  return {
    width,
    offset,
    color,
    dasharray: mapStrokeDasharray(style),
    style,
  }
}
