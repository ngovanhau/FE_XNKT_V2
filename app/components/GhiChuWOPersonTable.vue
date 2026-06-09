<template>
  <div>
    <!-- Section 9: Ghi chú, đề xuất, kiến nghị -->
    <div class="w-full mt-6">
      <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm">
        9. Ghi chú, đề xuất, kiến nghị / Примечание:
      </div>
      <div class="mt-4">
        <div>
          <a-textarea
            v-model:value="ghiChuDeXuat"
            :rows="6"
            placeholder="Nhập ghi chú, đề xuất, kiến nghị..."
            @blur="handleGhiChuBlur"
            class="w-full"
            show-count
            :disabled="disabled"
          />
        </div>
      </div>
    </div>
    
    <!-- Section 10: WO Person Data Table -->
    <div class="w-full mt-6">
      <div class="mt-4">
        <a-table
          :columns="woPersonColumns"
          :data-source="woPersonData"
          :loading="woPersonLoading"
          :pagination="false"
          :scroll="{ x: 900 }"
          class="wo-person-table"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'ViTri'">
              <div class="text-left font-medium" v-html="formatViTri(record.ViTri)"></div>
            </template>
            <template v-else-if="column.dataIndex === 'ChucDanh'">
              <div class="text-center">
                {{ record.ChucDanh }}
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'HoTen'">
              <div class="text-center">
                <a-select
                  v-model:value="record.MaPer"
                  show-search
                  placeholder="Chọn người"
                  :filter-option="false"
                  :loading="woPersonLoadingStates.get(index) || false"
                  @focus="() => loadPersonOptionsForWOCell(index)"
                  @search="(value: string) => handlePersonSearchInWOCell(value, index)"
                  @select="handlePersonSelectInWOCell($event, record as WOPersonData, index)"
                  @popupScroll="handleNguoiChoPhepPopupScroll"
                  @popup-scroll="handleNguoiChoPhepPopupScroll"
                  class="w-full"
                  size="small"
                  :disabled="disabled"
                >
                
                  <!-- Hiển thị option từ data ban đầu nếu chưa có options -->
                  <a-select-option
                    v-if="!woPersonOptions.get(index)?.length && record.MaPer && record.HoTen"
                    :key="record.MaPer"
                    :value="record.MaPer"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium">{{ record.HoTen }}</span>
                      <span class="text-xs text-gray-500">{{ record.ChucDanh }}</span>
                    </div>
                  </a-select-option>
                  <!-- Hiển thị options từ API -->
                  <a-select-option
                    v-for="person in getPersonOptionsForWORow(index)"
                    :key="person.per_code"
                    :value="person.per_code"
                  >
                    <div class="flex flex-col">
                      <span class="font-medium">{{ person.per_desc }}</span>
                      <span class="text-xs text-gray-500">{{ person.per_jobtitle }}</span>
                    </div>
                  </a-select-option>
                </a-select>
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'ChuKy'">
              <div class="text-center" v-html="record.ChuKy || ''">
              </div>
            </template>
            <template v-else-if="column.dataIndex === 'Ngay'">
              <div class="text-center">
                <div v-for="(line, i) in formatNgay(record.Ngay)" :key="i">
                  {{ line }}
                </div>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { UpdateGhiChuR5, GetWODataListORA, SavePersonTable } from '~/composables/GhiChuKienNghi'
import { GetNguoiChoPhep } from '~/composables/PersonApi'
import type { WOPersonData } from '~/composables/PersonApi'

// Props
interface Props {
  wocode: string
  gian?: string
  bophan?: string
  disabled?: boolean
  initialGhiChu?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  initialGhiChu: ''
})

// Emits
interface Emits {
  notification: [message: string]
}

const emit = defineEmits<Emits>()
const ghiChuDeXuat = ref<string>(props.initialGhiChu)

const resolveWoCodeForRequest = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search || '')
    const fromUrl = (params.get('wocode') || params.get('wo') || params.get('WO') || '').trim()
    if (fromUrl) return fromUrl
  }
  return String(props.wocode || '').trim()
}

