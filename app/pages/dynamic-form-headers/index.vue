<template>
  <div class="relative min-h-[calc(100vh-96px)] space-y-4 p-2 sm:p-3">
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

    <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-h-[calc(100vh-120px)]">
      <div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-semibold text-blue-700">DYNAMIC FORM HEADER</p>
        <div class="flex w-full items-center gap-2 sm:w-auto">
          <input
            v-model="searchKeyword"
            type="text"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-600 sm:w-64"
            placeholder="Tìm phòng ban..."
            @keyup.enter="runSearch"
          />
          <button
            type="button"
            :disabled="isLoadingDepartments"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
            @click="runSearch"
          >
            <SearchOutlined />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section class="rounded-xl border border-slate-200 p-3 h-full">
          <p class="mb-2 text-xs font-semibold text-slate-700">DANH SÁCH PHÒNG BAN</p>
          <div class="h-[calc(100vh-260px)] min-h-[520px] overflow-y-auto rounded-lg border border-slate-200">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Code</th>
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Name</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in departments"
                  :key="item.mrcCode"
                  class="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  :class="selectedMrcCode === item.mrcCode ? 'bg-blue-50' : ''"
                  @click="selectDepartment(item)"
                >
                  <td class="px-2 py-2 text-xs font-medium text-slate-900">{{ item.mrcCode }}</td>
                  <td class="px-2 py-2 text-xs text-slate-700">{{ item.mrcDesc }}</td>
                </tr>
                <tr v-if="!departments.length && !isLoadingDepartments">
                  <td colspan="2" class="px-2 py-3 text-center text-xs text-slate-500">Không có phòng ban.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 p-3 h-full">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-700">
              HEADERS - {{ selectedMrcCode || 'N/A' }}
            </p>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">{{ headers.length }}/4</span>
              <button
                type="button"
                class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                :disabled="!selectedMrcCode || isLoadingHeaders"
                @click="loadHeaders"
              >
                Reload
              </button>
            </div>
          </div>

          <div class="max-h-[320px] overflow-y-auto rounded-lg border border-slate-200">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Order</th>
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Text</th>
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in headers"
                  :key="item.headerId"
                  class="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td class="px-2 py-2 text-xs text-slate-700">{{ item.displayOrder }}</td>
                  <td class="px-2 py-2 text-xs font-medium text-slate-900">{{ item.text }}</td>
                  <td class="px-2 py-2 text-xs text-slate-700">
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:cursor-not-allowed"
                        :disabled="isSaving || item.displayOrder <= 1"
                        @click="moveHeader(item, item.displayOrder - 1)"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        class="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:cursor-not-allowed"
                        :disabled="isSaving || item.displayOrder >= headers.length"
                        @click="moveHeader(item, item.displayOrder + 1)"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        class="rounded border border-blue-300 px-2 py-0.5 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed"
                        :disabled="isSaving"
                        @click="onEdit(item)"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                        :disabled="isSaving"
                        @click="onDelete(item)"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!headers.length && !isLoadingHeaders">
                  <td colspan="3" class="px-2 py-3 text-center text-xs text-slate-500">Chưa có header.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 rounded-lg border border-slate-200 p-3">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-semibold text-slate-700">COPY TO PHÒNG BAN KHÁC</p>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100 disabled:cursor-not-allowed"
                  :disabled="!copyCandidateDepartments.length || isCopying"
                  @click="toggleSelectAllCopyTargets"
                >
                  {{ isAllCopyTargetsSelected ? 'Unselect all' : 'Select all' }}
                </button>
                <button
                  type="button"
                  class="rounded border border-blue-300 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed"
                  :disabled="!selectedMrcCode || !headers.length || !copyTargetMrcCodes.length || isCopying || isSaving"
                  @click="onCopyToDepartments"
                >
                  {{ isCopying ? 'Copying...' : 'Copy To' }}
                </button>
              </div>
            </div>
            <div class="max-h-[220px] overflow-y-auto rounded border border-slate-200 p-2">
              <div v-if="!copyCandidateDepartments.length" class="text-xs text-slate-500">
                Không có phòng ban đích khả dụng trong danh sách hiện tại.
              </div>
              <label
                v-for="item in copyCandidateDepartments"
                :key="`copy-target-${item.mrcCode}`"
                class="flex cursor-pointer items-center gap-2 py-1 text-xs text-slate-700"
              >
                <input
                  :checked="copyTargetMrcCodes.includes(item.mrcCode)"
                  type="checkbox"
                  class="h-3.5 w-3.5 rounded border-slate-300"
                  :disabled="isCopying"
                  @change="toggleCopyTarget(item.mrcCode)"
                />
                <span class="font-medium text-slate-900">{{ item.mrcCode }}</span>
                <span class="text-slate-500">- {{ item.mrcDesc }}</span>
              </label>
            </div>
          </div>

          <div class="mt-3 rounded-lg border border-slate-200 p-3">
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-semibold text-slate-700">{{ formMode === 'create' ? 'CREATE' : 'EDIT' }} HEADER</p>
              <button
                type="button"
                class="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100"
                @click="onNew"
              >
                New
              </button>
            </div>
            <div class="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_120px]">
              <input
                v-model="form.text"
                type="text"
                class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Header text"
              />
              <input
                v-model.number="form.displayOrder"
                type="number"
                min="1"
                class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Order"
              />
            </div>
            <div class="mt-2 grid grid-cols-1 gap-2 md:grid-cols-4">
              <div class="rounded-lg border border-slate-300 px-2 py-1.5">
                <p class="text-[11px] font-semibold text-slate-600">Align</p>
                <div class="mt-1 flex items-center gap-1 rounded-lg border border-slate-300 p-1">
                  <button
                    type="button"
                    title="Align left"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="form.textAlign === 'left' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="form.textAlign = 'left'"
                  >
                    <AlignLeftOutlined />
                  </button>
                  <button
                    type="button"
                    title="Align center"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="form.textAlign === 'center' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="form.textAlign = 'center'"
                  >
                    <AlignCenterOutlined />
                  </button>
                  <button
                    type="button"
                    title="Align right"
                    class="flex h-8 flex-1 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100"
                    :class="form.textAlign === 'right' ? 'bg-blue-100 text-blue-700' : ''"
                    @click="form.textAlign = 'right'"
                  >
                    <AlignRightOutlined />
                  </button>
                </div>
              </div>
              <div class="rounded-lg border border-slate-300 px-2 py-1.5">
                <p class="text-[11px] font-semibold text-slate-600">Font Weight</p>
                <div class="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    title="Bật/Tắt in đậm"
                    class="h-8 w-10 rounded border text-sm transition"
                    :class="form.fontWeight === 'bold' ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' : 'border-slate-300 text-slate-700 hover:bg-slate-50'"
                    @click="form.fontWeight = form.fontWeight === 'bold' ? 'normal' : 'bold'"
                  >
                    B
                  </button>
                </div>
              </div>
              <input
                v-model.number="form.fontSize"
                type="number"
                min="1"
                class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="fontSize (optional)"
              />
              <div class="rounded-lg border border-slate-300 px-2 py-1.5">
                <p class="text-[11px] font-semibold text-slate-600">Border</p>
                <div class="mt-1 flex items-center gap-2">
                  <button
                    type="button"
                    title="Bật/Tắt border"
                    class="flex h-8 w-10 items-center justify-center rounded border transition"
                    :class="form.borderMode === 'all' ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'"
                    @click="setBorderMode(form.borderMode === 'all' ? 'none' : 'all')"
                  >
                    <span
                      class="inline-block h-4 w-4"
                      :class="form.borderMode === 'all' ? 'border border-slate-800' : 'border border-dashed border-slate-400'"
                    ></span>
                  </button>
                </div>
              </div>
            </div>
            <div class="mt-2 flex gap-2">
              <button
                type="button"
                class="rounded border border-blue-300 px-3 py-1 text-xs text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed"
                :disabled="!selectedMrcCode || isSaving"
                @click="onSave"
              >
                Save
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { AlignCenterOutlined, AlignLeftOutlined, AlignRightOutlined, SearchOutlined } from '@ant-design/icons-vue'
import {
  CreateDynamicFormHeader,
  DeleteDynamicFormHeader,
  GetDynamicFormHeaderDepartments,
  GetDynamicFormHeaders,
  UpdateDynamicFormHeader,
  type DynamicFormHeaderDepartment,
  type DynamicFormHeaderItem
} from '~/composables/DynamicFormHeaderApi'
import { useDebounce } from '~/composables/useDebounce'

