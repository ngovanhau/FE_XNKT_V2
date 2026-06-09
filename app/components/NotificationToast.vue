<template>
  <span />
</template>

<script setup lang="ts">
import { message as antdMessage } from 'ant-design-vue'
import { watch } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    message: string
    duration?: number
  }>(),
  {
    duration: 2000
  }
)

const emit = defineEmits<{
  (e: 'hide'): void
}>()

watch(
  () => props.show,
  (show) => {
    if (!show) return
    antdMessage.info(props.message, props.duration / 1000)
    window.setTimeout(() => emit('hide'), props.duration)
  }
)
</script>
