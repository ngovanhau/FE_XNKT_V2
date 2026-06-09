<template>
  <div class="w-full mt-6">
    <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm">
      8. Vật tư tiêu hao / Израсходованные материалы
    </div>
    <div class="mt-4 overflow-x-auto">
      <a-table
        :data-source="displayData"
        :columns="columns" bordered
        :loading="loading"
        :pagination="false"
        table-layout="fixed"
        size="small"
        class="vat-tu-tieu-hao-wo-table"
        :scroll="{ x: 980 }"
        
      >
        <template #bodyCell="{ column, record, index, text }">
          <template v-if="column.key === 'stt'">
            <div class="text-center">{{ record.__searchRow ? '' : index + 1 }}</div>
          </template>
          <template v-else>
            <template v-if="record.__searchRow">
              <template v-if="column.key === 'partcode'">
                <div class="text-gray-400 italic cursor-pointer" @click="openVatTuModal">
                  <SearchOutlined />
                  <span class="ml-1">Choose parts</span>
                </div>
              </template>
              <template v-else>
                <!-- Các cột khác của dòng trống sẽ để rỗng -->
                <span></span>
              </template>
            </template>
            <template v-else>
              <template v-if="column.key === 'usedqty'">
                <template v-if="editingQtyId === record.id">
                  <div
                    ref="qtyEditWrapRef"
                    class="qty-edit-wrap"
                    :class="{ 'qty-edit-wrap--with-cancel': !isPersistedRow(record as VatTuTieuHaoWOItem) }"
                  >
                    <a-input-number
                      size="small"
                      v-model:value="editingQtyValue"
                      :min="0"
                      :precision="0"
                      :step="1"
                      :disabled="isSavingQty"
                      @pressEnter="handleQtySubmit(record as VatTuTieuHaoWOItem)"
                      @keydown.esc="cancelEditQty(record as VatTuTieuHaoWOItem)"
                      ref="qtyInputRef"
                      class="qty-input"
                    />
                    <div class="qty-actions">
                      <a-button
                        size="small"
                        type="primary"
                        :loading="isSavingQty"
                        :disabled="isSavingQty"
                        @click="handleQtySubmit(record as VatTuTieuHaoWOItem)"
                      >
                        Save
                      </a-button>
                      <a-button
                        v-if="!isPersistedRow(record as VatTuTieuHaoWOItem)"
                        size="small"
                        :disabled="isSavingQty"
                        @click="cancelEditQty(record as VatTuTieuHaoWOItem)"
                      >
                        Cancel
                      </a-button>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <a-button
                    type="link"
                    class="qty-display-btn"
                    :disabled="disabled"
                    @click="startEditQty(record as VatTuTieuHaoWOItem)"
                  >
                    {{ record.usedqty || '0' }}
                  </a-button>
                </template>
              </template>
              <template v-else>
                <span class="text-gray-900">{{ text || '' }}</span>
              </template>
            </template>
          </template>
        </template>
      </a-table>
    </div>
  </div>
  
  <NotificationToast 
    :show="showNotification"
    :message="notificationMessage"
    :duration="2000"
    @hide="handleNotificationHide"
  />

  <!-- Modal chọn vật tư -->
  <VatTuSelectionModal
    v-model:visible="showVatTuModal"
    :gian="gianForVatTu"
    @vattu-selected="handleVatTuSelected"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { getPartsByWO, createPartWO, updatePartIssue, updatePartReturn } from '~/composables/VatTuTieuHaoWOApi'
import VatTuSelectionModal from '~/components/VatTuSelectionModal.vue'

interface Props {
  org?: string
  wo: string
  disabled?: boolean
  woequipment?: string
  gian?: string
}

const props = withDefaults(defineProps<Props>(), {
  org: undefined,
  disabled: false
})

const tableData = ref<VatTuTieuHaoWOItem[]>([])
const loading = ref<boolean>(false)
const showNotification = ref(false)
const notificationMessage = ref('Tải dữ liệu vật tư thành công!')
const showVatTuModal = ref(false)
const editingQtyId = ref<string | null>(null)
const editingQtyValue = ref<number | null>(null)
const qtyInputRef = ref<any>(null)
const qtyEditWrapRef = ref<HTMLElement | null>(null)
const isSavingQty = ref<boolean>(false)

// Hiển thị thêm 1 dòng trống cuối bảng để tìm vật tư
const displayData = computed(() => {
  const visibleRows = tableData.value.filter((item) => {
    const qty = normalizeQty(item.usedqty)
    // Ẩn mọi dòng đã có usedqty = 0
    if (qty === 0) return false
    return true
  })
  const searchRow: any = {
    id: '',
    partcode: '',
    partdescription: '',
    storecode: '',
    partuom: '',
    usedqty: '',
    __searchRow: true
  }
  return [...visibleRows, searchRow]
})

