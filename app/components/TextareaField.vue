<template>
  <div class="flex items-start w-full max-w-95% mx-auto ">
    <label 
      :for="fieldId" 
      class="text-base font-medium whitespace-nowrap mr-3 pt-1"
    >
      {{ label }}
    </label>
    <textarea 
      :id="fieldId"
      :value="modelValue"
      @input="handleInput"
      @blur="handleBlur"
      :class="textareaClass"
      :rows="rows"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  modelValue: string
  fieldId?: string
  placeholder?: string
  rows?: number
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  fieldId: 'textarea-field',
  placeholder: '',
  rows: 3,
  width: '600px',
  height: '100px'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [value: string]
}>()

const textareaClass = computed(() => {
  return `flex-1 border border-gray-300 rounded-md p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 w-[${props.width}] h-[${props.height}]`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('blur', target.value)
}
</script>

<style scoped>
</style>