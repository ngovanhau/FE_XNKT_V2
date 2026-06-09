<template>
  <div class="relative">
    <Teleport to="body">
      <div
        v-if="message"
        class="fixed left-1/2 top-2 z-[120] flex w-[min(980px,calc(100vw-1rem))] -translate-x-1/2 items-center justify-between rounded-xl px-4 py-3 text-sm shadow-lg md:top-4 md:w-[min(980px,calc(100vw-8rem))]"
        :class="messageClass"
      >
        <span>{{ message }}</span>
        <button
          type="button"
          class="ml-4 rounded-xl border border-current px-3 py-1 text-xs font-semibold"
          @click="closeMessage"
        >
          OK
        </button>
      </div>
    </Teleport>

    <div class="space-y-4">

      <section class="flex min-h-[360px] flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 md:h-[calc(100vh-330px)]">
        <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm font-semibold text-blue-700">CATEGORY</p>
          <div class="flex w-full items-center gap-2 sm:w-auto">
            <input
              v-model="searchKeyword"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 sm:w-64"
              placeholder="Tìm category..."
              @keyup.enter="runSearch"
            />
            <button
              type="button"
              :disabled="isLoading"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="runSearch"
            >
              <SearchOutlined />
            </button>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto pr-1">
          <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200">
                  <th
                    v-for="column in tableColumns"
                    :key="column"
                    class="px-3 py-3 text-left text-sm font-semibold text-slate-700"
                  >
                    {{ formatColumnName(column) }}
                  </th>
                  <th class="px-3 py-3 text-left text-sm font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, index) in categories"
                  :key="index"
                  class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                  :class="selectedCategoryCode === String(item.CATEGORY_CODE ?? '') ? 'bg-blue-50' : ''"
                  @click="onSelectCategory(item)"
                >
                  <td
                    v-for="column in tableColumns"
                    :key="`${index}-${column}`"
                    class="px-3 py-3 text-sm text-slate-700"
                  >
                    {{ formatValue(item[column] ?? null) }}
                  </td>
                  <td class="px-3 py-3 text-sm text-slate-700">
                    <button
                      type="button"
                      class="flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50"
                      @click.stop="goToDesigner(item)"
                    >
                      <FileTextOutlined />
                      <span>Design</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p class="text-sm text-slate-600">
          Records: <span class="font-semibold text-slate-800">{{ totalCount }}</span>
        </p>
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            :disabled="isLoading || currentPage <= 1"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="goToPage(currentPage - 1)"
          >
            <LeftOutlined />
          </button>
          <span class="text-sm font-medium text-slate-700">
            Pages {{ currentPage }} / {{ totalPages }}
          </span>
          <button
            type="button"
            :disabled="isLoading || currentPage >= totalPages"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="goToPage(currentPage + 1)"
          >
            <RightOutlined />
          </button>
          <select
            v-model.number="pageSize"
            class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-600"
            @change="onChangePageSize"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
        </div>
      </div>

      </section>

      <section class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-lg sm:p-5">
          <div class="mb-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              title="Thêm mới"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
              @click="onAddNew"
            >
              <PlusOutlined />
            </button>
            <button
              type="button"
              :disabled="isSubmitting"
              title="Lưu"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="saveCategory"
            >
              <SaveOutlined />
            </button>
            <button
              type="button"
              :disabled="isSubmitting || !selectedCategoryCode"
              title="Xóa"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
              @click="deleteCategory"
            >
              <DeleteOutlined />
            </button>
            <button
              type="button"
              title="Clear"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
              @click="clearForm"
            >
              <UndoOutlined />
            </button>
            <div class="ml-auto">
              <button
                type="button"
                title="Đóng/Mở chi tiết"
                class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                @click="isDetailCollapsed = !isDetailCollapsed"
              >
                <DownOutlined v-if="isDetailCollapsed" />
                <UpOutlined v-else />
              </button>
            </div>
          </div>

          <h2 class="text-lg font-semibold text-slate-900">
            {{ formMode === 'create' ? 'Thêm category mới' : `Chi tiết category: ${detailForm.CATEGORY_CODE}` }}
          </h2>

          <div v-if="!isDetailCollapsed" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Category Code</label>
              <input
                v-model="detailForm.CATEGORY_CODE"
                type="text"
                :disabled="formMode === 'edit'"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition disabled:bg-slate-100 focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                placeholder="Nhập category code"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Category Name</label>
              <input
                v-model="detailForm.CATEGORY_NAME"
                type="text"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                placeholder="Nhập category name"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <input
                v-model="detailForm.DESCRIPTION"
                type="text"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                placeholder="Nhập mô tả"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Is Active</label>
              <select
                v-model="detailForm.IS_ACTIVE"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
              >
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Display Order</label>
              <input
                v-model="detailForm.DISPLAY_ORDER"
                type="text"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
                placeholder="Nhập thứ tự"
              />
            </div>
          </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DeleteOutlined,
  DownOutlined,
  FileTextOutlined,
  LeftOutlined,
  PlusOutlined,
  RightOutlined,
  SaveOutlined,
  SearchOutlined,
  UndoOutlined,
  UpOutlined
} from '@ant-design/icons-vue'
import {
  CreateCategory,
  DeleteCategory,
  GetCategories,
  UpdateCategory,
  type CategoryItem,
  type CategoryPayload
} from '~/composables/AuthApi'

definePageMeta({
  layout: 'dashboard'
})

