import type { OutlineForgeOptions, OutlineSnapshot, OutlineVisualStyle } from './types'
import { resolveOutlinePath } from './path-resolver'
import { resolveOutlineStyle } from './style-resolver'

const SVG_NS = 'http://www.w3.org/2000/svg'
const DEFAULT_SELECTOR = '[data-outline-forge]'
const DEFAULT_CLASS_NAME = 'outline-forge-overlay'
const AUTO_DISCOVER_LIMIT = 1500
function isElement(node: unknown): node is HTMLElement {
  return Boolean(
    node
    && typeof (node as Element).nodeType === 'number'
    && (node as Element).nodeType === 1
    && typeof (node as Element).getBoundingClientRect === 'function',
  )
}

function isDoc(node: unknown): node is Document {
  return Boolean(
    node
    && typeof (node as Document).nodeType === 'number'
    && (node as Document).nodeType === 9,
  )
}

interface TrackedNode {
  element: HTMLElement
  group: SVGGElement
  path: SVGPathElement
  label?: SVGTextElement
  visible: boolean
}

interface ResolvedOptions {
  selector: string | null
  autoRegisterInteractive: boolean
  minOutlineWidth: number
  overlayClassName: string
  overlayZIndex: number
  showLabel: boolean
  labelAttribute: string
}

function createResolvedOptions(options: OutlineForgeOptions = {}): ResolvedOptions {
  return {
    selector: options.selector === undefined ? DEFAULT_SELECTOR : options.selector,
    autoRegisterInteractive: options.autoRegisterInteractive ?? true,
    minOutlineWidth: options.minOutlineWidth ?? 0.5,
    overlayClassName: options.overlayClassName?.trim() ?? '',
    overlayZIndex: options.overlayZIndex ?? 2_147_483_640,
    showLabel: options.showLabel ?? true,
    labelAttribute: options.labelAttribute ?? 'data-outline-forge-label',
  }
}

export class OutlineForge {
  private readonly options: ResolvedOptions
  private readonly doc: Document | null
  private readonly rootNode: Document | HTMLElement | null
  private readonly hostElement: HTMLElement | null
  private overlayContainer: HTMLDivElement | null = null
  private svg: SVGSVGElement | null = null
  private mutationObserver?: MutationObserver
  private resizeObserver?: ResizeObserver
  private rafId: number | null = null
  private started = false
  private destroyed = false
  private pending = new Set<HTMLElement>()
  private readonly tracked = new Map<HTMLElement, TrackedNode>()

  private readonly handleMutations = (records: MutationRecord[]) => {
    for (const record of records) {
      if (record.type === 'childList') {
        record.addedNodes.forEach(node => this.handlePotentialAddition(node))
        record.removedNodes.forEach(node => this.handleRemoval(node))
      }
      else if (record.type === 'attributes') {
        if (isElement(record.target)) {
          if (this.options.selector && record.target.matches(this.options.selector)) {
            this.register(record.target)
          }
          this.scheduleUpdate(record.target)
        }
      }
    }
  }

  private readonly handleViewportChange = () => {
    this.scheduleUpdate()
  }

  private readonly handleInteractiveTarget = (event: Event) => {
    if (!isElement(event.target)) {
      return
    }
    this.considerElement(event.target)
  }

  constructor(options: OutlineForgeOptions = {}) {
    this.options = createResolvedOptions(options)

    const environmentReady = typeof window !== 'undefined' && typeof document !== 'undefined'
    if (!environmentReady && !options.root) {
      this.doc = null
      this.rootNode = null
      this.hostElement = null
      return
    }

    const resolved = this.resolveRoot(options.root)
    this.doc = resolved?.doc ?? null
    this.rootNode = resolved?.root ?? null
    this.hostElement = resolved?.host ?? null
  }

  start() {
    if (this.started || this.destroyed) {
      return
    }
    if (!this.doc || !this.rootNode || !this.hostElement) {
      return
    }

    this.started = true
    this.ensureOverlay()
    this.attachObservers()
    this.scanInitialTargets()
    this.scheduleUpdate()
  }

