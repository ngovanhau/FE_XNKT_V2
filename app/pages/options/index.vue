<template>
  <div class="relative space-y-4 p-2 sm:p-3">
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

    <section class="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <p class="text-sm font-semibold text-blue-700">OPTION MANAGEMENT</p>
        
      </div>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section class="rounded-xl border border-slate-200 p-3">
          <div class="mb-2 flex items-center justify-between gap-2">
            <p class="text-xs font-semibold text-slate-700">OPTION TYPES</p>
            <div class="flex items-center gap-2">
              <input
                v-model="searchKeyword"
                type="text"
                class="w-44 rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600"
                placeholder="Search type..."
                @keyup.enter="runSearch"
              />
              <button
                type="button"
                class="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                @click="runSearch"
              >
                Run
              </button>
            </div>
          </div>

          <div class="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Type</th>
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in typeRows"
                  :key="item.optional_TYPE"
                  class="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  :class="selectedTypeCode === item.optional_TYPE ? 'bg-blue-50' : ''"
                  @click="selectType(item)"
                >
                  <td class="px-2 py-2 text-xs font-medium text-slate-900">{{ item.optional_TYPE }}</td>
                  <td class="px-2 py-2 text-xs text-slate-700">{{ item.description }}</td>
                </tr>
                <tr v-if="!typeRows.length">
                  <td colspan="2" class="px-2 py-3 text-center text-xs text-slate-500">Không có option type.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Total: {{ totalCount }}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                :disabled="currentPage <= 1 || isLoadingTypes"
                @click="goToPage(currentPage - 1)"
              >
                Prev
              </button>
              <span>Page {{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                class="rounded border border-slate-300 px-2 py-1 transition hover:bg-slate-100 disabled:cursor-not-allowed"
                :disabled="currentPage >= totalPages || isLoadingTypes"
                @click="goToPage(currentPage + 1)"
              >
                Next
              </button>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <input
              v-model="typeForm.optional_TYPE"
              type="text"
              class="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600 disabled:bg-slate-100"
              placeholder="OPTIONAL_TYPE"
              :disabled="typeFormMode === 'edit'"
            />
            <input
              v-model="typeForm.description"
              type="text"
              class="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600"
              placeholder="Description"
            />
            <div class="flex gap-1">
              <button type="button" class="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" @click="onNewType">New</button>
              <button type="button" class="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50" @click="saveType">Save</button>
              <button
                type="button"
                class="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                :disabled="typeFormMode !== 'edit'"
                @click="deleteType"
              >
                Del
              </button>
            </div>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 p-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs font-semibold text-slate-700">OPTION VALUES - {{ selectedTypeCode || 'N/A' }}</p>
          </div>

          <div class="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200">
            <table class="min-w-full border-collapse">
              <thead>
                <tr class="border-b border-slate-200 bg-slate-50">
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Value</th>
                  <th class="px-2 py-2 text-left text-xs font-semibold text-slate-700">Order</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in valueRows"
                  :key="item.value_ID"
                  class="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                  :class="selectedValueId === item.value_ID ? 'bg-blue-50' : ''"
                  @click="selectValue(item)"
                >
                  <td class="px-2 py-2 text-xs font-medium text-slate-900">{{ item.option_VALUE }}</td>
                  <td class="px-2 py-2 text-xs text-slate-700">{{ item.display_ORDER }}</td>
                </tr>
                <tr v-if="!valueRows.length">
                  <td colspan="2" class="px-2 py-3 text-center text-xs text-slate-500">Chưa có values.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_120px_auto]">
            <input
              v-model="valueForm.option_VALUE"
              type="text"
              class="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600"
              placeholder="Option value"
            />
            <input
              v-model.number="valueForm.display_ORDER"
              type="number"
              min="1"
              class="rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-blue-600"
            />
            <div class="flex gap-1">
              <button type="button" class="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100" @click="onNewValue">New</button>
              <button
                type="button"
                class="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed"
                :disabled="!selectedTypeCode"
                @click="saveValue"
              >
                Save
              </button>
              <button
                type="button"
                class="rounded border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:cursor-not-allowed"
                :disabled="valueFormMode !== 'edit' || !selectedTypeCode"
                @click="deleteValue"
              >
                Del
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  CreateTypeOptionTable,
  CreateTypeOptionType,
  CreateTypeOptionValue,
  DeleteTypeOptionType,
  DeleteTypeOptionValue,
  GetTypeOptionsPaged,
  GetTypeOptionValues,
  UpdateTypeOptionType,
  UpdateTypeOptionValue,
  type TypeOptionTypeItem,
  type TypeOptionValueItem
} from '~/composables/AuthApi'

