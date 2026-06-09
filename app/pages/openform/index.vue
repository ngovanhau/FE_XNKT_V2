<template>
  <div class="openform-new-page">
    <div class="openform-new-container">
      <div class="openform-new-header">
        <div>
          <h1>Quản lý OpenForm</h1>
          <p>Quản lý danh sách các mở form</p>
        </div>
        <button type="button" class="primary-btn" @click="openCreateModal">+ Thêm mới</button>
      </div>

      <div class="openform-new-toolbar">
        <input v-model="searchKeyword" type="text" placeholder="Tìm kiếm..." />
      </div>

      <div class="openform-new-table-wrap">
        <table class="openform-new-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>TÊN</th>
              <th>LOẠI KEY</th>
              <th>GIÁ TRỊ KEY</th>
              <th>URL</th>
              <th class="text-right">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center">Đang tải dữ liệu...</td>
            </tr>
            <tr v-else-if="openFormList.length === 0">
              <td colspan="6" class="text-center">Không có dữ liệu</td>
            </tr>
            <tr v-for="(item, index) in openFormList" :key="item.NO">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ item.NAME }}</td>
              <td>{{ item.KEYTYPE }}</td>
              <td>{{ item.KEYVALUE }}</td>
              <td class="url-cell">{{ item.URL }}</td>
              <td class="text-right">
                <button type="button" class="icon-btn edit" @click="openEditModal(item)">Sửa</button>
                <button type="button" class="icon-btn delete" @click="confirmDelete(item)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="openform-new-footer" v-if="totalItems > 0">
        <a-pagination
          :current="currentPage"
          :page-size="pageSize"
          :total="totalItems"
          :show-size-changer="true"
          :show-quick-jumper="true"
          :show-total="(total: number, range: [number, number]) => `${range[0]}-${range[1]} / ${total} Bản ghi`"
          @change="handlePageChange"
          @showSizeChange="handlePageSizeChange"
        />
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>{{ isEditing ? 'Chỉnh sửa OpenForm' : 'Thêm mới OpenForm' }}</h3>
        <form @submit.prevent="submitForm" class="form-grid">
          <label>
            <span>Tên</span>
            <input v-model="formData.NAME" type="text" required />
          </label>
          <label>
            <span>Loại Key</span>
            <select v-model="formData.KEYTYPE" required>
              <option value="TheoHuongDan">TheoHuongDan</option>
              <option value="MaBD">MaBD</option>
            </select>
          </label>
          <label>
            <span>Giá trị Key</span>
            <input v-model="formData.KEYVALUE" type="text" required />
          </label>
          <label>
            <span>URL</span>
            <select v-model="selectedPage" required>
              <option v-for="page in pageOptions" :key="page" :value="page">{{ page }}</option>
            </select>
          </label>
          <label>
            <span>URL đầy đủ</span>
            <input :value="buildUrl(selectedPage, formData.KEYVALUE)" type="text" readonly />
          </label>
          <div class="modal-actions">
            <button type="button" class="ghost-btn" @click="closeModal">Hủy</button>
            <button type="submit" class="primary-btn" :disabled="submitting">
              {{ submitting ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal-card">
        <h3>Xác nhận xóa</h3>
        <p class="delete-text">Bạn có chắc chắn muốn xóa "{{ deleteItem?.NAME }}"?</p>
        <div class="modal-actions">
          <button type="button" class="ghost-btn" @click="closeDeleteModal">Hủy</button>
          <button type="button" class="danger-btn" :disabled="deleting" @click="deleteOpenForm">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="notification.show" :class="['notify', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { GetAllOpenForms, CreateOpenForm, UpdateOpenForm, DeleteOpenForm } from '~/composables/OpenFormApi'
import type { OpenFormItem, OpenFormCreateRequest, OpenFormUpdateRequest } from '~/composables/OpenFormApi'

function useDebounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

definePageMeta({
  title: 'Quản lý OpenForm (New)'
})

const openFormList = ref<OpenFormItem[]>([])
const loading = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const deleteItem = ref<OpenFormItem | null>(null)

const currentPage = ref(1)
const pageSize = ref(10)
const totalItems = ref(0)
const baseUrl = 'https://cmms.vietsov.com.vn:2002'
const pageOptions = [
  'ACS',
  'AIRCOMPNO',
  'AOSSBM3',
  'BDPLCHIMACCR',
  'BK2',
  'BM1',
  'CRANE',
  'EXBKTNG',
  'FDMAINDECK',
  'GALLEYROOM',
  'GDMAINDECK',
  'MACESDSAH',
  'openform',
  'SCADAOWS',
  'SDV'
] as const
const selectedPage = ref<string>(pageOptions[0])

const searchKeyword = ref('')
const debouncedSearchKeyword = ref('')

watch(searchKeyword, useDebounce((newVal: string) => {
  debouncedSearchKeyword.value = newVal
}, 400))

const formData = ref<OpenFormCreateRequest>({
  NO: 0,
  NAME: '',
  KEYTYPE: 'TheoHuongDan',
  KEYVALUE: '',
  URL: ''
})

const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const fetchOpenForms = async (keyword?: string) => {
  try {
    loading.value = true
    const response = await GetAllOpenForms(currentPage.value, pageSize.value, keyword)
    if (response?.IsSuccess) {
      if (Array.isArray(response.Data)) {
        openFormList.value = response.Data
        totalItems.value = response.Data.length
      } else {
        openFormList.value = response.Data.Items
        totalItems.value = response.Data.TotalCount
      }
    } else {
      openFormList.value = []
      totalItems.value = 0
    }
  } catch (error) {
    openFormList.value = []
    totalItems.value = 0
    showNotification('Lỗi khi tải danh sách OpenForm!', 'error')
  } finally {
    loading.value = false
  }
}

const buildUrl = (page: string, keyValue?: string) => {
  const pagePath = `${baseUrl}/${page}`
  const woCode = (keyValue || '').trim()
  if (!woCode) return pagePath
  return `${pagePath}?wocode=${encodeURIComponent(woCode)}`
}

const extractPageFromUrl = (url: string) => {
  const raw = (url || '').trim()
  if (!raw) return pageOptions[0]
  const withoutDomain = raw.replace(/^https?:\/\/[^/]+\/?/, '')
  const page = (withoutDomain.split('/')[0] ?? '').trim()
  if (pageOptions.includes(page as (typeof pageOptions)[number])) {
    return page
  }
  return pageOptions[0]
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchOpenForms(searchKeyword.value || undefined)
}

const handlePageSizeChange = (_: number, size: number) => {
  currentPage.value = 1
  pageSize.value = size
  fetchOpenForms(searchKeyword.value || undefined)
}

const openCreateModal = () => {
  isEditing.value = false
  formData.value = { NO: 0, NAME: '', KEYTYPE: 'TheoHuongDan', KEYVALUE: '', URL: '' }
  selectedPage.value = pageOptions[0]
  showModal.value = true
}

const openEditModal = (item: OpenFormItem) => {
  isEditing.value = true
  formData.value = { ...item }
  selectedPage.value = extractPageFromUrl(item.URL || '')
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = { NO: 0, NAME: '', KEYTYPE: 'TheoHuongDan', KEYVALUE: '', URL: '' }
  selectedPage.value = pageOptions[0]
}

const submitForm = async () => {
  try {
    submitting.value = true
    const payload = {
      ...formData.value,
      URL: buildUrl(selectedPage.value, formData.value.KEYVALUE)
    }
    if (isEditing.value) {
      const response = await UpdateOpenForm(payload as OpenFormUpdateRequest)
      if (response?.IsSuccess) {
        showNotification('Cập nhật OpenForm thành công!', 'success')
        await fetchOpenForms(searchKeyword.value || undefined)
        closeModal()
      }
    } else {
      const response = await CreateOpenForm(payload)
      if (response?.IsSuccess) {
        showNotification('Tạo mới OpenForm thành công!', 'success')
        await fetchOpenForms(searchKeyword.value || undefined)
        closeModal()
      }
    }
  } catch {
    showNotification(`Lỗi khi ${isEditing.value ? 'cập nhật' : 'tạo mới'} OpenForm!`, 'error')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (item: OpenFormItem) => {
  deleteItem.value = item
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deleteItem.value = null
}

const deleteOpenForm = async () => {
  if (!deleteItem.value) return
  try {
    deleting.value = true
    const response = await DeleteOpenForm(deleteItem.value.NO)
    if (response?.IsSuccess) {
      showNotification('Xóa OpenForm thành công!', 'success')
      await fetchOpenForms(searchKeyword.value || undefined)
      closeDeleteModal()
    } else {
      showNotification('Lỗi khi xóa OpenForm!', 'error')
    }
  } catch {
    showNotification('Lỗi khi xóa OpenForm!', 'error')
  } finally {
    deleting.value = false
  }
}

const showNotification = (message: string, type: 'success' | 'error') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 2500)
}

const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (showDeleteModal.value) {
      event.preventDefault()
      closeDeleteModal()
      return
    }
    if (showModal.value) {
      event.preventDefault()
      closeModal()
    }
  }
}

