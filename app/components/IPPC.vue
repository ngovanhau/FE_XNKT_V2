<template>
  <div class="mt-2">
    <div class="font-bold text-center py-3 px-4" 
         style="background-color: #374151; color: white; height: 40px; display: flex; align-items: center; justify-content: center;">
      I/P, P/P, P/I CONVERTERS
    </div>
    <div class="overflow-x-auto">
      <a-table 
        :dataSource="motorData" 
        :columns="motorColumns"
        :pagination="false"
        size="small"
        class="motor-table"
        :scroll="{ x: 1100 }"
      >
        <template #bodyCell="{ column, record, text, index }">
          <template v-if="column.dataIndex === 'NO'">
            <div class="text-center">{{ index + 1 }}</div>
          </template>
          <template v-else-if="isColumnEditable(column.dataIndex as string)">
            <a-input 
              :value="text || ''"
              @input="(e: Event) => handleFieldChange(record as TTLVTBItem, column.dataIndex as string, (e.target as HTMLInputElement).value)"
              @focus="handleCellFocus(record as TTLVTBItem)"
              @blur="handleCellBlur(record as TTLVTBItem)"
              :data-row-no="(record as TTLVTBItem).NO"
              size="small"
              class="border-0 p-1 editable-cell"
            />
          </template>
          <template v-else>
            <span class="text-gray-700">{{ text || '' }}</span>
          </template>
        </template>
      </a-table>
    </div>

    <NotificationToast 
      :show="showNotification"
      :message="notificationMessage"
      :duration="2000"
      @hide="handleNotificationHide"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { TTLVTBItem, TTLVTBUpdateRequest } from '~/composables/TTLVTBApi'
import NotificationToast from '~/components/NotificationToast.vue'

interface Props {
  wocode: string
}

const props = defineProps<Props>()
const { $axios } = useNuxtApp()

const motorData = ref<TTLVTBItem[]>([])
const pendingChanges = ref<Map<number, Partial<TTLVTBItem>>>(new Map())
const currentEditingRow = ref<number | null>(null)
const showNotification = ref(false)
const notificationMessage = ref('Cập nhật thành công!')

const editableColumns = computed(() => [
  'udf1','udf2','udf3','udf4','udf5','udf6','udf7'
])
const isColumnEditable = (dataIndex: string) => editableColumns.value.includes(dataIndex)

const motorColumns = [
  { title: 'No.', dataIndex: 'NO', key: 'NO', width: 60, align: 'center' as const },
  { title: 'Tag Name', dataIndex: 'TAGNAME', key: 'TAGNAME', width: 180, align: 'center' as const },
  { title: 'Description', dataIndex: 'DESCRIPTION', key: 'DESCRIPTION', width: 300, align: 'center' as const },
  { title: 'Range & Unit', dataIndex: 'udf1', key: 'udf1', width: 110, align: 'center' as const },
  { title: 'As found', dataIndex: 'udf2', key: 'udf2', width: 110, align: 'center' as const },
  { title: 'As left', dataIndex: 'udf3', key: 'udf3', width: 110, align: 'center' as const },
  { title: 'Result', dataIndex: 'udf4', key: 'udf4', width: 110, align: 'center' as const },
  { title: 'Remark', dataIndex: 'udf5', key: 'udf5', width: 110, align: 'center' as const },
]

const fetchMotorData = async () => {
  try {
    const { data: response } = await $axios.get('TTLVTB/GetAll', {
      params: { wo: props.wocode, type: 'IPPC' }
    })
    if (response?.IsSuccess) {
      motorData.value = response.Data
    }
  } catch (err) {
    console.error('Error fetching SV data:', err)
  }
}

const updateMotorData = async (record: TTLVTBItem) => {
  try {
    const req: TTLVTBUpdateRequest = {
      NO: record.NO,
      WO_CODE: record.WO_CODE,
      TYPE: record.TYPE || '',
      udf1: record.udf1 || '',
      udf2: record.udf2 || '',
      udf3: record.udf3 || '',
      udf4: record.udf4 || '',
      udf5: record.udf5 || '',
      udf6: record.udf6 || '',
      udf7: '', udf8: '', udf9: '', udf10: '', udf11: '', udf12: '', udf13: '', udf14: '', udf15: ''
    }
    const { data: response } = await $axios.put('TTLVTB/Update', req)
    if (response?.IsSuccess) {
      showNotification.value = true
      notificationMessage.value = 'Cập nhật thành công!'
    } else {
      showNotification.value = true
      notificationMessage.value = 'Cập nhật thất bại!'
    }
  } catch (err) {
    console.error('Error updating data:', err)
    showNotification.value = true
    notificationMessage.value = 'Lỗi khi cập nhật!'
  }
}

const handleFieldChange = (record: TTLVTBItem, field: string, value: string) => {
  if (field in record) {
    (record as any)[field] = value
  }
  const rowKey = record.NO
  if (!pendingChanges.value.has(rowKey)) {
    pendingChanges.value.set(rowKey, {})
  }
  const changes = pendingChanges.value.get(rowKey)!
  ;(changes as any)[field] = value
  currentEditingRow.value = rowKey
}

const handleCellFocus = (record: TTLVTBItem) => {
  currentEditingRow.value = record.NO
}

const handleCellBlur = (record: TTLVTBItem) => {
  const rowKey = record.NO
  setTimeout(async () => {
    const activeEl = document.activeElement as HTMLElement | null
    const activeRowNo = activeEl?.getAttribute('data-row-no')
    if (activeRowNo && Number(activeRowNo) === rowKey) {
      return
    }

    const changes = pendingChanges.value.get(rowKey)
    if (changes && Object.keys(changes).length > 0) {
      await updateMotorData(record)
      pendingChanges.value.delete(rowKey)
    }

    if (currentEditingRow.value === rowKey) {
      currentEditingRow.value = null
    }
  }, 80)
}

const handleNotificationHide = () => {
  showNotification.value = false
}

onMounted(() => {
  fetchMotorData()
})

defineExpose({
  fetchMotorData,
  motorData
})
</script>

<style scoped>
.motor-table {
  border: 0.5px solid #1d1b1b;
}

.editable-cell {
  background-color: #f9f9f9;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  text-align: center;
}

.editable-cell:focus {
  border: 2px solid #000000;
  outline: none;
}


.motor-table :deep(.ant-table-thead > tr > th) {
  font-weight: 600;
  text-align: center;
  border: 0.5px solid #000000;
}

.motor-table :deep(.ant-table-tbody > tr > td) {
  text-align: center;
  padding: 4px 8px;
  border: 0.5px solid #000000;
}

.motor-table :deep(.ant-table-tbody > tr) {
  border: 0.5px solid #000000;
}

.motor-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff;
}

.motor-table :deep(.ant-table) {
  border-collapse: collapse;
}

.motor-table :deep(.ant-table-container) {
  border: 0.5px solid #000000;
}
</style>
