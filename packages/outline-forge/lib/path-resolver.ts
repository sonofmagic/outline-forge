import type { OutlineVisualStyle } from './types'

interface Point {
  x: number
  y: number
}

interface CornerRadii {
  topLeft: Point
  topRight: Point
  bottomRight: Point
  bottomLeft: Point
}

interface RectLike {
  x: number
  y: number
  width: number
  height: number
}

const NUMBER_RE = /(-?\d*\.?\d+)/

function clampRectDimension(value: number): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return 0
  }
  return Math.max(0, value)
}

function parseLength(value: string | null | undefined, relative: number): number {
  if (!value) {
    return 0
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return 0
  }
  if (trimmed.endsWith('%')) {
    const percent = Number.parseFloat(trimmed)
    if (Number.isFinite(percent)) {
      return (percent / 100) * relative
    }
    return 0
  }
  const match = trimmed.match(NUMBER_RE)
  if (!match) {
    return 0
  }
  const valueNumber = Number.parseFloat(match[0] ?? '')
  return Number.isFinite(valueNumber) ? valueNumber : 0
}

function parseCornerRadius(value: string, width: number, height: number): Point {
  const parts = value.trim().split(/\s+/)
  const horizontal = parseLength(parts[0], width)
  const vertical = parseLength(parts[1] ?? parts[0], height)
  return {
    x: clampRectDimension(horizontal),
    y: clampRectDimension(vertical),
  }
}

function addInflate(radius: Point, amount: number): Point {
  return {
    x: clampRectDimension(radius.x + amount),
    y: clampRectDimension(radius.y + amount),
  }
}

function scaleCorner(corner: Point, factor: number) {
  corner.x *= factor
  corner.y *= factor
}

function normalizeRadii(rect: RectLike, radii: CornerRadii): CornerRadii {
  const { width, height } = rect
  if (width <= 0 || height <= 0) {
    return {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
    }
  }

  const horizontalSumTop = radii.topLeft.x + radii.topRight.x
  const horizontalSumBottom = radii.bottomLeft.x + radii.bottomRight.x
  const verticalSumLeft = radii.topLeft.y + radii.bottomLeft.y
  const verticalSumRight = radii.topRight.y + radii.bottomRight.y

  const horizontalScale = Math.min(
    1,
    horizontalSumTop > width ? width / horizontalSumTop : 1,
    horizontalSumBottom > width ? width / horizontalSumBottom : 1,
  )
  const verticalScale = Math.min(
    1,
    verticalSumLeft > height ? height / verticalSumLeft : 1,
    verticalSumRight > height ? height / verticalSumRight : 1,
  )

  const scale = Math.min(horizontalScale, verticalScale)
  if (scale < 1) {
    scaleCorner(radii.topLeft, scale)
    scaleCorner(radii.topRight, scale)
    scaleCorner(radii.bottomRight, scale)
    scaleCorner(radii.bottomLeft, scale)
  }

  return radii
}

function roundedRectPath(rect: RectLike, radii: CornerRadii): string {
  const { x, y, width, height } = rect
  const p = [] as string[]
  const topLeftX = x + radii.topLeft.x
  const topRightX = x + width - radii.topRight.x
  const rightTopY = y + radii.topRight.y
  const rightBottomY = y + height - radii.bottomRight.y
  const bottomRightX = x + width - radii.bottomRight.x
  const bottomLeftX = x + radii.bottomLeft.x
  const leftBottomY = y + height - radii.bottomLeft.y
  const leftTopY = y + radii.topLeft.y

  p.push(`M ${formatNumber(topLeftX)} ${formatNumber(y)}`)
  p.push(`H ${formatNumber(topRightX)}`)
  if (radii.topRight.x > 0 || radii.topRight.y > 0) {
    p.push(
      `A ${formatNumber(radii.topRight.x)} ${formatNumber(radii.topRight.y)} 0 0 1 ${formatNumber(
        x + width,
      )} ${formatNumber(rightTopY)}`,
    )
  }
  p.push(`V ${formatNumber(rightBottomY)}`)
  if (radii.bottomRight.x > 0 || radii.bottomRight.y > 0) {
    p.push(
      `A ${formatNumber(radii.bottomRight.x)} ${formatNumber(radii.bottomRight.y)} 0 0 1 ${formatNumber(
        bottomRightX,
      )} ${formatNumber(y + height)}`,
    )
  }
  p.push(`H ${formatNumber(bottomLeftX)}`)
  if (radii.bottomLeft.x > 0 || radii.bottomLeft.y > 0) {
    p.push(
      `A ${formatNumber(radii.bottomLeft.x)} ${formatNumber(radii.bottomLeft.y)} 0 0 1 ${formatNumber(
        x,
      )} ${formatNumber(leftBottomY)}`,
    )
  }
  p.push(`V ${formatNumber(leftTopY)}`)
  if (radii.topLeft.x > 0 || radii.topLeft.y > 0) {
    p.push(
      `A ${formatNumber(radii.topLeft.x)} ${formatNumber(radii.topLeft.y)} 0 0 1 ${formatNumber(
        topLeftX,
      )} ${formatNumber(y)}`,
    )
  }
  p.push('Z')
  return p.join(' ')
}

function formatNumber(value: number): string {
  return Number.isFinite(value) ? value.toFixed(2) : '0'
}

