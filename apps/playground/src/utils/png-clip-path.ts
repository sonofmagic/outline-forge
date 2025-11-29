interface Point {
  x: number
  y: number
}

const NEIGHBORS: Point[] = [
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
  { x: 1, y: -1 },
]

export interface PNGClipPathOptions {
  alphaThreshold?: number
  /** Maximum dimension (px) used to downscale the source before tracing */
  maxDimension?: number
  /** Simplification tolerance in px on the scaled canvas */
  simplifyTolerance?: number
}

function clampDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback
  }
  return value
}

function scaleDimensions(width: number, height: number, maxDimension: number): [number, number] {
  const max = Math.max(width, height)
  if (max <= maxDimension) {
    return [width, height]
  }
  const scale = maxDimension / max
  return [Math.max(8, Math.round(width * scale)), Math.max(8, Math.round(height * scale))]
}

function getImageDataFromImage(
  image: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
): ImageData | null {
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    return null
  }
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
  try {
    return ctx.getImageData(0, 0, targetWidth, targetHeight)
  }
  catch (error) {
    console.warn('[png-clip-path] Unable to read pixels from image', error)
    return null
  }
}

function createMask(data: ImageData, alphaThreshold: number): Uint8Array {
  const mask = new Uint8Array(data.width * data.height)
  for (let i = 0; i < data.data.length; i += 4) {
    const alpha = data.data[i + 3] ?? 0
    mask[i / 4] = alpha >= alphaThreshold ? 1 : 0
  }
  return mask
}

function isInside(mask: Uint8Array, width: number, height: number, x: number, y: number): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return false
  }
  return mask[y * width + x] === 1
}

function hasOutsideNeighbor(mask: Uint8Array, width: number, height: number, x: number, y: number): boolean {
  if (!isInside(mask, width, height, x, y)) {
    return false
  }
  for (let index = 0; index < 8; index += 1) {
    const neighbor = NEIGHBORS[index]!
    const nx = x + neighbor.x
    const ny = y + neighbor.y
    if (!isInside(mask, width, height, nx, ny)) {
      return true
    }
  }
  return false
}

function findBoundaryStart(mask: Uint8Array, width: number, height: number): Point | null {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (hasOutsideNeighbor(mask, width, height, x, y)) {
        return { x, y }
      }
    }
  }
  return null
}

function traceBoundary(mask: Uint8Array, width: number, height: number): Point[] {
  const start = findBoundaryStart(mask, width, height)
  if (!start) {
    return []
  }

  const boundary: Point[] = []
  let current = { ...start }
  let backtrackIndex = 4 // start by checking neighbor to the left
  const maxIterations = width * height * 4
  let iterations = 0

  do {
    boundary.push({ ...current })
    let found = false
    for (let step = 0; step < 8; step += 1) {
      const direction = (backtrackIndex + 1 + step) % 8
      const neighbor = NEIGHBORS[direction]!
      const nx = current.x + neighbor.x
      const ny = current.y + neighbor.y
      if (isInside(mask, width, height, nx, ny)) {
        current = { x: nx, y: ny }
        backtrackIndex = (direction + 4) % 8
        found = true
        break
      }
    }
    if (!found) {
      break
    }
    iterations += 1
    if (iterations > maxIterations) {
      console.warn('[png-clip-path] boundary tracing aborted (too many iterations)')
      break
    }
  } while (current.x !== start.x || current.y !== start.y)

  return boundary
}

function getSqSegmentDistance(point: Point, start: Point, end: Point): number {
  let x = start.x
  let y = start.y
  let dx = end.x - x
  let dy = end.y - y

  if (dx !== 0 || dy !== 0) {
    const t = ((point.x - x) * dx + (point.y - y) * dy) / (dx * dx + dy * dy)
    if (t > 1) {
      x = end.x
      y = end.y
    }
    else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = point.x - x
  dy = point.y - y
  return dx * dx + dy * dy
}

function simplifyPath(points: Point[], tolerance: number): Point[] {
  if (points.length <= 2) {
    return points.slice()
  }

  const sqTolerance = tolerance * tolerance
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack: Array<{ start: number, end: number }> = [{ start: 0, end: points.length - 1 }]

  while (stack.length > 0) {
    const { start, end } = stack.pop()!
    let maxDistance = 0
    let index = start

    for (let i = start + 1; i < end; i += 1) {
      const distance = getSqSegmentDistance(points[i]!, points[start]!, points[end]!)
      if (distance > maxDistance) {
        index = i
        maxDistance = distance
      }
    }

    if (maxDistance > sqTolerance) {
      keep[index] = 1
      if (index - start > 1) {
        stack.push({ start, end: index })
      }
      if (end - index > 1) {
        stack.push({ start: index, end })
      }
    }
  }

  const simplified: Point[] = []
  for (let i = 0; i < points.length; i += 1) {
    if (keep[i]) {
      simplified.push(points[i]!)
    }
  }
  return simplified
}

function removeSequentialDuplicates(points: Point[]): Point[] {
  return points.filter((point, index) => {
    if (index === 0) {
      return true
    }
    const prev = points[index - 1]!
    return point.x !== prev.x || point.y !== prev.y
  })
}

function toPolygon(points: Point[], width: number, height: number): string {
  const polygon = points
    .map((point) => {
      const px = ((point.x + 0.5) / width) * 100
      const py = ((point.y + 0.5) / height) * 100
      return `${px.toFixed(2)}% ${py.toFixed(2)}%`
    })
    .join(', ')
  return `polygon(${polygon})`
}

export async function extractClipPathFromImage(
  image: HTMLImageElement,
  options: PNGClipPathOptions = {},
): Promise<string | null> {
  if (!image || !image.complete || !image.naturalWidth || !image.naturalHeight) {
    return null
  }

  const alphaThreshold = clampDimension(options.alphaThreshold ?? 8, 8)
  const maxDimension = clampDimension(options.maxDimension ?? 160, 64)
  const simplifyTolerance = options.simplifyTolerance ?? 1.2

  const [targetWidth, targetHeight] = scaleDimensions(image.naturalWidth, image.naturalHeight, maxDimension)
  const imageData = getImageDataFromImage(image, targetWidth, targetHeight)
  if (!imageData) {
    return null
  }

  const mask = createMask(imageData, alphaThreshold)
  const boundary = traceBoundary(mask, imageData.width, imageData.height)
  if (boundary.length < 3) {
    return null
  }

  const simplified = simplifyPath(removeSequentialDuplicates(boundary), simplifyTolerance)
  if (simplified.length < 3) {
    return null
  }

  return toPolygon(simplified, imageData.width, imageData.height)
}