// Watch for changes in initialGhiChu prop
watch(
  () => props.initialGhiChu,
  (newValue) => {
    console.log('initialGhiChu prop changed:', newValue)
    ghiChuDeXuat.value = newValue || ''
  },
  { immediate: true }
)

// Section 10: WO Person Data state
const woPersonData = ref<WOPersonData[]>([])
const woPersonLoading = ref<boolean>(false)
const woPersonOptions = ref<Map<number, any[]>>(new Map())
const woPersonLoadingStates = ref<Map<number, boolean>>(new Map())
const woPersonSearchValues = ref<Map<number, string>>(new Map())

// Cache dùng chung cho tất cả hàng: NguoiChoPhep theo gian
const nguoiChoPhepOptions = ref<any[]>([])
const nguoiChoPhepLoaded = ref<boolean>(false)
const nguoiChoPhepStartRow = ref<number>(1)
const nguoiChoPhepHasMore = ref<boolean>(true)
const nguoiChoPhepLoadingMore = ref<boolean>(false)
const nguoiChoPhepPageSize = 50

// Section 10: WO Person Data table columns configuration
const woPersonColumns = [
  {
    title: '',
    dataIndex: 'ViTri',
    key: 'ViTri',
    width: 200,
    align: 'left' as const,
    customRender: ({ record }: { record: WOPersonData }) => {
      if (record.ViTri === 'KS Đ-TĐH') return 'KS Đ-TĐH'
      if (record.ViTri === 'CV Đ-TĐH') return 'CV Đ-TĐH'
      if (record.ViTri === 'KST CK') return 'KST CK'
      if (record.ViTri === 'Gian trưởng') return 'Gian trưởng'
      return record.ViTri
    }
  },
  {
    title: 'Chức danh / Должность',
    dataIndex: 'ChucDanh',
    key: 'ChucDanh',
    width: 200,
    align: 'center' as const
  },
  {
    title: 'Họ Tên / Ф.И.О',
    dataIndex: 'HoTen',
    key: 'HoTen',
    width: 200,
    align: 'center' as const
  },
  {
    title: 'Chữ ký / Подпись',
    dataIndex: 'ChuKy',
    key: 'ChuKy',
    width: 150,
    align: 'center' as const
  },
  {
    title: 'Ngày / дата',
    dataIndex: 'Ngay',
    key: 'Ngay',
    width: 150,
    align: 'center' as const
  }
]

// Section 9: Handle ghi chú blur event
const handleGhiChuBlur = async () => {
  if (props.disabled) return
  const woCode = resolveWoCodeForRequest()
  if (!woCode) {
    emit('notification', 'Thiếu woCode để cập nhật ghi chú!')
    return
  }
  try {
    const response = await UpdateGhiChuR5(woCode, ghiChuDeXuat.value || '')
    if (response?.IsSuccess) {
      emit('notification', 'Cập nhật ghi chú thành công!')
    }
  } catch (error) {
    console.error('Error updating ghi chú:', error)
    emit('notification', 'Lỗi khi cập nhật ghi chú!')
  }
}

// Note: GhiChu data is now received via props from parent component

// Section 10: Fetch WO Person Data
const fetchWOPersonData = async () => {
  const woCode = resolveWoCodeForRequest()
  if (!woCode) return
  try {
    woPersonLoading.value = true
    const response = await GetWODataListORA(woCode)
    if (response?.IsSuccess && response.Data) {
      woPersonData.value = response.Data
      
      // Load options cho 3 hàng đầu nếu có gian và bophan
      if (props.gian) {
        // Prefetch một lần cho toàn bảng
        await loadPersonOptionsForWOCell(0)
      }
    }
  } catch (error) {
    console.error('Error fetching WO person data:', error)
  } finally {
    woPersonLoading.value = false
  }
}