function parseClipPathPolygon(clipPath: string, rect: DOMRectReadOnly): Point[] | null {
  const match = clipPath.match(/polygon\((.+)\)/i)
  if (!match) {
    return null
  }
  let content = match[1]?.trim() ?? ''
  if (!content) {
    return null
  }

  if (/^(?:nonzero|evenodd)/i.test(content)) {
    const comma = content.indexOf(',')
    if (comma === -1) {
      return null
    }
    content = content.slice(comma + 1).trim()
  }

  const points: Point[] = []
  const rawPoints = content.split(',')
  for (const raw of rawPoints) {
    const [rawX, rawY] = raw.trim().split(/\s+/)
    if (!rawX || !rawY) {
      continue
    }
    const x = rect.left + parseLength(rawX, rect.width)
    const y = rect.top + parseLength(rawY, rect.height)
    points.push({ x, y })
  }
  return points.length >= 3 ? points : null
}

function polygonOrientation(points: Point[]): number {
  let area = 0
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!
    const next = points[(index + 1) % points.length]!
    area += current.x * next.y - next.x * current.y
  }
  return area >= 0 ? 1 : -1
}

function edgeNormal(a: Point, b: Point, orientation: number): Point {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  if (!length) {
    return { x: 0, y: 0 }
  }
  if (orientation >= 0) {
    return {
      x: dy / length,
      y: -dx / length,
    }
  }
  return {
    x: -dy / length,
    y: dx / length,
  }
}

function lineIntersection(p1: Point, p2: Point, p3: Point, p4: Point): Point {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)
  if (Math.abs(denom) < 1e-5) {
    return {
      x: p2.x,
      y: p2.y,
    }
  }

  const det1 = p1.x * p2.y - p1.y * p2.x
  const det2 = p3.x * p4.y - p3.y * p4.x
  const x = (det1 * (p3.x - p4.x) - (p1.x - p2.x) * det2) / denom
  const y = (det1 * (p3.y - p4.y) - (p1.y - p2.y) * det2) / denom
  return { x, y }
}

function offsetPolygon(points: Point[], offset: number): Point[] {
  if (!Number.isFinite(offset) || Math.abs(offset) < 1e-3) {
    return points.map(point => ({ ...point }))
  }
  const orientation = polygonOrientation(points)
  const result: Point[] = []
  for (let index = 0; index < points.length; index += 1) {
    const prev = points[(index - 1 + points.length) % points.length]!
    const current = points[index]!
    const next = points[(index + 1) % points.length]!

    const normalPrev = edgeNormal(prev, current, orientation)
    const normalNext = edgeNormal(current, next, orientation)

    const prevShiftedStart = {
      x: prev.x + normalPrev.x * offset,
      y: prev.y + normalPrev.y * offset,
    }
    const prevShiftedEnd = {
      x: current.x + normalPrev.x * offset,
      y: current.y + normalPrev.y * offset,
    }

    const nextShiftedStart = {
      x: current.x + normalNext.x * offset,
      y: current.y + normalNext.y * offset,
    }
    const nextShiftedEnd = {
      x: next.x + normalNext.x * offset,
      y: next.y + normalNext.y * offset,
    }

    const point = lineIntersection(prevShiftedStart, prevShiftedEnd, nextShiftedStart, nextShiftedEnd)
    result.push(point)
  }
  return result
}

function polygonPath(points: Point[]): string {
  if (points.length === 0) {
    return ''
  }
  const commands = [`M ${formatNumber(points[0]!.x)} ${formatNumber(points[0]!.y)}`]
  for (let index = 1; index < points.length; index += 1) {
    commands.push(`L ${formatNumber(points[index]!.x)} ${formatNumber(points[index]!.y)}`)
  }
  commands.push('Z')
  return commands.join(' ')
}

function resolvePolygonPath(
  clipPath: string,
  rect: DOMRectReadOnly,
  inflate: number,
): string | null {
  const points = parseClipPathPolygon(clipPath, rect)
  if (!points) {
    return null
  }
  const inflated = offsetPolygon(points, inflate)
  return polygonPath(inflated)
}

export function resolveOutlinePath(
  element: HTMLElement,
  rect: DOMRectReadOnly,
  outline: OutlineVisualStyle,
): string {
  const inflate = outline.offset + outline.width / 2
  const view = element.ownerDocument?.defaultView
  const computed = view?.getComputedStyle(element)
  const rawClipPath = computed?.clipPath && computed.clipPath !== 'none'
    ? computed.clipPath
    : computed?.getPropertyValue('-webkit-clip-path') || null
  const clipPath = rawClipPath && rawClipPath !== 'none' ? rawClipPath : null

  if (clipPath) {
    const polygon = resolvePolygonPath(clipPath, rect, inflate)
    if (polygon) {
      return polygon
    }
  }

  const outerRect: RectLike = {
    x: rect.left - inflate,
    y: rect.top - inflate,
    width: clampRectDimension(rect.width + inflate * 2),
    height: clampRectDimension(rect.height + inflate * 2),
  }

  const baseRadii: CornerRadii = {
    topLeft: { x: 0, y: 0 },
    topRight: { x: 0, y: 0 },
    bottomRight: { x: 0, y: 0 },
    bottomLeft: { x: 0, y: 0 },
  }

  if (computed) {
    baseRadii.topLeft = addInflate(
      parseCornerRadius(computed.borderTopLeftRadius, rect.width, rect.height),
      inflate,
    )
    baseRadii.topRight = addInflate(
      parseCornerRadius(computed.borderTopRightRadius, rect.width, rect.height),
      inflate,
    )
    baseRadii.bottomRight = addInflate(
      parseCornerRadius(computed.borderBottomRightRadius, rect.width, rect.height),
      inflate,
    )
    baseRadii.bottomLeft = addInflate(
      parseCornerRadius(computed.borderBottomLeftRadius, rect.width, rect.height),
      inflate,
    )
  }

  const radii = normalizeRadii(outerRect, baseRadii)
  return roundedRectPath(outerRect, radii)
}