  destroy() {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    this.detachObservers()
    this.tracked.forEach((record) => {
      record.group.remove()
    })
    this.tracked.clear()
    this.overlayContainer?.remove()
    this.overlayContainer = null
    this.svg = null
  }

  register(element: HTMLElement) {
    if (this.destroyed) {
      return
    }
    if (!this.started) {
      this.start()
    }
    if (!this.svg || this.tracked.has(element)) {
      this.scheduleUpdate(element)
      return
    }

    const record = this.createTrackedNode(element)
    this.tracked.set(element, record)
    this.svg.appendChild(record.group)
    this.resizeObserver?.observe(element)
    this.scheduleUpdate(element)
  }

  unregister(element: HTMLElement) {
    const record = this.tracked.get(element)
    if (!record) {
      return
    }
    this.tracked.delete(element)
    this.pending.delete(element)
    this.resizeObserver?.unobserve(element)
    record.group.remove()
  }

  refresh(element?: HTMLElement) {
    if (this.destroyed) {
      return
    }
    if (element) {
      this.scheduleUpdate(element)
    }
    else {
      this.scheduleUpdate()
    }
  }

  getActiveSnapshots(): OutlineSnapshot[] {
    const snapshots: OutlineSnapshot[] = []
    for (const [element, record] of this.tracked) {
      if (!record.visible) {
        continue
      }
      const outline = resolveOutlineStyle(element)
      if (!outline) {
        continue
      }
      snapshots.push({
        element,
        rect: element.getBoundingClientRect(),
        visual: outline,
      })
    }
    return snapshots
  }

  private resolveRoot(
    root?: Document | HTMLElement,
  ): { doc: Document, root: Document | HTMLElement, host: HTMLElement } | null {
    if (isDoc(root)) {
      const host = root.body ?? root.documentElement
      if (!host) {
        return null
      }
      return {
        doc: root,
        root,
        host,
      }
    }

    if (isElement(root)) {
      const doc = root.ownerDocument ?? document
      return {
        doc,
        root,
        host: root,
      }
    }

    const doc = typeof document !== 'undefined' ? document : null
    if (!doc) {
      return null
    }
    const host = doc.body ?? doc.documentElement
    if (!host) {
      return null
    }

    return {
      doc,
      root: doc,
      host,
    }
  }

  private ensureOverlay() {
    if (this.svg || !this.doc || !this.hostElement) {
      return
    }

    const container = this.doc.createElement('div')
    container.classList.add(DEFAULT_CLASS_NAME)
    if (this.options.overlayClassName) {
      for (const token of this.options.overlayClassName.split(' ')) {
        if (token.length > 0) {
          container.classList.add(token)
        }
      }
    }
    Object.assign(container.style, {
      position: 'fixed',
      inset: '0',
      pointerEvents: 'none',
      zIndex: String(this.options.overlayZIndex),
    })

    const svg = this.doc.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('role', 'presentation')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.setAttribute('fill', 'none')
    svg.style.width = '100%'
    svg.style.height = '100%'
    svg.style.pointerEvents = 'none'

    container.appendChild(svg)
    this.hostElement.appendChild(container)

    this.overlayContainer = container
    this.svg = svg
  }

