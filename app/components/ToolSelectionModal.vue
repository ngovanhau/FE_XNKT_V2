<template>
  <a-modal
    v-model:open="visible"
    title="Chọn thiết bị"
    width="1200px"
    :footer="null"
    :bodyStyle="{ overflow: 'hidden' }"
     
    @cancel="handleCancel"
  >
    <div class="tool-selection-modal">
      <!-- Search input -->
      <div class="mb-4 flex justify-end">
        <a-input
          v-model:value="searchText"
          placeholder="Tìm kiếm thiết bị..."
          allow-clear
          @input="handleSearch"
          style="width: 30%"
        >
          <template #suffix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>

      <!-- Tools table -->
      <a-table
        :columns="columns"
        :data-source="toolsData"
        :loading="loading"
        :pagination="{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} của ${total} thiết bị`,
          onChange: handlePageChange,
          onShowSizeChange: handlePageSizeChange
        }"
        size="small"
        class="tools-table"
        :scroll="{ y: 400 }"
        :customRow="(record: ToolData) => ({
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
import type { ToolData } from '~/composables/ToolApi'
import { AddTool, GetToolsPaged } from '~/composables/ToolApi'
import { useRoute } from '#app'
// @ts-ignore
import { debounce } from 'lodash-es'

const route = useRoute()
const wocode = route.query.wocode as string

// Props
interface Props {
  visible: boolean
  gian?: string
  bophan?: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'tool-added'): void
}

const emit = defineEmits<Emits>()

// Reactive data
const visible = ref(props.visible)
const loading = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const toolsData = ref<ToolData[]>([])



// Table columns
const columns: TableColumnsType = [
  {
    title: 'Mã thiết bị',
    dataIndex: 'Ma_Tool',
    key: 'Ma_Tool',
    width: 150,
    align: 'left'
  },
  {
    title: 'Tên thiết bị',
    dataIndex: 'Ten_TB',
    key: 'Ten_TB',
    width: 200,
    align: 'left'
  },
  {
    title: 'Nhà sản xuất',
    dataIndex: 'Nha_SX',
    key: 'Nha_SX',
    width: 120
  },
  {
    title: 'Số seri',
    dataIndex: 'So_Seri',
    key: 'So_Seri',
    width: 120
  },
  {
    title: 'Mã ký hiệu',
    dataIndex: 'Ma_Ky_Hieu',
    key: 'Ma_Ky_Hieu',
    width: 120
  },
  {
    title: 'Hạng kiểm định',
    dataIndex: 'Hang_Kiem_Dinh',
    key: 'Hang_Kiem_Dinh',
    width: 120,
    customRender: ({ text }: { text: string }) => {
      if (text) {
        const date = new Date(text)
        return date.toLocaleDateString('vi-VN')
      }
      return ''
    }
  }
]

// Watch props
watch(() => props.visible, (newVal) => {
  visible.value = newVal
  if (newVal) {
    fetchTools()
  }
})

watch(visible, (newVal) => {
  emit('update:visible', newVal)
})

// API call function
const fetchTools = async () => {
  try {
    loading.value = true
    
    const response = await GetToolsPaged({
      currentPage: currentPage.value,
      pageSize: pageSize.value,
      gian: props.gian || '',
      bophan: props.bophan || '',
      search: searchText.value || undefined
    })
    
    if (response?.IsSuccess) {
      toolsData.value = response.Data || []
      // Prefer server totals if provided inside items (total_rows/total_pages)
      const firstItem: any = toolsData.value?.[0]
      const serverTotalRows = firstItem?.total_rows
      const serverTotalPages = firstItem?.total_pages
      if (typeof response.TotalCount === 'number' && response.TotalCount > 0) {
        totalItems.value = response.TotalCount
      } else if (typeof serverTotalRows === 'number' && serverTotalRows > 0) {
        totalItems.value = serverTotalRows
      } else if (typeof serverTotalPages === 'number' && serverTotalPages > 0) {
        totalItems.value = serverTotalPages * pageSize.value
      } else {
        totalItems.value = toolsData.value?.length || 0
      }
    } else {
      toolsData.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('Error fetching tools:', error)
    toolsData.value = []
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
  fetchTools()
}, 500)

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTools()
}

const handlePageSizeChange = (current: number, size: number) => {
  currentPage.value = 1
  pageSize.value = size
  fetchTools()
}

const handleRowClick = async (selectedTool: ToolData) => {
  try {
    loading.value = true
    const response = await AddTool(wocode, selectedTool)
    
    if (response?.IsSuccess) {
      // Emit event to parent to reload data
      emit('tool-added')
      visible.value = false
      resetSelection()
    } else {
      console.error('Failed to add tool:', response)
    }
  } catch (error) {
    console.error('Error adding tool:', error)
  } finally {
    loading.value = false
  }
}



const resetSelection = () => {
  searchText.value = ''
  currentPage.value = 1
}

// Mount
onMounted(() => {
  if (props.visible) {
    fetchTools()
  }
})
</script>

<style scoped>
.tool-selection-modal {
  max-height: 600px;
  /* Remove outer scroll to avoid double scrollbars; inner table handles scrolling */
  overflow: hidden;
  padding-right: 8px;
}


.tools-table {
  flex: 1;
  overflow: hidden;
}

.tools-table :deep(.ant-table-container) {
  height: 100%;
}

.tools-table :deep(.ant-table-body) {
  overflow-y: auto !important;
  max-height: 400px !important;
}

.tools-table :deep(.ant-table-container) {
  max-height: 450px;
}

.tools-table :deep(.ant-table-body) {
  max-height: 400px;
  overflow-y: auto;
}

.tools-table :deep(.ant-table-tbody > tr > td) {
  padding: 8px !important;
  text-align: center !important;
  vertical-align: middle !important;
}

.tools-table :deep(.ant-table-thead > tr > th) {
  text-align: center !important;
  background-color: #f5f5f5 !important;
  font-weight: bold !important;
}

.tools-table :deep(.ant-table-thead > tr > th) {
  background-color: #dedede !important;
}

.tools-table :deep(.ant-table-tbody > tr) {
  cursor: pointer;
}

.tools-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #e6f7ff !important;
}

/* Align "Tên thiết bị" column (2nd column) to the left */
.tools-table :deep(.ant-table-tbody > tr > td:nth-child(2)) {
  text-align: left !important;
}
.tools-table :deep(.ant-table-thead > tr > th:nth-child(2)) {
  text-align: left !important;
}

/* Align "Mã thiết bị" column (1st column) to the left */
.tools-table :deep(.ant-table-tbody > tr > td:nth-child(1)) {
  text-align: left !important;
}
.tools-table :deep(.ant-table-thead > tr > th:nth-child(1)) {
  text-align: left !important;
}
</style>