definePageMeta({
  layout: 'dashboard'
})

const typeRows = ref<TypeOptionTypeItem[]>([])
const valueRows = ref<TypeOptionValueItem[]>([])
const selectedTypeCode = ref('')
const selectedValueId = ref<number | null>(null)
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)
const isLoadingTypes = ref(false)
const isLoadingValues = ref(false)
const message = ref('')
const isSuccess = ref(false)
let messageTimer: ReturnType<typeof setTimeout> | null = null

const typeFormMode = ref<'create' | 'edit'>('create')
const valueFormMode = ref<'create' | 'edit'>('create')
const typeForm = reactive({
  optional_TYPE: '',
  description: ''
})
const valueForm = reactive({
  value_ID: 0,
  option_VALUE: '',
  display_ORDER: 1
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))
const messageClass = computed(() =>
  isSuccess.value
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border border-red-200 bg-red-50 text-red-700'
)

const setMessage = (content: string, success: boolean) => {
  if (messageTimer) clearTimeout(messageTimer)
  message.value = content
  isSuccess.value = success
  messageTimer = setTimeout(() => {
    message.value = ''
    messageTimer = null
  }, 3000)
}

const closeMessage = () => {
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = null
  message.value = ''
}

const normalizeTypeRow = (row: any): TypeOptionTypeItem => ({
  optional_TYPE: String(row?.optional_TYPE ?? row?.OPTIONAL_TYPE ?? '').trim(),
  description: String(row?.description ?? row?.DESCRIPTION ?? '').trim()
})

const normalizeValueRow = (row: any): TypeOptionValueItem => ({
  value_ID: Number(row?.value_ID ?? row?.VALUE_ID ?? 0),
  optional_TYPE: String(row?.optional_TYPE ?? row?.OPTIONAL_TYPE ?? '').trim(),
  option_VALUE: String(row?.option_VALUE ?? row?.OPTION_VALUE ?? '').trim(),
  display_ORDER: Number(row?.display_ORDER ?? row?.DISPLAY_ORDER ?? 0)
})

const loadTypes = async () => {
  isLoadingTypes.value = true
  try {
    const response = await GetTypeOptionsPaged(currentPage.value, pageSize.value, searchKeyword.value.trim())
    const outer = response as any
    const payload = outer?.data ?? outer?.Data ?? {}
    const rows = payload?.data ?? payload?.Data ?? []
    const count = payload?.totalCount ?? payload?.TotalCount ?? 0
    typeRows.value = Array.isArray(rows)
      ? rows.map(normalizeTypeRow).filter(item => item.optional_TYPE)
      : []
    totalCount.value = Number(count || 0)
    if (selectedTypeCode.value) {
      const found = typeRows.value.find(item => item.optional_TYPE === selectedTypeCode.value)
      if (!found) {
        selectedTypeCode.value = ''
        valueRows.value = []
        onNewType()
      }
    }
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Không tải được option types.', false)
  } finally {
    isLoadingTypes.value = false
  }
}

const loadValues = async (optionalType: string) => {
  if (!optionalType) {
    valueRows.value = []
    return
  }
  try {
    isLoadingValues.value = true
    const rows = await GetTypeOptionValues(optionalType)
    const normalized = Array.isArray(rows)
      ? rows.map(normalizeValueRow).filter(item => item.value_ID > 0 || item.option_VALUE)
      : []
    valueRows.value = [...normalized].sort((a, b) => Number(a.display_ORDER || 0) - Number(b.display_ORDER || 0))
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Không tải được option values.', false)
  } finally {
    isLoadingValues.value = false
  }
}

const runSearch = async () => {
  currentPage.value = 1
  await loadTypes()
}