const columns = [
  { title: 'STT', key: 'stt', width: 80, align: 'center' as const },
  { title: 'Mã Vật Tư', dataIndex: 'partcode', key: 'partcode', width: 160, align: 'center' as const },
  { title: 'Tên Vật Tư', dataIndex: 'partdescription', key: 'partdescription', width: 300, align: 'center' as const  },
  { title: 'Mã kho', dataIndex: 'storecode', key: 'storecode', width: 140, align: 'center' as const },
  { title: 'Đơn vị tính', dataIndex: 'partuom', key: 'partuom', width: 100, align: 'center' as const },
  { title: 'Số lượng', dataIndex: 'usedqty', key: 'usedqty', width: 200, align: 'center' as const }
]

const resolveWoForRequest = () => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = (params.get('wocode') || params.get('wo') || params.get('WO') || '').trim()
    if (fromUrl) return fromUrl
  }
  return String(props.wo || '').trim()
}

const normalizeQty = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) return null
  if (!Number.isInteger(parsed)) return null
  return parsed
}

const isPersistedRow = (record: VatTuTieuHaoWOItem) => {
  return Boolean(record.matlist_lineno)
}

const fetchParts = async () => {
  const woForRequest = resolveWoForRequest()
  if (!woForRequest) return
  try {
    loading.value = true
    const items = await getPartsByWO(props.org || '', woForRequest)
    tableData.value = items
  } catch (error) {
    console.error('Error fetching parts:', error)
  } finally {
    loading.value = false
  }
}

// Mở modal chọn vật tư
const openVatTuModal = () => {
  showVatTuModal.value = true
}

// Lấy gian từ FirstForm truyền xuống hoặc mặc định ''
const gianForVatTu = computed(() => props.gian || props.org || '')

// Khi chọn vật tư từ popup (tạm thời chỉ thông báo)
const handleVatTuSelected = (vatTu: any) => {
  const woForRequest = resolveWoForRequest()
  const newId = String(Date.now())
  const newItem: VatTuTieuHaoWOItem = {
    id: newId,
    partcode: vatTu.par_code,
    partdescription: vatTu.par_desc,
    storecode: vatTu.sto_store,
    partuom: vatTu.PAR_UOM,
    usedqty: '',
    workordernum: woForRequest,
    partorganization: props.org || '',
    woattachto: props.woequipment || null
  }
  tableData.value = [...tableData.value, newItem]
  // Bật edit số lượng ngay
  editingQtyId.value = newId
  editingQtyValue.value = null
  showVatTuModal.value = false
  // Focus ô số lượng ngay khi modal đóng
  nextTick(() => {
    qtyInputRef.value?.focus?.()
  })
}

const handleNotificationHide = () => {
  showNotification.value = false
}

onMounted(fetchParts)
watch(() => props.wo, () => { fetchParts() })

const getEditingRecord = () => {
  if (!editingQtyId.value) return undefined
  return tableData.value.find(i => i.id === editingQtyId.value)
}

const handleDocumentClick = (event: MouseEvent) => {
  if (!editingQtyId.value) return
  if (isSavingQty.value) return
  const target = event.target as Node | null
  if (!target) return
  if (qtyEditWrapRef.value?.contains(target)) return
  cancelEditQty(getEditingRecord())
}

onMounted(() => {
  document.addEventListener('mousedown', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDocumentClick)
})

const cancelEditQty = (record?: VatTuTieuHaoWOItem, force = false) => {
  if (isSavingQty.value && !force) return
  // Nếu là dòng mới chưa lưu thì hủy sẽ xóa luôn dòng khỏi bảng
  if (record && !record.matlist_lineno) {
    tableData.value = tableData.value.filter(i => i.id !== record.id)
  }
  editingQtyId.value = null
  editingQtyValue.value = null
}

// Click vào cột Số lượng để edit
const startEditQty = (record: VatTuTieuHaoWOItem) => {
  if (props.disabled) return
  if (isSavingQty.value) return
  editingQtyId.value = record.id
  editingQtyValue.value = normalizeQty(record.usedqty) ?? 0
  nextTick(() => {
    qtyInputRef.value?.focus?.()
  })
}