// Section 10: Load person options for specific cell
const loadPersonOptionsForWOCell = async (rowIndex: number) => {
  if (props.disabled) return
  
  try {
    woPersonLoadingStates.value.set(rowIndex, true)
    // Luôn dùng API Part/NguoiChoPhep theo yêu cầu, nhưng cache 1 lần
    if (props.gian) {
      if (!nguoiChoPhepLoaded.value) {
        await loadNguoiChoPhepFirstPage()
      }
      // Set options cho dòng hiện tại và đồng bộ cho các dòng khác nếu cần
      woPersonOptions.value.set(rowIndex, nguoiChoPhepOptions.value)
      for (let i = 0; i < woPersonData.value.length; i++) {
        if (!woPersonOptions.value.get(i)) {
          woPersonOptions.value.set(i, nguoiChoPhepOptions.value)
        }
      }
    }
  } catch (error) {
    console.error('Error loading person options for WO cell:', error)
  } finally {
    woPersonLoadingStates.value.set(rowIndex, false)
  }
}

const mergeUniqueByCode = (current: any[], incoming: any[]) => {
  const map = new Map<string, any>()
  for (const item of current) map.set(item.per_code, item)
  for (const item of incoming) map.set(item.per_code, item)
  return Array.from(map.values())
}

const fetchNguoiChoPhepPage = async (org: string, startrowValue: number, append: boolean) => {
  const response = await GetNguoiChoPhep(org, startrowValue)
  const raw = response?.data || []
  const mapped = raw.map((item: any) => ({
    per_code: item.schedgroup || item.userdefinedfieldvalue,
    per_desc: stripJobTitle(item.schedgroupdesc || item.description),
    per_jobtitle: (item.JobTitle?.trim() || parseJobTitle(item.schedgroupdesc || item.description) || '').trim()
  }))
  if (append) {
    const before = nguoiChoPhepOptions.value
    const merged = mergeUniqueByCode(before, mapped)
    const added = merged.length - before.length
    nguoiChoPhepOptions.value = merged
    nguoiChoPhepHasMore.value = added > 0 && mapped.length > 0
    nguoiChoPhepLoaded.value = true
    return added
  }

  nguoiChoPhepOptions.value = mapped
  nguoiChoPhepHasMore.value = mapped.length > 0
  nguoiChoPhepLoaded.value = true
  return mapped.length
}

const loadNguoiChoPhepFirstPage = async () => {
  if (!props.gian) return
  nguoiChoPhepStartRow.value = 1
  nguoiChoPhepHasMore.value = true
  nguoiChoPhepOptions.value = []
  await fetchNguoiChoPhepPage(props.gian, nguoiChoPhepStartRow.value, false)
}

const loadNguoiChoPhepMore = async () => {
  if (!props.gian) return
  if (nguoiChoPhepLoadingMore.value) return
  if (!nguoiChoPhepHasMore.value) return

  nguoiChoPhepLoadingMore.value = true
  try {
    const nextStartRow = nguoiChoPhepStartRow.value + nguoiChoPhepPageSize
    const loadedCount = await fetchNguoiChoPhepPage(props.gian, nextStartRow, true)
    if (loadedCount > 0) {
      nguoiChoPhepStartRow.value = nextStartRow
    }
  } finally {
    nguoiChoPhepLoadingMore.value = false
  }
}

const handleNguoiChoPhepPopupScroll = async (e: any) => {
  let el = e?.target as HTMLElement | undefined
  while (el && el.scrollHeight <= el.clientHeight && el.parentElement) {
    el = el.parentElement
  }
  if (!el) return

  const threshold = 64
  if (el.scrollTop + el.clientHeight + threshold >= el.scrollHeight) {
    await loadNguoiChoPhepMore()
  }
}

// Section 10: Handle person search in WO cell
const handlePersonSearchInWOCell = (value: string, rowIndex: number) => {
  if (props.disabled) return
  
  woPersonSearchValues.value.set(rowIndex, value)
}