  private attachObservers() {
    if (!this.doc || !this.rootNode) {
      return
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (isElement(entry.target)) {
            this.scheduleUpdate(entry.target)
          }
        }
      })
    }

    if (typeof MutationObserver !== 'undefined') {
      const attributeFilter = ['class', 'style']
      if (this.options.selector?.includes('data-outline-forge')) {
        attributeFilter.push('data-outline-forge')
      }
      if (this.options.labelAttribute && !attributeFilter.includes(this.options.labelAttribute)) {
        attributeFilter.push(this.options.labelAttribute)
      }
      this.mutationObserver = new MutationObserver(this.handleMutations)
      this.mutationObserver.observe(this.rootNode, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter,
      })
    }

    this.doc.addEventListener('scroll', this.handleViewportChange, true)
    this.doc.defaultView?.addEventListener('resize', this.handleViewportChange)

    if (this.options.autoRegisterInteractive) {
      this.doc.addEventListener('focusin', this.handleInteractiveTarget, true)
      this.doc.addEventListener('focusout', this.handleInteractiveTarget, true)
      this.doc.addEventListener('pointerover', this.handleInteractiveTarget, true)
      this.doc.addEventListener('pointerout', this.handleInteractiveTarget, true)
    }
  }

  private detachObservers() {
    this.cancelScheduledUpdate()
    this.resizeObserver?.disconnect()
    this.mutationObserver?.disconnect()
    this.resizeObserver = undefined
    this.mutationObserver = undefined
    this.doc?.removeEventListener('scroll', this.handleViewportChange, true)
    this.doc?.defaultView?.removeEventListener('resize', this.handleViewportChange)
    if (this.options.autoRegisterInteractive) {
      this.doc?.removeEventListener('focusin', this.handleInteractiveTarget, true)
      this.doc?.removeEventListener('focusout', this.handleInteractiveTarget, true)
      this.doc?.removeEventListener('pointerover', this.handleInteractiveTarget, true)
      this.doc?.removeEventListener('pointerout', this.handleInteractiveTarget, true)
    }
  }

  private cancelScheduledUpdate() {
    if (this.rafId == null) {
      return
    }
    const view = this.doc?.defaultView ?? (typeof window !== 'undefined' ? window : null)
    if (!view) {
      return
    }
    if (view.cancelAnimationFrame) {
      view.cancelAnimationFrame(this.rafId)
    }
    else {
      clearTimeout(this.rafId)
    }
    this.rafId = null
  }

  private scheduleUpdate(element?: HTMLElement | null) {
    if (element) {
      this.pending.add(element)
    }

    if (this.rafId != null) {
      return
    }

    const view = this.doc?.defaultView ?? (typeof window !== 'undefined' ? window : null)
    if (!view) {
      return
    }

    const requestFrame
      = view.requestAnimationFrame?.bind(view)
        ?? ((cb: FrameRequestCallback) => {
          const now = view.performance?.now?.() ?? Date.now()
          return view.setTimeout(() => cb(now), 16)
        })
    this.rafId = requestFrame(() => {
      this.rafId = null
      const targets = this.pending.size > 0 ? Array.from(this.pending) : Array.from(this.tracked.keys())
      this.pending.clear()
      for (const target of targets) {
        this.updateElement(target)
      }
    })
  }

  private scanInitialTargets() {
    if (!this.rootNode) {
      return
    }

    if (this.options.selector) {
      const matches = this.rootNode.querySelectorAll<HTMLElement>(this.options.selector)
      matches.forEach(element => this.register(element))
    }

    if (!this.options.autoRegisterInteractive) {
      return
    }

    const autoCandidates = this.rootNode.querySelectorAll<HTMLElement>('*')
    const limit = Math.min(autoCandidates.length, AUTO_DISCOVER_LIMIT)
    for (let index = 0; index < limit; index += 1) {
      const element = autoCandidates.item(index)
      if (element && this.shouldManageElement(element)) {
        this.register(element)
      }
    }
  }

  private shouldManageElement(element: HTMLElement): boolean {
    if (this.options.selector && element.matches(this.options.selector)) {
      return true
    }
    if (!this.options.autoRegisterInteractive) {
      return false
    }

    const outline = resolveOutlineStyle(element)
    return Boolean(outline && outline.width >= this.options.minOutlineWidth)
  }

  private handlePotentialAddition(node: Node) {
    if (!isElement(node)) {
      return
    }
    if (this.shouldManageElement(node)) {
      this.register(node)
    }
    if (node.childElementCount > 0) {
      const selector = this.options.autoRegisterInteractive ? '*' : (this.options.selector ?? '*')
      node.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (this.shouldManageElement(element)) {
          this.register(element)
        }
      })
    }
  }

  private handleRemoval(node: Node) {
    if (!isElement(node)) {
      return
    }
    this.unregister(node)
    node.querySelectorAll<HTMLElement>('*').forEach((child) => {
      this.unregister(child)
    })
  }

  private considerElement(element: HTMLElement) {
    if (this.tracked.has(element)) {
      this.scheduleUpdate(element)
      return
    }
    if (this.shouldManageElement(element)) {
      this.register(element)
    }
  }

  private createTrackedNode(element: HTMLElement): TrackedNode {
    const group = this.doc!.createElementNS(SVG_NS, 'g')
    group.dataset.target = element.tagName.toLowerCase()

    const path = this.doc!.createElementNS(SVG_NS, 'path')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'rgba(255,255,255,0.4)')
    path.setAttribute('stroke-width', '1')
    path.setAttribute('vector-effect', 'non-scaling-stroke')
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('stroke-linecap', 'round')

    group.appendChild(path)

    let label: SVGTextElement | undefined
    if (this.options.showLabel) {
      label = this.doc!.createElementNS(SVG_NS, 'text')
      label.setAttribute('fill', '#fff')
      label.setAttribute('font-size', '11')
      label.setAttribute('font-family', 'system-ui, sans-serif')
      label.setAttribute('paint-order', 'stroke')
      label.setAttribute('stroke', 'rgba(0,0,0,0.65)')
      label.setAttribute('stroke-width', '2')
      group.appendChild(label)
    }

    return {
      element,
      group,
      path,
      label,
      visible: false,
    }
  }

  private hideRecord(record: TrackedNode) {
    record.visible = false
    record.group.style.display = 'none'
  }

  private updateElement(element: HTMLElement) {
    const record = this.tracked.get(element)
    if (!record) {
      return
    }

    const outline = resolveOutlineStyle(element)
    if (!outline || outline.width < this.options.minOutlineWidth) {
      this.hideRecord(record)
      return
    }

    const rect = element.getBoundingClientRect()
    this.applyPath(record, rect, outline)
  }

  private applyPath(record: TrackedNode, rect: DOMRectReadOnly, outline: OutlineVisualStyle) {
    const inflate = outline.offset + outline.width / 2
    const path = resolveOutlinePath(record.element, rect, outline)

    record.path.setAttribute('stroke', outline.color)
    record.path.setAttribute('stroke-width', outline.width.toFixed(2))
    record.path.setAttribute('d', path)
    if (outline.dasharray) {
      record.path.setAttribute('stroke-dasharray', outline.dasharray)
    }
    else {
      record.path.removeAttribute('stroke-dasharray')
    }

    if (record.label) {
      record.label.textContent = this.getLabelText(record.element)
      const labelRect = typeof record.path.getBBox === 'function'
        ? record.path.getBBox()
        : null
      if (labelRect) {
        record.label.setAttribute('x', (labelRect.x + 4).toFixed(2))
        record.label.setAttribute('y', (labelRect.y - 6).toFixed(2))
      }
      else {
        const fallbackX = rect.left - inflate + 4
        const fallbackY = rect.top - inflate - 6
        record.label.setAttribute('x', fallbackX.toFixed(2))
        record.label.setAttribute('y', fallbackY.toFixed(2))
      }
    }

    record.group.style.display = ''
    record.visible = true
  }

  private getLabelText(element: HTMLElement): string {
    const attrName = this.options.labelAttribute
    if (attrName && element.hasAttribute(attrName)) {
      return element.getAttribute(attrName) ?? ''
    }
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label') as string
    }
    if (element.id) {
      return `#${element.id}`
    }
    if (element.classList.length > 0) {
      return `.${Array.from(element.classList).join('.')}`
    }
    return element.tagName.toLowerCase()
  }
}
