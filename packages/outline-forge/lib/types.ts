export type OutlineStyleName
  = | 'auto'
    | 'solid'
    | 'dotted'
    | 'dashed'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'inset'
    | 'outset'
    | 'none'

export interface OutlineVisualStyle {
  width: number
  offset: number
  color: string
  style: OutlineStyleName
  dasharray?: string
}

export interface OutlineSnapshot {
  element: HTMLElement
  rect: DOMRectReadOnly
  visual: OutlineVisualStyle
}

export interface OutlineForgeOptions {
  /**
   * Optional selector used to eagerly register targets.
   * Defaults to the `[data-outline-forge]` attribute selector.
   */
  selector?: string | null
  /**
   * Provide an alternative root. Defaults to `document`.
   */
  root?: Document | HTMLElement
  /**
   * Whether to listen to focus and pointer events to auto-discover outlines.
   * Enabled by default for better ergonomics.
   */
  autoRegisterInteractive?: boolean
  /**
   * Minimum outline width (px) before rendering a marker.
   * Defaults to `0.5`.
   */
  minOutlineWidth?: number
  /**
   * Extra class added to the overlay container.
   */
  overlayClassName?: string
  /**
   * Controls overlay stacking order. Defaults to `2147483640`.
   */
  overlayZIndex?: number
  /**
   * Render optional labels near each outline. Enabled by default.
   */
  showLabel?: boolean
  /**
   * Attribute used for labels. Fallbacks to aria-label, id or tag name.
   */
  labelAttribute?: string
}
