<template>
  <div class="w-full p-6">
    <div class="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <div class="text-base font-semibold">Có lỗi xảy ra</div>
      <div class="mt-2 whitespace-pre-wrap text-sm">{{ message }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>