const categories = ref<CategoryItem[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const message = ref('')
const isSuccess = ref(false)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const formMode = ref<'create' | 'edit'>('create')
const selectedCategoryCode = ref('')
const isDetailCollapsed = ref(false)

const detailForm = reactive<CategoryPayload>({
  CATEGORY_CODE: '',
  CATEGORY_NAME: '',
  DESCRIPTION: '',
  IS_ACTIVE: 'Y',
  DISPLAY_ORDER: '1'
})
let messageTimer: ReturnType<typeof setTimeout> | null = null

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const tableColumns = computed(() => {
  const first = categories.value[0]
  if (!first) return ['No Data']
  return Object.keys(first)
})

const setMessage = (content: string, success: boolean) => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
  message.value = content
  isSuccess.value = success
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = null
  }, 3000)
}

const getApiErrorMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data
  return responseData?.Data?.ErrorMessage || responseData?.ErrorMessage || responseData?.Message || fallback
}

const closeMessage = () => {
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
  message.value = ''
}

const formatColumnName = (column: string) =>
  column
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatValue = (value: CategoryItem[string]) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' && (value === 'Y' || value === 'N')) {
    return value === 'Y' ? 'Yes' : 'No'
  }
  return String(value)
}

const fillDetailFromCategory = (item: CategoryItem) => {
  formMode.value = 'edit'
  detailForm.CATEGORY_CODE = String(item.CATEGORY_CODE ?? '')
  detailForm.CATEGORY_NAME = String(item.CATEGORY_NAME ?? '')
  detailForm.DESCRIPTION = String(item.DESCRIPTION ?? '')
  detailForm.IS_ACTIVE = String(item.IS_ACTIVE ?? 'Y') === 'N' ? 'N' : 'Y'
  detailForm.DISPLAY_ORDER = String(item.DISPLAY_ORDER ?? '')
}

const onSelectCategory = (item: CategoryItem) => {
  selectedCategoryCode.value = String(item.CATEGORY_CODE ?? '')
  fillDetailFromCategory(item)
}

const onAddNew = () => {
  formMode.value = 'create'
  selectedCategoryCode.value = ''
  detailForm.CATEGORY_CODE = ''
  detailForm.CATEGORY_NAME = ''
  detailForm.DESCRIPTION = ''
  detailForm.IS_ACTIVE = 'Y'
  detailForm.DISPLAY_ORDER = '1'
}

const loadCategories = async () => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const response = await GetCategories(searchKeyword.value.trim(), currentPage.value, pageSize.value)
    categories.value = response.Data?.Data || []
    totalCount.value = response.Data?.TotalCount || 0
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
      await loadCategories()
      return
    }
    if (!categories.value.some(item => String(item.CATEGORY_CODE ?? '') === selectedCategoryCode.value)) {
      selectedCategoryCode.value = ''
    }
    const selected = categories.value.find(item => String(item.CATEGORY_CODE ?? '') === selectedCategoryCode.value)
    if (selected) {
      fillDetailFromCategory(selected)
    }
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được danh sách category.'), false)
  } finally {
    isLoading.value = false
  }
}

const saveCategory = async () => {
  if (isSubmitting.value) return
  const payload: CategoryPayload = {
    CATEGORY_CODE: detailForm.CATEGORY_CODE.trim(),
    CATEGORY_NAME: detailForm.CATEGORY_NAME.trim(),
    DESCRIPTION: detailForm.DESCRIPTION.trim(),
    IS_ACTIVE: detailForm.IS_ACTIVE,
    DISPLAY_ORDER: detailForm.DISPLAY_ORDER.trim()
  }

  if (!payload.CATEGORY_CODE || !payload.CATEGORY_NAME) {
    setMessage('Vui lòng nhập Category Code và Category Name.', false)
    return
  }

  isSubmitting.value = true
  try {
    if (formMode.value === 'create') {
      await CreateCategory(payload)
      setMessage('Tạo category thành công.', true)
      selectedCategoryCode.value = payload.CATEGORY_CODE
    } else {
      await UpdateCategory(payload)
      setMessage('Cập nhật category thành công.', true)
    }
    await loadCategories()
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Lưu dữ liệu category thất bại.'), false)
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  if (!selectedCategoryCode.value || isSubmitting.value) return
  isSubmitting.value = true
  try {
    await DeleteCategory(selectedCategoryCode.value)
    setMessage('Xóa category thành công.', true)
    onAddNew()
    await loadCategories()
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Xóa category thất bại.'), false)
  } finally {
    isSubmitting.value = false
  }
}

const clearForm = () => {
  onAddNew()
  setMessage('Đã clear form category.', true)
}

const runSearch = async () => {
  currentPage.value = 1
  await loadCategories()
}

const goToPage = async (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  await loadCategories()
}

const onChangePageSize = async () => {
  currentPage.value = 1
  await loadCategories()
}

const goToDesigner = async (item: CategoryItem) => {
  const categoryCode = String(item.CATEGORY_CODE ?? '').trim()
  if (!categoryCode) {
    setMessage('Không tìm thấy CATEGORY_CODE để mở Designer.', false)
    return
  }
  //await navigateTo(`/templates/${encodeURIComponent(categoryCode)}`)
   await navigateTo(`/templates/report/${encodeURIComponent(categoryCode)}`)
}

const onKeyDown = async (event: KeyboardEvent) => {
  const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'
  if (!isSaveShortcut) return
  event.preventDefault()
  if (isSubmitting.value) return
  await saveCategory()
}

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  onAddNew()
  await loadCategories()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  if (messageTimer) {
    clearTimeout(messageTimer)
    messageTimer = null
  }
})
</script>
