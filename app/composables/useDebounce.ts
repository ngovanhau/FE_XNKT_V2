import { ref, watch } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number = 500) {
  const debouncedValue = ref<T>(value.value)

  watch(value, (newValue) => {
    const timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, { immediate: false })

  return debouncedValue
}