definePageMeta({
  layout: 'dashboard'
})

const departments = ref<DynamicFormHeaderDepartment[]>([])
const headers = ref<DynamicFormHeaderItem[]>([])
const selectedMrcCode = ref('')
const searchKeyword = ref('')
const debouncedSearchKeyword = useDebounce(searchKeyword, 350)
const isLoadingDepartments = ref(false)
const pendingDepartmentReload = ref(false)
const isLoadingHeaders = ref(false)
const isSaving = ref(false)
const isCopying = ref(false)
const message = ref('')
const isSuccess = ref(false)
let messageTimer: ReturnType<typeof setTimeout> | null = null
const copyTargetMrcCodes = ref<string[]>([])

const formMode = ref<'create' | 'edit'>('create')
const editingHeaderId = ref<number | null>(null)
const form = reactive({
  text: '',
  displayOrder: 1,
  textAlign: '',
  fontWeight: 'normal',
  borderMode: 'all' as 'all' | 'none',
  fontSize: undefined as number | undefined
})

const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const copyCandidateDepartments = computed(() =>
  departments.value.filter(item => normalizeCode(item.mrcCode) !== selectedMrcCode.value)
)

const isAllCopyTargetsSelected = computed(() =>
  !!copyCandidateDepartments.value.length &&
  copyTargetMrcCodes.value.length === copyCandidateDepartments.value.length
)

