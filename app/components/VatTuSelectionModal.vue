<template>
  <a-modal
    v-model:open="visible"
    title="Chọn vật tư tiêu hao"
    width="1200px"
    :footer="null"
    @cancel="handleCancel"
    :body-style="{ maxHeight: '70vh', overflow: 'hidden' }"
  >
    <div class="vattu-selection-modal">
      <!-- Search input -->
      <div class="mb-4 flex justify-end">
        <a-input
          v-model:value="searchText"
          placeholder="Tìm kiếm vật tư..."
          allow-clear
          @input="handleSearch"
          style="width: 30%"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- VatTu table -->
      <a-table
        :columns="columns"
        :data-source="vatTuData"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} vật tư`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange
        }"
        size="small"
        class="vattu-table"
        :scroll="{ y: 400 }"
        :customRow="(record: VatTuPartItem) => ({
          onClick: () => handleRowClick(record)
        })"
      >

      </a-table>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import type { TableColumnsType } from 'ant-design-vue'
import type { VatTuPartItem } from '~/composables/VatTuTieuHaoWOApi'
import { GetAllPart } from '~/composables/VatTuTieuHaoWOApi'
// @ts-ignore
import { debounce } from 'lodash-es'

// Props
interface Props {
  visible: boolean
  gian?: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'vattu-selected', vattu: VatTuPartItem): void
}

const emit = defineEmits<Emits>()

// Reactive data
const visible = ref(props.visible)
const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const vatTuData = ref<VatTuPartItem[]>([])

// Table columns
const columns: TableColumnsType = [
  {
    title: 'Mã vật tư',
    dataIndex: 'par_code',
    key: 'par_code',
    width: 150
  },
  {
    title: 'Tên vật tư',
    dataIndex: 'par_desc',
    key: 'par_desc',
    width: 300,
    align: 'left'
  },

  {
    title: 'Mã kho',
    dataIndex: 'sto_store',
    key: 'sto_store',
    width: 120
  },
  {
    title: 'Số lượng tồn',
    dataIndex: 'STO_QTY',
    key: 'STO_QTY',
    width: 120,
    align: 'center' as const
  },
  {
    title: 'Đơn vị tính',
    dataIndex: 'PAR_UOM',
    key: 'PAR_UOM',
    width: 100,
    align: 'center' as const
  },
  {
    title: 'Vị trí',
    dataIndex: 'BIS_BIN',
    key: 'BIS_BIN',
    width: 120
  }
]

// Watch props
watch(() => props.visible, (newVal) => {
  visible.value = newVal
  if (newVal) {
    fetchVatTu()
  }
})

watch(visible, (newVal) => {
  emit('update:visible', newVal)
})

// API call function
const fetchVatTu = async () => {
  try {
    loading.value = true
    
    const response = await GetAllPart(
      currentPage.value,
      pageSize.value,
      searchText.value || undefined,
      props.gian
    )
    
    if (response?.IsSuccess) {
      vatTuData.value = response.Data || []
      // Prefer server totals if provided inside items (total_rows/total_pages)
      const firstItem: any = vatTuData.value?.[0]
      const serverTotalRows = firstItem?.total_rows
      const serverTotalPages = firstItem?.total_pages
      if (typeof serverTotalRows === 'number' && serverTotalRows > 0) {
        totalItems.value = serverTotalRows
      } else if (typeof serverTotalPages === 'number' && serverTotalPages > 0) {
        totalItems.value = serverTotalPages * pageSize.value
      } else {
        totalItems.value = vatTuData.value?.length || 0
      }
    } else {
      vatTuData.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('Error fetching vat tu:', error)
    vatTuData.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Event handlers
const handleCancel = () => {
  visible.value = false
  resetSelection()
}

const handleSearch = debounce(() => {
  currentPage.value = 1
  fetchVatTu()
}, 500)

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchVatTu()
}

const handlePageSizeChange = (current: number, size: number) => {
  currentPage.value = 1
  pageSize.value = size
  fetchVatTu()
}

const handleRowClick = async (selectedVatTu: VatTuPartItem) => {
  try {
    // Emit selected vattu to parent
    emit('vattu-selected', selectedVatTu)
    visible.value = false
    resetSelection()
  } catch (error) {
    console.error('Error selecting vat tu:', error)
  }
}

const resetSelection = () => {
  searchText.value = ''
  currentPage.value = 1
}

// Mount
onMounted(() => {
  if (props.visible) {
    fetchVatTu()
  }
})
</script>

<style scoped>
.vattu-selection-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.vattu-table {
  flex: 1;
  overflow: hidden;
}

.vattu-table :deep(.ant-table-container) {
  height: 100%;
}

.vattu-table :deep(.ant-table-body) {
  overflow-y: auto !important;
  max-height: 400px !important;
}

.vattu-table :deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
  text-align: center !important;
  vertical-align: middle !important;
}

.vattu-table :deep(.ant-table-thead > tr > th) {
  text-align: center !important;
  background-color: #f5f5f5 !important;
  font-weight: bold !important;
}

.vattu-table :deep(.ant-table-thead > tr > th) {
  background-color: #dedede !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 1 !important;
}

.vattu-table :deep(.ant-table-tbody > tr) {
  cursor: pointer;
}

.vattu-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f0f9ff !important;
}

/* Align "Tên vật tư" column (2nd column) to the left */
.vattu-table :deep(.ant-table-tbody > tr > td:nth-child(2)) {
  text-align: left !important;
}
.vattu-table :deep(.ant-table-thead > tr > th:nth-child(2)) {
  text-align: left !important;
}



/* Custom scrollbar styling */
.vattu-table :deep(.ant-table-body::-webkit-scrollbar) {
  width: 8px;
}

.vattu-table :deep(.ant-table-body::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 4px;
}

.vattu-table :deep(.ant-table-body::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 4px;
}

.vattu-table :deep(.ant-table-body::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}
</style>
