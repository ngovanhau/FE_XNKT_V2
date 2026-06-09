<template>
  <div>
    <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm mt-4">
      {{ title }}
    </div>
    <div class="flex w-full" v-if="data">
      <!-- Left Column -->
      <div class="flex flex-1 justify-start items-start">
        <table class="w-full border-collapse">
          <tbody>
            <tr 
              v-for="item in data.Left" 
              :key="item.ND_Line"
              @click="handleRowClick(item)"
              class="cursor-pointer hover:bg-blue-50 transition-colors duration-200 border-b border-gray-200 hover:border-blue-300 h-12 align-middle"
            >
              <td class="p-3 text-sm w-8 text-center align-middle">
                <input 
                  type="checkbox" 
                  :checked="item.ND_ISTICK === '+'"
                  @change.stop="handleCheckboxToggle(item)"
                  class="w-4 h-4 cursor-pointer accent-sky-700"
                />
              </td>
              <td class="p-3 text-sm align-middle">{{ item.ND_CONTENT }} / {{ item.ND_CONTENT2 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Right Column -->
      <div class="flex flex-1 justify-start items-start">
        <table class="w-full border-collapse">
          <tbody>
            <tr 
              v-for="item in data.Right" 
              :key="item.ND_Line"
              @click="handleRowClick(item)"
              class="cursor-pointer hover:bg-blue-50 transition-colors duration-200 border-b border-gray-200 hover:border-blue-300 h-12 align-middle"
            >
              <td class="p-3 text-sm w-8 text-center align-middle">
                <input 
                  type="checkbox" 
                  :checked="item.ND_ISTICK === '+'"
                  @change.stop="handleCheckboxToggle(item)"
                  class="w-4 h-4 cursor-pointer accent-sky-700"
                />
              </td>
              <td class="p-3 text-sm align-middle">{{ item.ND_CONTENT }} / {{ item.ND_CONTENT2 }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Section: Công việc khác -->
    <div v-if="showCongViecKhac" class="w-full  mt-4">
      <div class="flex items-start">
        <div class="p-3 text-sm w-8 text-center">
          <input 
            type="checkbox" 
            id="congViecKhacCheckbox"
            :checked="congViecKhacChecked"
            :disabled="isFormDisabled"
            @change="handleCongViecKhacChange"
            class="w-4 h-4 cursor-pointer accent-sky-700 disabled:cursor-not-allowed"
          />
        </div>
        <div class="p-3 text-sm flex-1">
          <div class="flex items-start gap-3">
            <label for="congViecKhacCheckbox" class="text-sm whitespace-nowrap">
              Công việc khác <br/> Другое
            </label>
            <div class="flex-1">
              <TextareaField
                 label=""
                 v-model="localCongViecKhacText"
                 @blur="handleTextareaBlur"
                 placeholder="Nhập ghi chú thêm về công việc khác..."
                 :rows="4"
                 width="100%"
                 height="120px"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NdTruocData, NdTruocItem } from '~/composables/NDCV'
import TextareaField from '~/components/TextareaField.vue'

// Props
interface Props {
  title: string
  data: NdTruocData | null
  showCongViecKhac?: boolean
  congViecKhacChecked?: boolean
  congViecKhacText?: string
  isFormDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCongViecKhac: false,
  congViecKhacChecked: false,
  congViecKhacText: '',
  isFormDisabled: false
})

// Emits
const emit = defineEmits<{
  'toggle-item': [item: NdTruocItem]
  'update-cong-viec-khac-tick': [checked: boolean]
  'update-cong-viec-khac-text': [text: string]
}>()

// Local reactive state for textarea
const localCongViecKhacText = ref(props.congViecKhacText)

// Watch for props changes
watch(() => props.congViecKhacText, (newValue) => {
  localCongViecKhacText.value = newValue
})

// Methods
const handleRowClick = (item: NdTruocItem) => {
  handleCheckboxToggle(item)
}

const handleCheckboxToggle = (item: NdTruocItem) => {
  // Chỉ emit event, không xử lý API
  emit('toggle-item', item)
}

const handleCongViecKhacChange = (event: Event) => {
  // Lấy giá trị checked từ event target
  const target = event.target as HTMLInputElement
  const newChecked = target.checked
  // Chỉ emit nếu trạng thái checkbox thực sự thay đổi
  if (newChecked !== props.congViecKhacChecked) {
    emit('update-cong-viec-khac-tick', newChecked)
  }
}

const handleTextareaBlur = () => {
  // Chỉ emit nếu text thực sự thay đổi
  if (localCongViecKhacText.value !== props.congViecKhacText) {
    emit('update-cong-viec-khac-text', localCongViecKhacText.value)
  }
}

// Hàm lấy dữ liệu công việc khác
const GetCongViecKhac = () => {
  return {
    checked: props.congViecKhacChecked,
    text: props.congViecKhacText
  }
}

// Hàm cập nhật dữ liệu công việc khác (deprecated - sử dụng events riêng biệt)
const UpdateCongViecKhac = (checked: boolean, text: string) => {
  // Emit cả hai events riêng biệt
  emit('update-cong-viec-khac-tick', checked)
  emit('update-cong-viec-khac-text', text)
}

// Expose các hàm để parent component có thể gọi
defineExpose({
  GetCongViecKhac,
  UpdateCongViecKhac
})
</script>

<style scoped>
/* Component specific styles if needed */
</style>