const setMessage = (content: string, success: boolean) => {
  if (messageTimer) clearTimeout(messageTimer)
  message.value = content
  isSuccess.value = success
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = null
  }, 3500)
}

const closeMessage = () => {
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = null
  message.value = ''
}

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.Message ||
  fallback

const normalizeCode = (value: string) => value.trim().toUpperCase()

const loadDepartments = async () => {
  if (isLoadingDepartments.value) {
    pendingDepartmentReload.value = true
    return
  }
  isLoadingDepartments.value = true
  try {
    departments.value = await GetDynamicFormHeaderDepartments(searchKeyword.value.trim())
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được danh sách phòng ban.'), false)
  } finally {
    isLoadingDepartments.value = false
    if (pendingDepartmentReload.value) {
      pendingDepartmentReload.value = false
      await loadDepartments()
    }
  }
}

const loadHeaders = async () => {
  if (!selectedMrcCode.value || isLoadingHeaders.value) return
  isLoadingHeaders.value = true
  try {
    headers.value = await GetDynamicFormHeaders(selectedMrcCode.value)
    if (formMode.value === 'create') {
      form.displayOrder = headers.value.length + 1
    }
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Không tải được dynamic headers.'), false)
  } finally {
    isLoadingHeaders.value = false
  }
}

const runSearch = async () => {
  await loadDepartments()
}

const onNew = () => {
  formMode.value = 'create'
  editingHeaderId.value = null
  form.text = ''
  form.displayOrder = Math.max(1, headers.value.length + 1)
  form.textAlign = ''
  form.fontWeight = 'normal'
  form.borderMode = 'all'
  form.fontSize = undefined
}

const setBorderMode = (mode: 'all' | 'none') => {
  form.borderMode = mode
}

const selectDepartment = async (item: DynamicFormHeaderDepartment) => {
  const code = normalizeCode(item.mrcCode)
  if (!code) return
  selectedMrcCode.value = code
  copyTargetMrcCodes.value = []
  onNew()
  await loadHeaders()
}

const toggleCopyTarget = (mrcCode: string) => {
  const code = normalizeCode(mrcCode)
  if (!code || code === selectedMrcCode.value) return
  if (copyTargetMrcCodes.value.includes(code)) {
    copyTargetMrcCodes.value = copyTargetMrcCodes.value.filter(item => item !== code)
    return
  }
  copyTargetMrcCodes.value = [...copyTargetMrcCodes.value, code]
}

const toggleSelectAllCopyTargets = () => {
  if (isAllCopyTargetsSelected.value) {
    copyTargetMrcCodes.value = []
    return
  }
  copyTargetMrcCodes.value = copyCandidateDepartments.value.map(item => normalizeCode(item.mrcCode))
}

const buildStylePayload = () => {
  const style: Record<string, unknown> = {}
  if (form.textAlign) style.textAlign = form.textAlign
  if (form.fontWeight) style.fontWeight = form.fontWeight
  style.border = form.borderMode === 'none' ? 'none' : 'all'
  if (Number.isFinite(form.fontSize) && Number(form.fontSize) > 0) {
    style.fontSize = Number(form.fontSize)
  }
  return Object.keys(style).length ? style : null
}

const onEdit = (item: DynamicFormHeaderItem) => {
  formMode.value = 'edit'
  editingHeaderId.value = item.headerId
  form.text = item.text
  form.displayOrder = Number(item.displayOrder || 1)
  form.textAlign = String(item.style?.textAlign || '')
  form.fontWeight = String(item.style?.fontWeight || 'normal')
  form.borderMode = String(item.style?.border || 'all').toLowerCase() === 'none' ? 'none' : 'all'
  const parsedFontSize = Number(item.style?.fontSize)
  form.fontSize = Number.isFinite(parsedFontSize) && parsedFontSize > 0 ? parsedFontSize : undefined
}