// Lưu số lượng: tạo mới hoặc cập nhật theo chênh lệch Issue/Return
const handleQtySubmit = async (record: VatTuTieuHaoWOItem) => {
  if (!editingQtyId.value || editingQtyId.value !== record.id) return
  if (isSavingQty.value) return
  try {
    isSavingQty.value = true
    const qtyNumber = normalizeQty(editingQtyValue.value)
    if (qtyNumber === null) {
      notificationMessage.value = 'Số lượng phải là số nguyên >= 0!'
      showNotification.value = true
      nextTick(() => {
        qtyInputRef.value?.focus?.()
      })
      return
    }
    const originalQtyNumber = normalizeQty(record.usedqty) ?? 0
    if (record.matlist_lineno && qtyNumber === originalQtyNumber) {
      cancelEditQty()
      return
    }
    const woForRequest = resolveWoForRequest() || record.workordernum || ''
    if (!woForRequest) {
      notificationMessage.value = 'Thiếu mã WO để thao tác vật tư!'
      showNotification.value = true
      return
    }

    let success = false
    let message = ''
    if (record.matlist_lineno) {
      const qtyDiff = qtyNumber - originalQtyNumber
      const updateResult = qtyDiff > 0
        ? await updatePartIssue({
            workordernum: woForRequest,
            org: props.org || '',
            qty: qtyDiff,
            woequipment: props.woequipment || record.woattachto || '',
            partcode: record.partcode
          })
        : await updatePartReturn({
            workordernum: woForRequest,
            org: props.org || '',
            qty: Math.abs(qtyDiff),
            woequipment: props.woequipment || record.woattachto || '',
            partcode: record.partcode
          })
      success = updateResult.success
      message = updateResult.message
      if (success) {
        record.usedqty = String(qtyNumber)
        if (qtyNumber === 0) {
          tableData.value = tableData.value.filter(i => i.id !== record.id)
        }
        cancelEditQty(undefined, true)
      }
    } else {
      if (qtyNumber <= 0) {
        notificationMessage.value = 'Vật tư mới phải nhập số lượng lớn hơn 0!'
        showNotification.value = true
        nextTick(() => {
          qtyInputRef.value?.focus?.()
        })
        return
      }
      const createResult = await createPartWO({
        workordernum: woForRequest,
        org: props.org || '',
        qty: qtyNumber,
        woequipment: props.woequipment || record.woattachto || '',
        partcode: record.partcode,
        partdescription: record.partdescription,
        partuom: record.partuom
      })
      success = createResult.success
      message = createResult.message
      if (success) {
        record.usedqty = String(qtyNumber)
        if (qtyNumber === 0) {
          tableData.value = tableData.value.filter(i => i.id !== record.id)
        }
        // Không gọi GetAll lại, nên đánh dấu là đã insert để lần sửa sau đi nhánh update
        record.matlist_lineno = record.matlist_lineno || 'LOCAL_CREATED'
        cancelEditQty(undefined, true)
      }
    }

    notificationMessage.value = message || (success ? 'Thao tác thành công!' : 'Thao tác thất bại!')
    showNotification.value = true
  } catch (error) {
    console.error('Error create/update part:', error)
    notificationMessage.value = 'Lỗi khi gọi API vật tư!'
    showNotification.value = true
  } finally {
    isSavingQty.value = false
  }
}
</script>

<style scoped>
.vat-tu-tieu-hao-wo-table :deep(.ant-table) {
  font-size: 12px;
}

/* Khóa cứng layout cột để khi edit số lượng không làm nhảy bề ngang các cột */
.vat-tu-tieu-hao-wo-table :deep(.ant-table table) {
  table-layout: fixed !important;
  width: 100% !important;
  min-width: 980px !important;
}

.vat-tu-tieu-hao-wo-table :deep(.ant-table-thead > tr > th),
.vat-tu-tieu-hao-wo-table :deep(.ant-table-tbody > tr > td) {
  overflow: hidden;
  box-sizing: border-box;
}
.vat-tu-tieu-hao-wo-table :deep(.ant-table-tbody > tr:last-child > td) {
  background-color: #f9fafb;
}

/* Viền ngoài của bảng dày hơn và bo góc */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-container) {
  border: 1.5px solid #000 !important; /* viền ngoài màu đen */
  border-radius: 10px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Tăng độ dày và màu viền cho từng ô (thead + tbody) */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-bordered .ant-table-container table > thead > tr > th),
.vat-tu-tieu-hao-wo-table :deep(.ant-table-bordered .ant-table-container table > tbody > tr > td) {
  border-color: #000 !important; /* viền ô màu đen */
  border-width: 1px !important;
}

/* Viền phân tách hàng rõ hơn */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-bordered .ant-table-tbody > tr > td) {
  border-bottom-width: 1px !important;
}

/* Header tinh tế hơn */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-thead > tr > th) {
  background: #374151 !important; /* xanh rất nhạt */
  color: #ffffff !important;
  font-weight: 600 !important;
  border-color: #000 !important; /* viền header màu đen */
}

/* Hover hàng dễ nhìn hơn */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-tbody > tr:hover > td) {
  background-color: #f3f7ff !important;
}

/* Zebra nhẹ để đọc dễ hơn */
.vat-tu-tieu-hao-wo-table :deep(.ant-table-tbody > tr:nth-child(odd) > td) {
  background-color: #fbfdff;
}

.qty-edit-wrap {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding-right: 0;
  box-sizing: border-box;
  white-space: nowrap;
}

.qty-edit-wrap--with-cancel {
  padding-right: 88px; /* chỉ chừa chỗ khi có cả Lưu + Hủy */
}

.qty-actions {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.vat-tu-tieu-hao-wo-table :deep(.qty-input) {
  width: 72px;
  min-width: 72px;
  max-width: 72px;
}

.vat-tu-tieu-hao-wo-table :deep(.qty-input .ant-input-number-input) {
  text-align: center;
}

.vat-tu-tieu-hao-wo-table :deep(.qty-display-btn) {
  width: 100%;
  padding: 0 !important;
  height: auto !important;
  font-weight: 600;
  text-align: center;
  display: inline-flex !important;
  justify-content: center;
  align-items: center;
}
</style>
