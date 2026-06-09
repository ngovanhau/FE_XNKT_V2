<template>
  <div class="min-h-screen flex justify-center bg-white">
    <div class="w-[95%] bg-white rounded-lg shadow p-6">
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