watch(debouncedSearchKeyword, (newKeyword) => {
  currentPage.value = 1
  fetchOpenForms(newKeyword || undefined)
})

onMounted(async () => {
  await fetchOpenForms()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<style scoped>
.openform-new-page { min-height: 100vh; background: #f8fafc; padding: 24px; }
.openform-new-container { max-width: 1680px; margin: 0 auto; background: #fff; border-radius: 14px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06); padding: 24px; }
.openform-new-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid #eef2f7; padding-bottom: 16px; }
.openform-new-header h1 { font-size: 42px; line-height: 1.1; margin: 0; color: #0f172a; font-weight: 800; }
.openform-new-header p { margin: 8px 0 0; font-size: 18px; color: #64748b; }
.openform-new-toolbar { display: flex; justify-content: flex-end; margin: 18px 0 14px; }
.openform-new-toolbar input { width: 360px; max-width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; height: 42px; font-size: 16px; padding: 0 14px; }
.openform-new-table-wrap { border: 1px solid #e2e8f0; border-radius: 10px; overflow-x: auto; }
.openform-new-table { width: 100%; border-collapse: collapse; min-width: 980px; }
.openform-new-table th { text-align: left; font-size: 12px; letter-spacing: .04em; color: #64748b; padding: 14px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; }
.openform-new-table td { font-size: 14px; color: #0f172a; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
.url-cell { white-space: nowrap; }
.text-right { text-align: right; }
.text-center { text-align: center; color: #64748b; }
.openform-new-footer { display: flex; justify-content: flex-end; margin-top: 14px; }
.primary-btn { background: #2563eb; color: #fff; border: 0; border-radius: 10px; padding: 10px 16px; font-size: 18px; font-weight: 600; cursor: pointer; }
.primary-btn:disabled { opacity: .6; cursor: not-allowed; }
.ghost-btn { background: #f1f5f9; color: #334155; border: 0; border-radius: 8px; padding: 9px 14px; cursor: pointer; }
.danger-btn { background: #dc2626; color: #fff; border: 0; border-radius: 8px; padding: 9px 14px; cursor: pointer; }
.icon-btn { border: 0; background: transparent; cursor: pointer; padding: 4px 8px; border-radius: 6px; font-size: 13px; }
.icon-btn.edit { color: #2563eb; }
.icon-btn.delete { color: #dc2626; margin-left: 6px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; z-index: 60; }
.modal-card { width: 520px; max-width: calc(100vw - 32px); background: #fff; border-radius: 12px; padding: 20px; }
.modal-card h3 { margin: 0 0 14px; font-size: 22px; color: #0f172a; }
.form-grid { display: grid; gap: 12px; }
.form-grid label { display: grid; gap: 6px; }
.form-grid span { font-size: 14px; color: #334155; }
.form-grid input, .form-grid select { height: 40px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 0 10px; font-size: 14px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
.delete-text { font-size: 14px; color: #475569; margin-bottom: 12px; }
.notify { position: fixed; right: 16px; top: 16px; color: #fff; border-radius: 8px; padding: 10px 14px; z-index: 70; }
.notify.success { background: #16a34a; }
.notify.error { background: #dc2626; }
</style>
