<template>
  <div v-if="data">
    <div class="flex w-full h-[150px] border-b-2 border-black">
      <div class="flex justify-center items-center px-2 border-r-2 border-black">
        <img src="~/assets/image/logo.png" alt="Logo" class="h-full w-auto object-contain" />
      </div>

      <div class="flex flex-[4] justify-center items-center min-w-[50%] border-r-2 border-black">
        <div class="text-center font-black text-xl">
          <template v-if="headerTitleLines.length">
            <div v-for="(line, idx) in headerTitleLines" :key="`dynamic-header-line-${idx}`">{{ line }}</div>
          </template>
          <template v-else>
            PHIẾU BẢO DƯỠNG VÀ NGHIỆM THU<br />
            HỆ THỐNG ĐIỆN<br />
            MAINTENANCE AND CHECKLIST<br />
            FOR ELECTRIC SYSTEM
          </template>
        </div>
      </div>
      <div class="flex flex-[1.1] justify-start items-center pl-3 md:pl-4 border-black">
        <div class="text-left font-bold text-base md:text-lg leading-tight">
          <div>Giàn / Объект: <span class="font-normal">{{ data.gian || '' }}</span></div>
          <div>Ngày / Date: <span class="font-normal">{{ data.evt_TGBD || '' }}</span></div>
          <div>Số / номер: <span class="font-normal"></span></div>
          <div>Page:</div>
        </div>
      </div>
    </div>

    <div class="flex w-full min-h-[120px] mt-2 flex-wrap md:flex-nowrap">
      <div class="flex flex-1 min-w-[280px] md:min-w-0 justify-start items-start py-2 pl-4">
        <div class="text-left font-bold text-lg">
          <div>Tên hệ thống: <span class="font-normal">{{ data.TENTBI || '' }}</span></div>
          <div>Наим. сист.</div>
          <div>Dạng bảo dưỡng: <span class="font-normal">{{ data.DangBaoDuong || '' }}</span></div>
          <div>Вид ППР</div>
        </div>
      </div>
      <div class="flex flex-1 min-w-[280px] md:min-w-0 justify-start items-start py-2 pl-4">
        <div class="text-left font-bold text-lg">
          <div>Ký mã hiệu: <span class="font-normal">{{ data.KyMaHieu || '' }}</span></div>
          <div>Тип, марка</div>
          <div>Theo hướng dẫn số: <span class="font-normal">{{ data.TheoHuongDan || '' }}</span></div>
          <div>По инструкции №</div>
        </div>
      </div>
      <div class="flex flex-1 min-w-[220px] md:min-w-0 justify-start items-start py-2 pl-4">
        <div class="text-left font-bold text-lg">
          <div>Vị trí lắp đặt: <span class="font-normal">{{ data.ViTriLapDat || '' }}</span></div>
          <div>Место установки</div>
        </div>
      </div>
    </div>

    <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm">
      1. Cho phép đưa hệ thống vào bảo dưỡng / Разрешение ввода в ППР
    </div>
    <div class="flex w-full mt-4 pb-4 min-h-[80px]">
      <div class="flex flex-1 justify-start items-center pl-6 py-2">
        <div class="flex items-center gap-6">
          <div class="text-left font-bold min-w-[140px] text-sm leading-relaxed">
            Người cho phép: <br />
            Лицо, разрешающее
          </div>
          <a-select
            v-model:value="selectedPerson"
            show-search
            placeholder="Chọn người cho phép"
            :filter-option="false"
            @search="handlePersonSearch"
            @change="handlePersonChange"
            :disabled="disabled"
            class="custom-select w-[280px] h-[40px]"
            size="middle"
            optionLabelProp="label"
            id="personSelect"
            name="cbGIANTRUONG"
          >
            <a-select-option
              v-for="person in filteredPersons"
              :key="person.per_code"
              :value="person.per_code"
              :label="stripJobTitle(person.per_desc)"
            >
              <div class="flex flex-col">
                <span>{{ stripJobTitle(person.per_desc) }}</span>
                <span class="text-xs text-gray-500">{{ person.per_jobtitle }}</span>
              </div>
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="flex flex-1 justify-start items-center pl-6 py-2">
        <div class="flex items-center gap-6">
          <div class="text-left font-bold min-w-[140px] text-sm leading-relaxed">
            Chức danh: <br />
            Должность
          </div>
          <div
            class="min-h-[40px] flex items-center px-4 rounded-lg w-[220px] text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span id="jobTitleDisplayJob" class="font-medium">{{ selectedJobTitle || '' }}</span>
          </div>
        </div>
      </div>
      <div class="flex flex-1 justify-start items-center pl-6 py-2">
        <div class="flex items-center gap-6">
          <div class="text-left font-bold min-w-[140px] text-sm leading-relaxed">
            Ký tên: <br />
            Подпись
          </div>
          <div
            class="min-h-[40px] flex items-center px-4 rounded-lg w-[220px] text-sm shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span id="signatureDisplay" class="font-medium" v-html="data.NgayNguoiChoPhep || ''"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FirstFormData } from '~/composables/FirstFormApi'
