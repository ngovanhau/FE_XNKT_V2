<template>
  <div class="w-full mt-6">
    <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm">
      7. Tình trạng thiết bị sau bảo dưỡng / Состояние оборудования после ППР
    </div>
    
    <!-- Row 1: 3 Radio buttons nằm ngang -->
    <div class="flex w-full mt-4">
      <div class="grid grid-cols-3 w-full gap-4 px-4">
        <div class="flex items-start">
          <input 
            type="radio" 
            id="tinhtrang1" 
            name="tinhTrangThietBi" 
            :value="1"
            :checked="tinhTrangThietBi === 1"
            @change="handleTinhTrangThietBiChange(1)"
            :disabled="disabled"
            class="w-4 h-4 mr-2 mt-1 accent-blue-600"
          />
          <label for="tinhtrang1" class="text-sm cursor-pointer">
            Tốt, sẵn sàng hoạt động<br/>
            <span class="text-xs text-gray-600">Исправно, допускается </br>к работе</span>
          </label>
        </div>
        
        <div class="flex items-start">
          <input 
            type="radio" 
            id="tinhtrang2" 
            name="tinhTrangThietBi" 
            :value="2"
            :checked="tinhTrangThietBi === 2"
            @change="handleTinhTrangThietBiChange(2)"
            :disabled="disabled"
            class="w-4 h-4 mr-2 mt-1 accent-blue-600"
          />
          <label for="tinhtrang2" class="text-sm cursor-pointer">
            Có thể hoạt động tạm thời<br/>
            <span class="text-xs text-gray-600">Исправно не в полн.объеме,</br>допуск к раб.</span>
          </label>
        </div>
        
        <div class="flex items-start">
          <input 
            type="radio" 
            id="tinhtrang3" 
            name="tinhTrangThietBi" 
            :value="3"
            :checked="tinhTrangThietBi === 3"
            @change="handleTinhTrangThietBiChange(3)"
            :disabled="disabled"
            class="w-4 h-4 mr-2 mt-1 accent-blue-600"
          />
          <label for="tinhtrang3" class="text-sm cursor-pointer">
            Cần sửa chữa, cấm hoạt động<br/>
            <span class="text-xs text-gray-600">Треб. ремонт,<br/>запрещено работать</span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- Row 2: Thời gian và Nhân lực -->
    <div class="flex w-full mt-6 px-4">
      <div class="w-1/2 flex flex-col">
        <div class="flex items-center">
          <div class="text-sm font-medium mr-4 w-64 shrink-0">
            Tổng thời gian thực hiện bảo dưỡng:
          </div>
          <div class="relative flex items-center">
            <div class="w-64">
              <div class="w-64 rounded border border-slate-300 bg-slate-50 px-3 py-1 text-center text-sm text-slate-700">
                {{ tongThoiGian || '-' }}
              </div>
            </div>
            <div class="w-10">
              <span class="ml-3 text-sm">giờ</span>
            </div>
          </div>
        </div>
        <div class="flex items-center mt-2">
          <div class="text-xs text-gray-600 w-64 shrink-0">TПрактич. время выполнения</div>
          <div class="flex items-center">
            <div class="w-64"></div>
            <div class="w-10">
              <span class="ml-7 text-xs">часов</span>
            </div>
          </div>
        </div>
      </div>
      
       <div class="w-1/2 flex flex-col">
         <div class="flex items-center">
           <div class="text-sm font-medium mr-4 w-56 shrink-0">
             Nhân lực:
           </div>
           <div class="relative flex items-center">
            <div class="w-64">
              <div class="w-64 rounded border border-slate-300 bg-slate-50 px-3 py-1 text-center text-sm text-slate-700">
                {{ nhanLuc || '-' }}
              </div>
            </div>
            <div class="w-10">
              <span class="ml-3 text-sm">người</span>
            </div>
          </div>
        </div>
        <div class="flex items-center mt-2">
          <div class="text-xs text-gray-600 w-56 shrink-0">Колич. исполнителей</div>
          <div class="flex items-center">
            <div class="w-64"></div>
            <div class="w-10">
              <span class="ml-7 text-xs">человек</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { GetTGNL, UpdateWoInfoTinhTrangTbiR5 } from '~/composables/TinhTrangThietBiApi'

// Props
interface Props {
  wocode: string
  initialTinhTrangThietBi?: number | null
  initialTongThoiGian?: string
  initialNhanLuc?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialTinhTrangThietBi: null,
  initialTongThoiGian: '',
  initialNhanLuc: '',
  disabled: false
})

// Emits
interface Emits {
  notification: [message: string]
  'update:tinhTrangThietBi': [value: number | null]
  'update:tongThoiGian': [value: string]
  'update:nhanLuc': [value: string]
}

const emit = defineEmits<Emits>()

// State
const tinhTrangThietBi = ref<number | null>(props.initialTinhTrangThietBi)
const tongThoiGian = ref<string>(props.initialTongThoiGian)
const nhanLuc = ref<string>(props.initialNhanLuc)

// Watch for prop changes
watch(() => props.initialTinhTrangThietBi, (newVal) => {
  tinhTrangThietBi.value = newVal
})

watch(() => props.initialTongThoiGian, (newVal) => {
  tongThoiGian.value = newVal
})

watch(() => props.initialNhanLuc, (newVal) => {
  nhanLuc.value = newVal
})

// Emit changes to parent
watch(tinhTrangThietBi, (newVal) => {
  emit('update:tinhTrangThietBi', newVal)
})

watch(tongThoiGian, (newVal) => {
  emit('update:tongThoiGian', newVal)
})

watch(nhanLuc, (newVal) => {
  emit('update:nhanLuc', newVal)
})

// Handlers
const handleTinhTrangThietBiChange = async (value: number) => {
  if (props.disabled) return
  
  try {
    tinhTrangThietBi.value = value
    await UpdateWoInfoTinhTrangTbiR5(props.wocode, value)
    emit('notification', 'Cập nhật tình trạng thiết bị thành công!')
  } catch (error) {
    console.error('Error updating tình trạng thiết bị:', error)
    emit('notification', 'Lỗi khi cập nhật tình trạng thiết bị!')
  }
}

onMounted(async () => {
  try {
    const res = await GetTGNL(props.wocode)
    if (res?.IsSuccess && Array.isArray(res.Data) && res.Data.length > 0) {
      const item = res.Data[0]
      tongThoiGian.value = item?.udf1 || ''
      nhanLuc.value = item?.udf2 || ''
    }
  } catch (error) {
    console.error('Error GetTGNL:', error)
  }
})
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:disabled {
  cursor: not-allowed;
}
</style>
