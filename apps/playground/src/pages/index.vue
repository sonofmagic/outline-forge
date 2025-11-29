<script setup lang="ts">
import OutlineForgeDemo from '@/components/outline-forge-demo.vue'
</script>

<template>
  <div
    class="
      min-h-screen bg-playground-shell text-playground-foreground
      transition-colors duration-300
    "
  >
    <div class="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <OutlineForgeDemo class="flex-1" />
    </div>
  </div>
</template>