import { GetNguoiChoPhep, UpdateNguoiChoPhep } from '~/composables/PersonApi'
import type { PersonData } from '~/composables/PersonTable'

interface Props {
  data: FirstFormData | null
  wocode: string
  disabled?: boolean
  dynamicHeaderLines?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  updated: []
}>()

const personList = ref<PersonData[]>([])
const selectedPerson = ref<string>('')
const selectedJobTitle = ref<string>('')
const personSearchValue = ref<string>('')
const pageSize = 50
const isLoadingAllPersons = ref(false)
const personLoadRequestId = ref(0)
const headerTitleLines = computed(() =>
  (props.dynamicHeaderLines || [])
    .map(line => String(line || '').trim())
    .filter(Boolean)
    .slice(0, 4)
)

const handlePersonSearch = (value: string) => {
  personSearchValue.value = value
}

const filteredPersons = computed(() => {
  if (!personSearchValue.value) return personList.value
  return personList.value.filter((person) =>
    person.per_desc?.toLowerCase().includes(personSearchValue.value.toLowerCase())
  )
})

const parseJobTitle = (desc: string): string => {
  const match = desc.match(/\(([^)]+)\)/)
  return match && match[1] ? match[1].trim() : ''
}

const stripJobTitle = (desc: string): string => {
  return (desc || '').replace(/\s*\([^)]*\)\s*$/, '').trim()
}

const syncSelectedJobTitle = (personCode: string) => {
  if (!personCode) {
    selectedJobTitle.value = ''
    return
  }
  const selectedPersonData = personList.value.find((p) => p.per_code === personCode)
  selectedJobTitle.value = selectedPersonData?.per_jobtitle || ''
}

const mergeUniqueByCode = (current: PersonData[], incoming: PersonData[]) => {
  const map = new Map<string, PersonData>()
  for (const item of current) map.set(item.per_code, item)
  for (const item of incoming) map.set(item.per_code, item)
  return Array.from(map.values())
}

const normalizeNguoiChoPhepRows = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.Data)) return payload.Data
  return []
}

const fetchPersons = async (org: string, startrowValue: number, append: boolean) => {
  try {
    const res = await GetNguoiChoPhep(org, startrowValue)
    const mapped: PersonData[] = normalizeNguoiChoPhepRows(res).map((item: any) => ({
      per_code: item.schedgroup || item.userdefinedfieldvalue,
      per_desc: item.schedgroupdesc || item.description,
      per_jobtitle: item.JobTitle?.trim() || parseJobTitle(item.schedgroupdesc || item.description),
      per_trade: '',
      per_udfchkbox01: ''
    }))
    personList.value = append ? mergeUniqueByCode(personList.value, mapped) : mapped
    syncSelectedJobTitle(selectedPerson.value)
    return mapped.length
  } catch (error) {
    console.error('Failed to fetch NguoiChoPhep:', error)
    return 0
  }
}

const loadAllPersons = async (org: string) => {
  if (isLoadingAllPersons.value) return
  const requestId = ++personLoadRequestId.value
  isLoadingAllPersons.value = true
  personList.value = []
  try {
    let currentStartRow = 1
    let pageCalls = 0
    const maxPageCalls = 300
    while (pageCalls < maxPageCalls) {
      const loadedCount = await fetchPersons(org, currentStartRow, currentStartRow > 1)
      if (requestId !== personLoadRequestId.value) return
      if (loadedCount <= 0) {
        break
      }
      currentStartRow += pageSize
      pageCalls += 1
    }
    if (pageCalls >= maxPageCalls) {
      console.warn('NguoiChoPhep paging reached safety limit, stopping prefetch.')
    }
  } finally {
    if (requestId === personLoadRequestId.value) {
      isLoadingAllPersons.value = false
    }
  }
}

const handlePersonChange = async (value: any) => {
  if (props.disabled) return

  const personCode = value as string
  selectedPerson.value = personCode || ''
  syncSelectedJobTitle(selectedPerson.value)

  if (!personCode) return

  try {
    await UpdateNguoiChoPhep(props.wocode, personCode)
    emit('updated')
  } catch (error) {
    console.error('Failed to update người cho phép:', error)
  }
}

watch(
  () => props.data?.NguoiChoPhep,
  (newValue) => {
    selectedPerson.value = newValue || ''
    syncSelectedJobTitle(selectedPerson.value)
  },
  { immediate: true }
)

watch(
  () => props.data?.gian,
  (newOrg) => {
    const org = (newOrg || '').trim()
    if (!org) return
    loadAllPersons(org)
  },
  { immediate: true }
)

</script>

<style scoped>
.custom-select {
  font-family: 'Times New Roman', Times, serif !important;
}
</style>
