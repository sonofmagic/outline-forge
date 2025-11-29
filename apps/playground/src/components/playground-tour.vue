<script setup lang="ts">
import { driver } from 'driver.js'
import { onMounted } from 'vue'
import 'driver.js/dist/driver.css'

onMounted(() => {
  const tour = driver({
    showProgress: true,
    overlayOpacity: 0.65,
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
        element: '[data-tour="png-image"]',
        popover: {
          title: 'PNG figure',
          description: 'Focus a real image mask to onboard users to your UI hotspots.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="rect-image"]',
        popover: {
          title: 'Floating rectangle',
          description: 'A plain rectangular tile with a layered PNG still works great for guided tours.',
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
</script>

<template>
  <div />
</template>
