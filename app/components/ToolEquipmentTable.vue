<template>
  <div>
    <!-- Section 3: Danh mục thiết bị -->
    <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm mt-4">
      3. Danh mục thiết bị chuẩn sử dụng cho việc bảo dưỡng / Используемое оборудование и приборы
    </div>
    <div class="mt-2">
      <a-table 
        :columns="toolColumns" 
        :data-source="toolDataWithEmptyRow" 
        :loading="toolLoading"
        :pagination="false"
        size="small"
        class="tool-table thin-border"
        :custom-row="(record: ToolData, index: number) => {
          return {
            onClick: () => {
              if (typeof index !== 'undefined' && index >= toolData.length) {
                openToolModal()
              }
            }
          }
        }"
      >
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.key === 'stt'">
            {{ index < toolData.length ? index + 1 : '' }}
          </template>
          <template v-if="column.key === 'Ten_TB'">
            <template v-if="index >= toolData.length">
              <div
                class="text-gray-400 italic cursor-pointer text-center"
                @click.stop="openToolModal()"
              >
                <SearchOutlined />
                <span class="ml-1">Choose tools</span>
              </div>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template v-if="column.key === 'action'">
            <template v-if="index < toolData.length">
              <a-button
                type="primary" 
                size="small" 
                class="action-delete-btn"
                @click.stop="handleDeleteTool(record as ToolData)"
              >
                <template #icon>
                  <DeleteOutlined />
                </template>
              </a-button>
            </template>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import type { ToolData } from '~/composables/ToolApi'

// Props
interface Props {
  toolData: ToolData[]
  toolLoading: boolean
}

const props = defineProps<Props>()

// Emits
interface Emits {
  openToolModal: []
  deleteToolItem: [tool: ToolData]
}

const emit = defineEmits<Emits>()

// No pagination: show all data

// Tool columns configuration
const toolColumns = [
  {
    title: 'STT',
    key: 'stt',
    width: 60,
    align: 'center' as const
  },
  {
    title: () => h('div', { innerHTML: 'Tên thiết bị<br/>Наименование' }),
    dataIndex: 'Ten_TB',
    key: 'Ten_TB',
    width: 200
  },
  {
    title: () => h('div', { innerHTML: 'Ký mã hiệu<br/>Тип, модель' }),
    dataIndex: 'Ma_Ky_Hieu',
    key: 'Ma_Ky_Hieu',
    width: 120
  },
  {
    title: () => h('div', { innerHTML: 'Số seri<br/>Заводской номер' }),
    dataIndex: 'So_Seri',
    key: 'So_Seri',
    width: 120
  },
  {
    title: () => h('div', { innerHTML: 'Nhà sản xuất<br/>Производитель' }),
    dataIndex: 'Nha_SX',
    key: 'Nha_SX',
    width: 120
  },
  {
    title: () => h('div', { innerHTML: 'Hạng kiểm định<br/>Дата поверки' }),
    dataIndex: 'Hang_Kiem_Dinh',
    key: 'Hang_Kiem_Dinh',
    width: 150,
    customRender: ({ text }: { text: string }) => {
      if (text) {
        return new Date(text).toLocaleDateString('vi-VN')
      }
      return ''
    }
  },
  {
    title: '',
    key: 'action',
    width: 80,
    align: 'center' as const
  }
]

// Computed properties
const toolDataWithEmptyRow = computed(() => {
  const emptyRow = {
    Ma_Tool: '',
    Ten_TB: '',
    Ma_Ky_Hieu: '',
    So_Seri: '',
    Nha_SX: '',
    Hang_Kiem_Dinh: ''
  }
  return [...props.toolData, emptyRow]
})

// Methods
const openToolModal = () => {
  emit('openToolModal')
}

const handleDeleteTool = (tool: ToolData) => {
  emit('deleteToolItem', tool)
}

// No pagination handlers
</script>

<style scoped>

  
/* Nút xóa: nhỏ gọn, nổi bật và mượt mà */
.tool-table :deep(.action-delete-btn) {
  background: linear-gradient(135deg, #374151 0% 100%) !important;
  border: none !important;
  color: #ffffff !important;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(29, 78, 216, 0.25) !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease !important;
}

.tool-table :deep(.action-delete-btn:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(29, 78, 216, 0.35) !important;
  filter: brightness(1.05);
}

.tool-table :deep(.action-delete-btn:active) {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(29, 78, 216, 0.25) !important;
}

.tool-table :deep(.action-delete-btn .anticon) {
  font-size: 16px;
  color: #ffffff !important;
}

.tool-table :deep(.action-delete-btn[disabled]) {
  background: #e5e7eb !important;
  color: #9ca3af !important;
  box-shadow: none !important;
}
.tool-table {
  border: 1px solid #d1d5db !important;
}

.tool-table :deep(.ant-table) {
  border: 1px solid #d1d5db !important;
}

.tool-table :deep(.ant-table-thead > tr > th) {
  background-color: #374151 !important;
  color: white !important;
  font-weight: bold !important;
  border: 1px solid #d1d5db !important;
  padding: 8px !important;
}

.tool-table :deep(.ant-table-tbody > tr > td) {
  border: 1px solid #e5e7eb !important;
  padding: 8px !important;
}

.tool-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f3f4f6 !important;
}

.thin-border :deep(.ant-table) {
  border: 0.5px solid #000 !important;
}

.thin-border :deep(.ant-table-thead > tr > th),
.thin-border :deep(.ant-table-tbody > tr > td) {
  border: 0.5px solid #000 !important;
}

.thin-border :deep(.ant-table-thead > tr > th) {
  background-color: #374151 !important;
  color: white !important;
  font-weight: bold !important;
  border: 0.5px solid #000 !important;
  padding: 8px !important;
  text-align: center !important;
}

.thin-border :deep(.ant-table-tbody > tr > td) {
  border: 0.5px solid #000 !important;
  padding: 8px !important;
  text-align: center !important;
  height: 50px !important;
  vertical-align: middle !important;
}

.thin-border :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f3f4f6 !important;
}

.tool-table :deep(.ant-btn-primary.ant-btn-circle) {
  background: linear-gradient(135deg, #374151 0%, #1d4ed8 100%) !important;
  border: none !important;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3) !important;
  width: 32px !important;
  height: 32px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s ease !important;
}

.tool-table :deep(.ant-btn-primary.ant-btn-circle:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4) !important;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
}

.tool-table :deep(.ant-btn-primary.ant-btn-circle .anticon) {
  color: white !important;
  font-size: 14px !important;
}

.tool-table :deep(.ant-btn-primary.ant-btn-circle:active) {
  transform: translateY(0) !important;
  box-shadow: 0 1px 2px rgba(59, 130, 246, 0.3) !important;
}

.anticon {
    color: #1c3f4b;
}
</style>
