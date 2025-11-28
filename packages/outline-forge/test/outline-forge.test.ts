import type { OutlineVisualStyle } from '../lib'
import { describe, expect, it } from 'vitest'
import { OutlineForge, resolveOutlineStyle } from '../lib'
import { resolveOutlinePath } from '../lib/path-resolver'

describe('resolveOutlineStyle', () => {
  it('returns outline metrics from computed styles', () => {
    const element = document.createElement('button')
    element.style.outline = '4px dashed rgb(30, 60, 90)'
    element.style.outlineOffset = '6px'
    document.body.appendChild(element)

    const style = resolveOutlineStyle(element)
    expect(style).not.toBeNull()
    expect(style?.width).toBeGreaterThan(0)
    expect(style?.offset).toBeCloseTo(6)
    expect(style?.color.toLowerCase()).toContain('rgb')

    element.remove()
  })
})

describe('OutlineForge', () => {
  it('tracks marked elements and exposes snapshots', async () => {
    const forge = new OutlineForge({ selector: '[data-outline-forge]' })
    forge.start()

    const card = document.createElement('div')
    card.setAttribute('data-outline-forge', 'demo-card')
    Object.assign(card.style, {
      width: '160px',
      height: '40px',
      outline: '3px solid rgb(255, 99, 71)',
      outlineOffset: '4px',
    })
    document.body.appendChild(card)

    forge.register(card)
    forge.refresh(card)

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    const snapshots = forge.getActiveSnapshots()
    expect(snapshots.length).toBeGreaterThan(0)
    expect(snapshots[0]?.visual.width).toBeGreaterThan(0)

    forge.destroy()
    card.remove()
  })

  it('creates rounded outline paths based on border radius', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    const rect = {
      left: 20,
      top: 40,
      width: 120,
      height: 80,
      right: 140,
      bottom: 120,
      x: 20,
      y: 40,
      toJSON: () => ({}),
    } as DOMRectReadOnly

    const outline: OutlineVisualStyle = {
      width: 4,
      offset: 6,
      color: '#fff',
      style: 'solid',
    }

    const original = window.getComputedStyle
    window.getComputedStyle = () => ({
      clipPath: 'none',
      borderTopLeftRadius: '30px',
      borderTopRightRadius: '30px',
      borderBottomRightRadius: '30px',
      borderBottomLeftRadius: '30px',
      getPropertyValue: () => '',
    }) as any

    let path = ''
    try {
      path = resolveOutlinePath(element, rect, outline)
    }
    finally {
      window.getComputedStyle = original
    }

    expect(path).toContain('A 38.00 38.00')
    const moveMatch = path.match(/M\s+(-?(?:\d+(?:\.\d+)?|\.\d+))\s+(-?\d*\.?\d+)/)
    expect(moveMatch).not.toBeNull()
    const moveX = Number.parseFloat(moveMatch?.[1] ?? '0')
    const moveY = Number.parseFloat(moveMatch?.[2] ?? '0')
    const inflate = outline.offset + outline.width / 2
    expect(moveX).toBeCloseTo(rect.left + 30, 2)
    expect(moveY).toBeCloseTo(rect.top - inflate, 2)

    element.remove()
  })

  it('derives polygon paths from clip-path polygons', () => {
    const element = document.createElement('div')
    document.body.appendChild(element)

    const rect = {
      left: 50,
      top: 75,
      width: 80,
      height: 80,
      right: 130,
      bottom: 155,
      x: 50,
      y: 75,
      toJSON: () => ({}),
    } as DOMRectReadOnly

    const outline: OutlineVisualStyle = {
      width: 2,
      offset: 0,
      color: '#fff',
      style: 'solid',
    }

    const original = window.getComputedStyle
    window.getComputedStyle = () => ({
      clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
      borderTopLeftRadius: '0px',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
      getPropertyValue: () => '',
    }) as any

    let path = ''
    try {
      path = resolveOutlinePath(element, rect, outline)
    }
    finally {
      window.getComputedStyle = original
    }

    const moveMatch = path.match(/M\s+(-?(?:\d+(?:\.\d+)?|\.\d+))\s+(-?\d*\.?\d+)/)
    expect(moveMatch).not.toBeNull()
    const moveX = Number.parseFloat(moveMatch?.[1] ?? '0')
    const moveY = Number.parseFloat(moveMatch?.[2] ?? '0')

    const expectedX = rect.left + rect.width / 2
    const expectedY = rect.top - outline.width / 2
    expect(moveX).toBeCloseTo(expectedX, 2)
    expect(moveY).toBeLessThan(expectedY + 0.5)

    element.remove()
  })
})