const goToPage = async (page: number) => {
  currentPage.value = page
  await loadTypes()
}

const onNewType = () => {
  typeFormMode.value = 'create'
  typeForm.optional_TYPE = ''
  typeForm.description = ''
}

const selectType = async (item: TypeOptionTypeItem) => {
  selectedTypeCode.value = item.optional_TYPE
  typeFormMode.value = 'edit'
  typeForm.optional_TYPE = item.optional_TYPE
  typeForm.description = item.description || ''
  await loadValues(item.optional_TYPE)
  onNewValue()
}

const saveType = async () => {
  const optionalType = typeForm.optional_TYPE.trim().toUpperCase()
  const description = typeForm.description.trim()
  if (!optionalType) {
    setMessage('OPTIONAL_TYPE là bắt buộc.', false)
    return
  }
  if (!description) {
    setMessage('Description là bắt buộc.', false)
    return
  }

  try {
    if (typeFormMode.value === 'create') {
      await CreateTypeOptionType({ optional_TYPE: optionalType, description })
      setMessage('Tạo option type thành công.', true)
    } else {
      await UpdateTypeOptionType(optionalType, { description })
      setMessage('Cập nhật option type thành công.', true)
    }
    await loadTypes()
    const created = typeRows.value.find(item => item.optional_TYPE === optionalType)
    if (created) {
      await selectType(created)
    }
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Lưu option type thất bại.', false)
  }
}

const deleteType = async () => {
  if (typeFormMode.value !== 'edit') return
  const optionalType = typeForm.optional_TYPE.trim().toUpperCase()
  if (!optionalType) return
  try {
    await DeleteTypeOptionType(optionalType)
    setMessage('Xóa option type thành công.', true)
    selectedTypeCode.value = ''
    valueRows.value = []
    onNewType()
    await loadTypes()
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Xóa option type thất bại.', false)
  }
}

const onNewValue = () => {
  valueFormMode.value = 'create'
  selectedValueId.value = null
  valueForm.value_ID = 0
  valueForm.option_VALUE = ''
  valueForm.display_ORDER = valueRows.value.length + 1
}

const selectValue = (item: TypeOptionValueItem) => {
  valueFormMode.value = 'edit'
  selectedValueId.value = item.value_ID
  valueForm.value_ID = item.value_ID
  valueForm.option_VALUE = item.option_VALUE
  valueForm.display_ORDER = Number(item.display_ORDER || 1)
}

const saveValue = async () => {
  if (!selectedTypeCode.value) {
    setMessage('Hãy chọn option type trước.', false)
    return
  }
  const optionValue = valueForm.option_VALUE.trim()
  const displayOrder = Number(valueForm.display_ORDER || 1)
  if (!optionValue) {
    setMessage('Option value là bắt buộc.', false)
    return
  }

  try {
    if (valueFormMode.value === 'create') {
      await CreateTypeOptionValue(selectedTypeCode.value, {
        option_VALUE: optionValue,
        display_ORDER: displayOrder
      })
      setMessage('Tạo option value thành công.', true)
    } else {
      await UpdateTypeOptionValue(valueForm.value_ID, {
        option_VALUE: optionValue,
        display_ORDER: displayOrder
      })
      setMessage('Cập nhật option value thành công.', true)
    }
    await loadValues(selectedTypeCode.value)
    onNewValue()
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Lưu option value thất bại.', false)
  }
}

const deleteValue = async () => {
  if (valueFormMode.value !== 'edit' || !valueForm.value_ID) return
  try {
    await DeleteTypeOptionValue(valueForm.value_ID)
    setMessage('Xóa option value thành công.', true)
    await loadValues(selectedTypeCode.value)
    onNewValue()
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Xóa option value thất bại.', false)
  }
}

const initOptionTable = async () => {
  try {
    await CreateTypeOptionTable()
    setMessage('Khởi tạo bảng option thành công.', true)
  } catch (error: any) {
    setMessage(error?.response?.data?.message || 'Khởi tạo bảng thất bại.', false)
  }
}

onMounted(async () => {
  onNewType()
  onNewValue()
  await loadTypes()
})

onBeforeUnmount(() => {
  if (messageTimer) clearTimeout(messageTimer)
})
</script>