// Section 10: Handle person select in WO cell
const handlePersonSelectInWOCell = async (value: string, record: WOPersonData, rowIndex: number) => {
  if (props.disabled) return
  const woCode = resolveWoCodeForRequest()
  if (!woCode) {
    emit('notification', 'Thiếu woCode để cập nhật người!')
    return
  }
  
  try {
    const options = woPersonOptions.value.get(rowIndex) || []
    
    // Tìm người được chọn trong options (cả 3 hàng đầu và hàng cuối đều có cùng cấu trúc)
    const selectedPerson = options.find((person: any) => person.per_code === value)
    if (selectedPerson) {
      record.HoTen = selectedPerson.per_desc
      record.ChucDanh = selectedPerson.per_jobtitle || ''
      record.MaPer = selectedPerson.per_code
    }
    
    // Cập nhật status = 1 cho record được chọn
    record.status = 1
    
    // Gọi API để cập nhật toàn bộ danh sách
    const updateData = woPersonData.value.map(item => ({
      idRow: item.idRow,
      ViTri: item.ViTri,
      ChucDanh: item.ChucDanh || '',
      HoTen: item.HoTen || '',
      MaPer: item.MaPer || '',
      ChuKy: item.ChuKy || '',
      Ngay: item.Ngay || '',
      status: item.status || 0
    }))
    
    await SavePersonTable(woCode, updateData)
    
    emit('notification', 'Cập nhật người thành công!')
    
  } catch (error) {
    console.error('Error selecting person in WO cell:', error)
    emit('notification', 'Lỗi khi cập nhật người!')
  }
}

// Section 10: Get person options for specific row
const getPersonOptionsForWORow = (rowIndex: number) => {
  const options = nguoiChoPhepLoaded.value
    ? nguoiChoPhepOptions.value
    : (woPersonOptions.value.get(rowIndex) || [])
  const searchValue = woPersonSearchValues.value.get(rowIndex) || ''
  
  if (!searchValue) return options
  
  // Filter theo per_desc (cả 3 hàng đầu và hàng cuối đều có cùng cấu trúc)
  return options.filter((person: any) => 
    person.per_desc?.toLowerCase().includes(searchValue.toLowerCase())
  )
}

// Helpers để tách chức danh từ mô tả
const parseJobTitle = (desc: string): string => {
  const match = desc?.match(/\(([^)]+)\)/)
  return match && match[1] ? match[1].trim() : ''
}

const stripJobTitle = (desc: string): string => {
  return (desc || '').replace(/\s*\([^)]*\)\s*$/, '').trim()
}

const formatViTri = (text: string): string => {
  return (text || '').replace(/\r\n|\n|\r/g, '<br/>')
}

const formatNgay = (value?: string | null): string[] => {
  const raw = (value || '').toString()
  if (!raw) return ['']

  const toDateMonthYear = (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return ''

    // Giữ nguyên nếu đã ở định dạng dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      return trimmed
    }

    // Parse ISO hoặc chuỗi date hợp lệ, trả về dd/MM/yyyy
    const date = new Date(trimmed)
    if (!Number.isNaN(date.getTime())) {
      const dd = String(date.getDate()).padStart(2, '0')
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const yyyy = date.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }

    return trimmed
  }

  const parts = raw
    .split(/<br\s*\/?>|\r\n|\n|\r/gi)
    .map((p) => p.trim())
    .filter(Boolean)

  const formatted = parts.map(toDateMonthYear)
  return formatted.length ? formatted : ['']
}

// Expose methods for parent component
defineExpose({
  fetchWOPersonData,
  ghiChuDeXuat
})

// Initialize data on mount
onMounted(async () => {
  // Fetch WO Person data
  await fetchWOPersonData()
})

watch(
  () => props.gian,
  () => {
    nguoiChoPhepLoaded.value = false
    nguoiChoPhepOptions.value = []
    nguoiChoPhepStartRow.value = 1
    nguoiChoPhepHasMore.value = true
  }
)
</script>

<style scoped>
.wo-person-table :deep(.ant-table-thead > tr > th) {
  border: 0.5px solid #000 !important;
  padding: 12px 16px !important;
  text-align: center !important;
  font-weight: 600 !important;
  background-color: #374151 !important;
  color: white !important;
}

.wo-person-table :deep(.ant-table-tbody > tr > td) {
  border: 0.5px solid #000 !important;
  padding: 8px 12px !important;
}

.wo-person-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f9fafb !important;
}

/* Hide Ant Design measure row */
.wo-person-table :deep(.ant-table-measure-row) {
  display: none !important;
}
</style>
