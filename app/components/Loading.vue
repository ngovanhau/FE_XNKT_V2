<template>
  <teleport v-if="spinning && fullscreen" to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-white/60 border-t-white" />
    </div>
  </teleport>

  <div v-else-if="spinning" class="flex items-center justify-center py-8">
    <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    spinning: boolean
    fullscreen?: boolean
  }>(),
  {
    fullscreen: false
  }
)
</script>
