<script setup lang="ts">
import { driver } from 'driver.js'
import { resolveDriverMaskPath } from 'outline-forge'
import { onMounted, onUnmounted } from 'vue'
import 'driver.js/dist/driver.css'

const STAGE_PADDING = 10
const STAGE_RADIUS = 5

let tour: ReturnType<typeof driver> | null = null

function resolveOverlayPath(element: HTMLElement): string | null {
  return resolveDriverMaskPath(element, {
    stagePadding: STAGE_PADDING,
    stageRadius: STAGE_RADIUS,
  })
}

onMounted(() => {
  tour = driver({
    showProgress: true,
    overlayOpacity: 0.65,
    stagePadding: STAGE_PADDING,
    stageRadius: STAGE_RADIUS,
    overlayPathResolver: ({ element }) => resolveOverlayPath(element) ?? undefined,
    steps: [
      {
        element: '[data-tour="shape-circle"]',
        popover: {
          title: 'Irregular circle',
          description: 'Driver.js can highlight this curved card even without any Outline Forge overlays.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="shape-ellipse"]',
        popover: {
          title: 'Elliptical badge',
          description: 'Ellipses and pills stay crisp thanks to the geometry-aware SVG mask.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="shape-polygon"]',
        popover: {
          title: 'Polygon hotspot',
          description: 'Complex clip-path polygons are traced precisely, keeping focus tight.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="png-image"]',
        popover: {
          title: 'PNG figure',
          description: 'Focus a real image mask to onboard users to your UI hotspots.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="cards"]',
        popover: {
          title: 'Outline controls',
          description: 'These cards demonstrate classic focus rings, so the tour calls them out too.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="rect-inline-image"]',
        popover: {
          title: 'Inline PNG layer',
          description: 'The tour can isolate the floating inline PNG even when it bleeds outside its container.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="rect-pinned-png"]',
        popover: {
          title: 'Pinned PNG tile',
          description: 'Driver.js now follows the dashed rectangle that pins the PNG without clip-path help.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="polygon-target"]',
        popover: {
          title: 'Polygon collage',
          description: 'Highlight complex DOM nodes that combine clip-paths and absolute imagery.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="polygon-bleed"]',
        popover: {
          title: 'Bleeding polygon',
          description: 'Even when PNGs spill outside, the mask keeps the polygon anchor precise.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="polygon-floating"]',
        popover: {
          title: 'Detached anchor',
          description: 'The overlay tracks the polygon while the art floats freely nearby.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="freeflow-target"]',
        popover: {
          title: 'Overflow-free flow',
          description: 'Even shapes without overflow hidden can be toured, perfect for bleeding hero art.',
          side: 'top',
        },
      },
    ],
  })

  tour.drive()
})

onUnmounted(() => {
  tour?.destroy()
  tour = null
})
</script>

<template>
  <div />
</template>