const onSave = async () => {
  if (!selectedMrcCode.value) {
    setMessage('Hãy chọn phòng ban trước.', false)
    return
  }
  const text = form.text.trim()
  if (!text) {
    setMessage('text không được để trống.', false)
    return
  }
  if (formMode.value === 'create' && headers.value.length >= 4) {
    setMessage('Mỗi phòng ban (MRC_CODE) chỉ được tối đa 4 dòng header.', false)
    return
  }

  isSaving.value = true
  try {
    const payload = {
      text,
      displayOrder: Number(form.displayOrder || 1),
      style: buildStylePayload()
    }
    if (formMode.value === 'create') {
      headers.value = await CreateDynamicFormHeader(selectedMrcCode.value, payload)
      setMessage('Tạo header thành công.', true)
      onNew()
    } else {
      if (!editingHeaderId.value) {
        setMessage('headerId không hợp lệ.', false)
        return
      }
      headers.value = await UpdateDynamicFormHeader(selectedMrcCode.value, editingHeaderId.value, payload)
      setMessage('Cập nhật header thành công.', true)
    }
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Lưu header thất bại.'), false)
  } finally {
    isSaving.value = false
  }
}

const onDelete = async (item: DynamicFormHeaderItem) => {
  if (!selectedMrcCode.value || isSaving.value) return
  isSaving.value = true
  try {
    headers.value = await DeleteDynamicFormHeader(selectedMrcCode.value, item.headerId)
    setMessage('Xóa header thành công.', true)
    if (editingHeaderId.value === item.headerId) {
      onNew()
    }
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Xóa header thất bại.'), false)
  } finally {
    isSaving.value = false
  }
}

const moveHeader = async (item: DynamicFormHeaderItem, nextOrder: number) => {
  if (!selectedMrcCode.value || isSaving.value) return
  isSaving.value = true
  try {
    headers.value = await UpdateDynamicFormHeader(selectedMrcCode.value, item.headerId, {
      text: item.text,
      displayOrder: nextOrder,
      style: item.style
    })
    setMessage('Đã cập nhật thứ tự header.', true)
  } catch (error: any) {
    setMessage(getApiErrorMessage(error, 'Đổi thứ tự header thất bại.'), false)
  } finally {
    isSaving.value = false
  }
}

const onCopyToDepartments = async () => {
  if (!selectedMrcCode.value) {
    setMessage('Hãy chọn phòng ban nguồn trước.', false)
    return
  }
  if (!headers.value.length) {
    setMessage('Phòng ban nguồn chưa có header để copy.', false)
    return
  }
  const targets = copyTargetMrcCodes.value
    .map(normalizeCode)
    .filter(code => code && code !== selectedMrcCode.value)
  if (!targets.length) {
    setMessage('Hãy chọn ít nhất 1 phòng ban đích.', false)
    return
  }

  isCopying.value = true
  try {
    const sourceRows = [...headers.value]
      .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
      .slice(0, 4)
      .map((item, index) => ({
        text: String(item.text || '').trim(),
        style: item.style ?? null,
        displayOrder: index + 1
      }))
      .filter(item => item.text)

    if (!sourceRows.length) {
      setMessage('Dữ liệu header nguồn không hợp lệ.', false)
      return
    }

    const failures: string[] = []
    for (const targetCode of targets) {
      try {
        const existingRows = await GetDynamicFormHeaders(targetCode)
        for (const row of existingRows) {
          await DeleteDynamicFormHeader(targetCode, row.headerId)
        }
        for (const row of sourceRows) {
          await CreateDynamicFormHeader(targetCode, row)
        }
      } catch (error) {
        failures.push(targetCode)
      }
    }

    if (!failures.length) {
      setMessage(`Copy thành công sang ${targets.length} phòng ban.`, true)
    } else if (failures.length === targets.length) {
      setMessage('Copy thất bại cho tất cả phòng ban đích.', false)
    } else {
      setMessage(`Copy xong, nhưng lỗi ở: ${failures.join(', ')}`, false)
    }
  } finally {
    isCopying.value = false
  }
}

onMounted(async () => {
  onNew()
  await loadDepartments()
})

watch(debouncedSearchKeyword, async () => {
  await loadDepartments()
})

onBeforeUnmount(() => {
  if (messageTimer) clearTimeout(messageTimer)
})
</script>
