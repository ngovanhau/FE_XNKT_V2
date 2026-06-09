
<script setup lang="ts">
//core
import { useRoute } from '#app'
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import type { ComponentPublicInstance } from 'vue'

// api
import { GetFirstForm } from '~/composables/FirstFormApi'
import type { FirstFormData, FirstFormResponse } from '~/composables/FirstFormApi'
import type {NdTruocResponse, NdTruocItem } from '~/composables/NDCV'
import { GetToolByWO, DeleteTool } from '~/composables/ToolApi'
import type { ToolData, ToolResponse } from '~/composables/ToolApi'
import { GetDesignerByWo, UpdateTTLVTBRow } from '~/composables/TTLVTBApi'
import type { TTLVTBDesignerGroup, DesignerTemplateNode, TTLVTBUdfFieldConfig, TTLVTBFieldStyleConfig } from '~/composables/TTLVTBApi'
import { GetTypeOptionValues } from '~/composables/AuthApi'
import { GetDynamicFormHeaders } from '~/composables/DynamicFormHeaderApi'
import type { DynamicFormHeaderItem } from '~/composables/DynamicFormHeaderApi'

import { GetNdTruoc, UpdateTichTruocND, UpdateCVK2, GetCVK2,
  GetNdBaoDuong, UpdateTichBaoDuongND, GetCVK4, NoteCVK4,
  GetNdSau, TichNdSau, GetCVK6, NoteCVK6, ExportPdf, UpdateTichCVK
 } from '~/composables/FORMMAINApi'

// components
import HeaderPermission from '~/components/HeaderPermission.vue'
import CheckboxList from '~/components/CheckboxList.vue'
import TinhTrangThietBiSauBaoDuong from '~/components/TinhTrangThietBiSauBaoDuong.vue'
import VatTuTieuHaoWO from '~/components/VatTuTieuHaoWO.vue'
import ToolEquipmentTable from '~/components/ToolEquipmentTable.vue'
import ToolSelectionModal from '~/components/ToolSelectionModal.vue'
import GhiChuWOPersonTable from '~/components/GhiChuWOPersonTable.vue'

const route = useRoute()
const resolveWoCode = () => {
  const fromRoute = route.query.wocode || route.query.wo || route.query.WO
  const normalized = Array.isArray(fromRoute) ? fromRoute[0] : fromRoute
  if (normalized) return String(normalized).trim()
  const requestUrl = useRequestURL()
  const fromRequest =
    (requestUrl.searchParams.get('wocode') || '').trim() ||
    (requestUrl.searchParams.get('wo') || '').trim() ||
    (requestUrl.searchParams.get('WO') || '').trim()
  if (fromRequest) return fromRequest
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    return (params.get('wocode') || params.get('wo') || params.get('WO') || '').trim()
  }
  return ''
}
const wocode = resolveWoCode()
const getCurrentWoCode = () => {
  const fromData = String(data.value?.evt_code || '').trim()
  if (fromData) return fromData
  const fromRoute = String(route.query.wocode || route.query.wo || route.query.WO || '').trim()
  if (fromRoute) return fromRoute
  const fromResolver = resolveWoCode()
  if (fromResolver) return fromResolver
  return String(wocode || '').trim()
}

const data = ref<FirstFormData | null>(null)
const tinhTrangThietBi = ref<number | null>(null)
const tongThoiGian = ref<string>('')
const nhanLuc = ref<string>('')
const pending = ref(true)
const error = ref<string | null>(null)

const congViecKhacChecked = ref<boolean>(false)
const congViecKhacText = ref<string>('')
const congViecKhacLine = ref<number>(0)
const congViecKhacType = ref<string>('')

// Notification state
const showNotification = ref(false)
// NdTruoc data state
const ndTruocData = ref<{ Left: NdTruocItem[], Right: NdTruocItem[] } | null>(null)

// Tool data state (Mục 3)
const toolData = ref<ToolData[]>([])
const toolLoading = ref(false)

// Tool selection modal state
const showToolModal = ref(false)

// Section 5: Dynamic designer by WO
const designerGroups = ref<TTLVTBDesignerGroup[]>([])
const designerLoading = ref(false)
const designerError = ref<string | null>(null)
const dynamicHeaderByBoPhan = ref<DynamicFormHeaderItem[]>([])
const optionValuesByType = ref<Record<string, string[]>>({})
const updatingRowMap = ref<Record<string, boolean>>({})
const rowUpdateTimers = new Map<string, ReturnType<typeof setTimeout>>()
const rowChangeSignatureMap = ref<Record<string, string>>({})
const optionDetailsElementMap = new Map<string, HTMLDetailsElement>()

// Section 6: Nội dung sau bảo dưỡng state
const ndSauData = ref<{ Left: NdTruocItem[], Right: NdTruocItem[] } | null>(null)
const ndSauChecked = ref<boolean>(false)
const ndSauText = ref<string>('')
const ndSauLine = ref<number>(0)
const ndSauType = ref<string>('')

// NdBaoDuong data state (mục 4)
const ndBaoDuongData = ref<{ Left: NdTruocItem[], Right: NdTruocItem[] } | null>(null)
const ndBaoDuongChecked = ref<boolean>(false)
const ndBaoDuongText = ref<string>('')
const ndBaoDuongLine = ref<number>(0)
const ndBaoDuongType = ref<string>('')

const timerValue = ref<number | undefined>(undefined)
const ptwNoValue = ref<string>('')



// Handle notification from TinhTrangThietBiSauBaoDuong component
const handleNotificationFromComponent = (message: string) => {
  notificationMessage.value = message
  showNotification.value = true
}

const notificationMessage = ref('Cập nhật thành công!')
// Export PDF state
const isExporting = ref<boolean>(false)

const applyFirstFormData = (newData: FirstFormData) => {
  data.value = newData

  if (data.value?.TinhTrangTbi) {
    let mappedValue: number | null = null
    const tinhTrangText = data.value.TinhTrangTbi.toString().trim()

    if (tinhTrangText.includes('Tốt, sẵn sàng hoạt động') || tinhTrangText === '1') {
      mappedValue = 1
    } else if (tinhTrangText.includes('Có thể hoạt động tạm thời') || tinhTrangText === '2') {
      mappedValue = 2
    } else if (tinhTrangText.includes('Cần sửa chữa, cấm hoạt động') || tinhTrangText === '3') {
      mappedValue = 3
    } else {
      const parsedValue = parseInt(tinhTrangText)
      if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 3) {
        mappedValue = parsedValue
      }
    }

    if (mappedValue !== null) {
      tinhTrangThietBi.value = mappedValue
    }
  }

  const t = (data.value?.Timer ?? '').toString().trim()
  const parsed = parseFloat(t)
  timerValue.value = !isNaN(parsed) ? parsed : undefined
  ptwNoValue.value = (data.value?.PTWNo ?? '').toString().trim()
}

const refreshFirstForm = async () => {
  try {
    const response: FirstFormResponse = await GetFirstForm(wocode)
    if (response?.IsSuccess) {
      applyFirstFormData(response.Data)
    }
  } catch (err) {
    console.error('Error refreshing first form data:', err)
  }
}

onMounted(async () => {
  try {
    console.log('Fetching data for wocode:', wocode)
    const response: FirstFormResponse = await GetFirstForm(wocode)
    console.log('GetFirstForm response:', response)
    
    if (response?.IsSuccess) {
      applyFirstFormData(response.Data)
      console.log('Data loaded successfully:', data.value)
      
      await Promise.all([
        fetchNdTruoc(),
        fetchCongViecKhac(),
        fetchToolData(),
        fetchNdBaoDuong(),
        fetchCongViecKhac4(),
        fetchNdSau(),
        fetchCongViecKhac6(),
        fetchDesignerByWo(),
      ])
    } else {
      console.error('API returned IsSuccess=false:', response)
      error.value = 'Không thể tải dữ liệu từ server'
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Lỗi khi tải dữ liệu: ' + (err as Error).message
  } finally {
    pending.value = false
  }
})

onBeforeUnmount(() => {
  rowUpdateTimers.forEach((timer) => clearTimeout(timer))
  rowUpdateTimers.clear()
  closeAllOptionDropdowns()
  optionDetailsElementMap.clear()
})

watch(
  () => String(data.value?.bophan || '').trim().toUpperCase(),
  async (newValue, oldValue) => {
    if (newValue === oldValue) return
    await loadDynamicHeaderByBoPhan()
  }
)

const getSortedNodes = (nodes: DesignerTemplateNode[]): DesignerTemplateNode[] => {
  return [...(nodes || [])].sort((a, b) => Number(a?.displayOrder || 0) - Number(b?.displayOrder || 0))
}

const getNodeDepth = (node: DesignerTemplateNode): number => {
  const children = getSortedNodes(node.children || [])
  if (!children.length) return 1
  return 1 + Math.max(...children.map(getNodeDepth))
}

const countLeafNodes = (node: DesignerTemplateNode): number => {
  const children = getSortedNodes(node.children || [])
  if (!children.length) return 1
  return children.reduce((sum, child) => sum + countLeafNodes(child), 0)
}

interface HeaderPreviewCell {
  node: DesignerTemplateNode
  colspan: number
  rowspan: number
}

const buildHeaderPreviewRows = (nodes: DesignerTemplateNode[]): HeaderPreviewCell[][] => {
  const sortedRoots = getSortedNodes(nodes)
  if (!sortedRoots.length) return []
  const maxDepth = Math.max(...sortedRoots.map(getNodeDepth))
  const rows: HeaderPreviewCell[][] = Array.from({ length: maxDepth }, () => [])

  const visit = (node: DesignerTemplateNode, depth: number) => {
    const children = getSortedNodes(node.children || [])
    const colspan = countLeafNodes(node)
    const rowspan = children.length === 0 ? maxDepth - depth + 1 : 1
    rows[depth - 1]?.push({ node, colspan, rowspan })
    children.forEach((child) => visit(child, depth + 1))
  }

  sortedRoots.forEach((root) => visit(root, 1))
  return rows
}

const collectLeafNodes = (nodes: DesignerTemplateNode[]): DesignerTemplateNode[] => {
  const leaves: DesignerTemplateNode[] = []
  const traverse = (node: DesignerTemplateNode) => {
    const children = getSortedNodes(node.children || [])
    if (!children.length) {
      leaves.push(node)
      return
    }
    children.forEach(traverse)
  }
  getSortedNodes(nodes).forEach(traverse)
  return leaves
}

const normalizeKey = (value: string) => value.replace(/_/g, '').toUpperCase()
const isUdfField = (sourceField: string | null) => /^UDF([1-9]|1[0-5])$/i.test(String(sourceField || '').trim())
const READONLY_SOURCE_FIELDS = new Set(['NO', 'TAGNAME', 'DESCRIPTION', 'LOCATION'])

const getItemValueBySourceField = (item: Record<string, unknown>, sourceField: string | null) => {
  const source = String(sourceField || '').trim()
  if (!source) return ''
  const targetKey = normalizeKey(source)
  const key = Object.keys(item).find((k) => normalizeKey(k) === targetKey)
  if (!key) return ''
  const value = item[key]
  if (value === null || value === undefined) return ''
  return String(value)
}

const setItemValueBySourceField = (item: Record<string, unknown>, sourceField: string | null, value: string) => {
  const source = String(sourceField || '').trim()
  if (!source) return
  const targetKey = normalizeKey(source)
  const existingKey = Object.keys(item).find((k) => normalizeKey(k) === targetKey)
  if (existingKey) {
    item[existingKey] = value
    return
  }
  const fallbackKey = isUdfField(source) ? source.toLowerCase() : source.toUpperCase()
  item[fallbackKey] = value
}

const getRawGroupUdfConfigs = (group: TTLVTBDesignerGroup): TTLVTBUdfFieldConfig[] => {
  return Array.isArray((group as any).udfFieldConfigs) ? (group as any).udfFieldConfigs : []
}

const getRawGroupFieldStyles = (group: TTLVTBDesignerGroup): TTLVTBFieldStyleConfig[] => {
  if (Array.isArray((group as any).fieldStyles)) return (group as any).fieldStyles
  if (Array.isArray((group as any).FieldStyles)) return (group as any).FieldStyles
  return []
}

const normalizeOptionSelectionMode = (row: any): 'single' | 'multiple' => {
  const rawMode = row?.optionSelectionMode
    ?? row?.OptionSelectionMode
    ?? row?.option_selection_mode
    ?? row?.OPTION_SELECTION_MODE
    ?? row?.Option_Selection_Mode
    ?? ''
  return String(rawMode).trim().toLowerCase() === 'multiple' ? 'multiple' : 'single'
}

const normalizeFieldStyleConfig = (row: any): TTLVTBFieldStyleConfig => ({
  sourceField: String(row?.sourceField ?? row?.SourceField ?? '').trim().toUpperCase(),
  headerText: String(row?.headerText ?? row?.HeaderText ?? '').trim() || undefined,
  headerStyle: (row?.headerStyle ?? row?.HeaderStyle ?? null) as Record<string, unknown> | null,
  valueStyle: (row?.valueStyle ?? row?.ValueStyle ?? null) as Record<string, unknown> | null,
  dataType: row?.dataType ?? row?.DataType ?? null,
  inputType: row?.inputType ?? row?.InputType ?? null,
  optionalType: (row?.optionalType ?? row?.OptionalType ?? null) ? String(row?.optionalType ?? row?.OptionalType).trim().toUpperCase() : null,
  optionSelectionMode: normalizeOptionSelectionMode(row)
})

const normalizeAlign = (align: unknown) => {
  const normalized = String(align || '').trim().toLowerCase()
  if (normalized === 'left' || normalized === 'right') return normalized
  return 'center'
}

const normalizeUdfConfig = (row: any): TTLVTBUdfFieldConfig => ({
  sourceField: String(row?.sourceField ?? row?.SourceField ?? '').trim().toUpperCase(),
  headerText: String(row?.headerText ?? row?.HeaderText ?? '').trim(),
  dataType: String(row?.dataType ?? row?.DataType ?? 'text').toLowerCase(),
  optionalType: (row?.optionalType ?? row?.OptionalType ?? null) ? String(row?.optionalType ?? row?.OptionalType).trim().toUpperCase() : null,
  inputType: (row?.inputType ?? row?.InputType ?? null) ? String(row?.inputType ?? row?.InputType).trim().toLowerCase() : null,
  optionSelectionMode: normalizeOptionSelectionMode(row)
})

const getUdfConfig = (group: TTLVTBDesignerGroup, sourceField: string | null): TTLVTBUdfFieldConfig | null => {
  if (!isUdfField(sourceField)) return null
  const source = String(sourceField || '').trim().toUpperCase()
  const rows = getRawGroupUdfConfigs(group)
  const found = rows.find((row: any) => String(row?.sourceField ?? row?.SourceField ?? '').trim().toUpperCase() === source)
  return found ? normalizeUdfConfig(found) : null
}

const getFieldStyleConfig = (group: TTLVTBDesignerGroup, sourceField: string | null): TTLVTBFieldStyleConfig | null => {
  const source = String(sourceField || '').trim().toUpperCase()
  if (!source) return null
  const rows = getRawGroupFieldStyles(group)
  const found = rows.find((row: any) => String(row?.sourceField ?? row?.SourceField ?? '').trim().toUpperCase() === source)
  return found ? normalizeFieldStyleConfig(found) : null
}

const getCellEditorType = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode) => {
  const sourceField = String(leaf?.sourceField || '').trim().toUpperCase()
  if (!sourceField) return 'text'
  if (READONLY_SOURCE_FIELDS.has(sourceField)) return 'readonly'
  const fieldStyleConfig = getFieldStyleConfig(group, sourceField)
  if (fieldStyleConfig) {
    const dataType = String(fieldStyleConfig.dataType || '').toLowerCase()
    const inputType = String(fieldStyleConfig.inputType || '').toLowerCase()
    if (dataType === 'option' || inputType === 'select') return 'option'
    if (dataType === 'number' || inputType === 'number') return 'number'
  }
  const udfConfig = getUdfConfig(group, sourceField)
  if (udfConfig) {
    if (udfConfig.dataType === 'option' || udfConfig.inputType === 'select') return 'option'
    if (udfConfig.dataType === 'number' || udfConfig.inputType === 'number') return 'number'
    return 'text'
  }
  const leafDataType = String((leaf as any)?.dataType || (leaf as any)?.DataType || '').toLowerCase()
  const leafInputType = String((leaf as any)?.inputType || (leaf as any)?.InputType || '').toLowerCase()
  if (leafDataType === 'option' || leafInputType === 'select') return 'option'
  if (leafDataType === 'number' || leafInputType === 'number') return 'number'
  return 'text'
}

const getOptionalTypeForLeaf = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode): string | null => {
  const sourceField = String(leaf?.sourceField || '').trim().toUpperCase()
  const fieldStyleConfig = getFieldStyleConfig(group, sourceField)
  if (fieldStyleConfig?.optionalType) return fieldStyleConfig.optionalType
  const udfConfig = getUdfConfig(group, sourceField)
  if (udfConfig?.optionalType) return udfConfig.optionalType
  const leafOptional = (leaf as any).optionalType ?? (leaf as any).OptionalType
  return leafOptional ? String(leafOptional).trim().toUpperCase() : null
}

const getOptionValuesForLeaf = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode) => {
  const optionalType = getOptionalTypeForLeaf(group, leaf)
  if (!optionalType) return []
  return optionValuesByType.value[optionalType] || []
}

const optionDropdownDirectionMap = ref<Record<string, 'up' | 'down'>>({})

const getOptionDropdownKey = (
  group: TTLVTBDesignerGroup,
  itemIndex: number,
  leaf: DesignerTemplateNode
) => {
  const source = String(leaf?.sourceField || '').trim().toUpperCase()
  return `${group.type}::${itemIndex}::${source || leaf.headerId || leaf.displayOrder}`
}

const closeOptionDropdownByKey = (key: string) => {
  const details = optionDetailsElementMap.get(key)
  if (!details) return
  details.open = false
}

const closeAllOptionDropdowns = (exceptKey: string | null = null) => {
  optionDetailsElementMap.forEach((details, key) => {
    if (exceptKey && key === exceptKey) return
    details.open = false
  })
}

const closeAllOptionDropdownsExceptActiveElement = () => {
  const activeElement = document.activeElement as Element | null
  optionDetailsElementMap.forEach((details) => {
    if (activeElement && details.contains(activeElement)) return
    details.open = false
  })
}

const bindOptionDetailsRef = (
  el: Element | ComponentPublicInstance | null,
  group: TTLVTBDesignerGroup,
  itemIndex: number,
  leaf: DesignerTemplateNode
) => {
  const key = getOptionDropdownKey(group, itemIndex, leaf)
  if (!el) {
    optionDetailsElementMap.delete(key)
    return
  }
  const maybeElement = '$el' in el ? (el.$el as Element | null | undefined) : el
  if (!(maybeElement instanceof HTMLDetailsElement)) {
    optionDetailsElementMap.delete(key)
    return
  }
  optionDetailsElementMap.set(key, maybeElement)
}

const getOptionDropdownPositionClass = (
  group: TTLVTBDesignerGroup,
  itemIndex: number,
  leaf: DesignerTemplateNode
) => {
  const key = getOptionDropdownKey(group, itemIndex, leaf)
  const direction = optionDropdownDirectionMap.value[key] || 'down'
  if (direction === 'up') {
    return 'bottom-full mb-1'
  }
  return 'top-full mt-1'
}

const handleOptionDropdownToggle = (
  event: Event,
  group: TTLVTBDesignerGroup,
  itemIndex: number,
  leaf: DesignerTemplateNode
) => {
  const details = event.currentTarget as HTMLDetailsElement | null
  const key = getOptionDropdownKey(group, itemIndex, leaf)
  if (!details?.open) return
  closeAllOptionDropdowns(key)
  const summary = details.querySelector('summary') as HTMLElement | null
  if (!summary) {
    optionDropdownDirectionMap.value[key] = 'down'
    return
  }
  const rect = summary.getBoundingClientRect()
  const estimatedMenuHeight = 220
  const spaceAbove = rect.top
  const spaceBelow = window.innerHeight - rect.bottom
  optionDropdownDirectionMap.value[key] = spaceBelow >= estimatedMenuHeight || spaceBelow >= spaceAbove
    ? 'down'
    : 'up'
}

const getOptionSelectionModeForLeaf = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode): 'single' | 'multiple' => {
  const sourceField = String(leaf?.sourceField || '').trim().toUpperCase()
  const fieldStyleConfig = getFieldStyleConfig(group, sourceField)
  const styleMode = String(fieldStyleConfig?.optionSelectionMode || '').trim().toLowerCase()
  if (styleMode === 'multiple') return 'multiple'
  if (styleMode === 'single') return 'single'
  const udfConfig = getUdfConfig(group, sourceField)
  const udfMode = String(udfConfig?.optionSelectionMode || '').trim().toLowerCase()
  if (udfMode === 'multiple') return 'multiple'
  if (udfMode === 'single') return 'single'
  const leafMode = String(
    (leaf as any)?.optionSelectionMode
    ?? (leaf as any)?.OptionSelectionMode
    ?? (leaf as any)?.option_selection_mode
    ?? (leaf as any)?.OPTION_SELECTION_MODE
    ?? ''
  ).trim().toLowerCase()
  return leafMode === 'multiple' ? 'multiple' : 'single'
}

const parseOptionCellValues = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

const getSelectedOptionValues = (item: Record<string, unknown>, leaf: DesignerTemplateNode) => {
  const raw = getItemValueBySourceField(item, leaf.sourceField)
  return parseOptionCellValues(raw)
}

const isOptionSelected = (item: Record<string, unknown>, leaf: DesignerTemplateNode, optionValue: string) => {
  const selected = getSelectedOptionValues(item, leaf)
  return selected.includes(optionValue)
}

const getSelectedOptionLabel = (group: TTLVTBDesignerGroup, item: Record<string, unknown>, leaf: DesignerTemplateNode) => {
  const selected = getSelectedOptionValues(item, leaf)
  if (!selected.length) return ''
  const available = getOptionValuesForLeaf(group, leaf)
  const ordered = available.filter(opt => selected.includes(opt))
  const fallback = selected.filter(opt => !ordered.includes(opt))
  return [...ordered, ...fallback].join(', ')
}

const getSelectedOptionDisplayList = (group: TTLVTBDesignerGroup, item: Record<string, unknown>, leaf: DesignerTemplateNode) => {
  const selected = getSelectedOptionValues(item, leaf)
  if (!selected.length) return []
  const available = getOptionValuesForLeaf(group, leaf)
  const ordered = available.filter(opt => selected.includes(opt) && String(opt).trim())
  const fallback = selected.filter(opt => !ordered.includes(opt) && String(opt).trim())
  return [...ordered, ...fallback]
}

const handleTextCellInput = (
  event: Event,
  item: Record<string, unknown>,
  leaf: DesignerTemplateNode
) => {
  const target = event.target as HTMLInputElement
  setItemValueBySourceField(item, leaf.sourceField, target.value ?? '')
}

const handleOptionCellChange = (
  event: Event,
  item: Record<string, unknown>,
  leaf: DesignerTemplateNode
) => {
  const target = event.target as HTMLSelectElement
  const values = Array.from(target.selectedOptions).map(option => option.value).filter(Boolean)
  setItemValueBySourceField(item, leaf.sourceField, values.join(','))
}

const toggleOptionSelection = (
  group: TTLVTBDesignerGroup,
  item: Record<string, unknown>,
  leaf: DesignerTemplateNode,
  optionValue: string,
  checked: boolean
) => {
  const mode = getOptionSelectionModeForLeaf(group, leaf)
  if (mode === 'single') {
    const current = getItemValueBySourceField(item, leaf.sourceField).trim()
    if (checked) {
      setItemValueBySourceField(item, leaf.sourceField, optionValue)
      return
    }
    if (current === optionValue) {
      setItemValueBySourceField(item, leaf.sourceField, '')
    }
    return
  }
  const selected = getSelectedOptionValues(item, leaf)
  const set = new Set(selected)
  if (checked) set.add(optionValue)
  else set.delete(optionValue)
  setItemValueBySourceField(item, leaf.sourceField, Array.from(set).join(','))
}

const toggleOptionByClick = (
  group: TTLVTBDesignerGroup,
  item: Record<string, unknown>,
  leaf: DesignerTemplateNode,
  optionValue: string
) => {
  const isSelected = isOptionSelected(item, leaf, optionValue)
  toggleOptionSelection(group, item, leaf, optionValue, !isSelected)
}

const removeSelectedOptionTag = (
  event: Event,
  group: TTLVTBDesignerGroup,
  item: Record<string, unknown>,
  leaf: DesignerTemplateNode,
  optionValue: string
) => {
  event.preventDefault()
  event.stopPropagation()
  toggleOptionSelection(group, item, leaf, optionValue, false)
}

const getRowKey = (group: TTLVTBDesignerGroup, item: Record<string, unknown>) => {
  const no = getItemValueBySourceField(item, 'NO') || ''
  const tag = getItemValueBySourceField(item, 'TAGNAME') || ''
  return `${group.type}|${no}|${tag}`
}

const getFieldValue = (item: Record<string, unknown>, candidates: string[]) => {
  for (const key of candidates) {
    const foundKey = Object.keys(item).find((k) => normalizeKey(k) === normalizeKey(key))
    if (foundKey) return item[foundKey]
  }
  return null
}

const normalizeDateFieldForPayload = (value: unknown) => {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (!raw) return null
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const ensureDateFieldString = (value: unknown) => {
  const normalized = normalizeDateFieldForPayload(value)
  return normalized || new Date().toISOString()
}

const buildUpdateRowPayload = (group: TTLVTBDesignerGroup, item: Record<string, unknown>) => {
  const payload: Record<string, unknown> = {
    NO: Number(getFieldValue(item, ['NO']) || 0),
    WO_CODE: String(getFieldValue(item, ['WO_CODE']) || wocode),
    TAGNAME: String(getFieldValue(item, ['TAGNAME']) || ''),
    DESCRIPTION: String(getFieldValue(item, ['DESCRIPTION']) || ''),
    LOCATION: String(getFieldValue(item, ['LOCATION']) || ''),
    TYPE: String(getFieldValue(item, ['TYPE']) || group.type || ''),
    CREATEDBY: String(getFieldValue(item, ['CREATEDBY']) || ''),
    CREATED: ensureDateFieldString(getFieldValue(item, ['CREATED'])),
    UPDATEDBY: String(getFieldValue(item, ['UPDATEDBY']) || ''),
    UPDATED: ensureDateFieldString(getFieldValue(item, ['UPDATED'])),
    LASTSAVED: ensureDateFieldString(getFieldValue(item, ['LASTSAVED']))
  }

  for (let i = 1; i <= 15; i += 1) {
    const key = `UDF${i}`
    const value = getFieldValue(item, [key, key.toLowerCase()])
    payload[key.toLowerCase()] = value == null ? '' : String(value)
  }
  return payload
}

const buildRowChangeSignature = (group: TTLVTBDesignerGroup, item: Record<string, unknown>) => {
  const signature: Record<string, string> = {
    type: String(getFieldValue(item, ['TYPE']) || group.type || ''),
    no: String(getFieldValue(item, ['NO']) || ''),
    tagname: String(getFieldValue(item, ['TAGNAME']) || '')
  }
  for (let i = 1; i <= 15; i += 1) {
    const key = `UDF${i}`
    const value = getFieldValue(item, [key, key.toLowerCase()])
    signature[key.toLowerCase()] = value == null ? '' : String(value)
  }
  return JSON.stringify(signature)
}

const syncRowChangeSignatures = (groups: TTLVTBDesignerGroup[]) => {
  const next: Record<string, string> = {}
  groups.forEach((group) => {
    ;(group.items || []).forEach((item) => {
      const rowKey = getRowKey(group, item)
      next[rowKey] = buildRowChangeSignature(group, item)
    })
  })
  rowChangeSignatureMap.value = next
}

const updateRowNow = async (group: TTLVTBDesignerGroup, item: Record<string, unknown>) => {
  const rowKey = getRowKey(group, item)
  const currentSignature = buildRowChangeSignature(group, item)
  const previousSignature = rowChangeSignatureMap.value[rowKey]
  if (previousSignature && previousSignature === currentSignature) {
    return
  }
  try {
    updatingRowMap.value = { ...updatingRowMap.value, [rowKey]: true }
    const payload = buildUpdateRowPayload(group, item)
    const response = await UpdateTTLVTBRow(payload)
    if (!response?.IsSuccess) {
      notificationMessage.value = 'Lưu dòng thất bại.'
      showNotification.value = true
      return
    }
    notificationMessage.value = 'Lưu dòng thành công.'
    showNotification.value = true
    rowChangeSignatureMap.value = {
      ...rowChangeSignatureMap.value,
      [rowKey]: currentSignature
    }
  } catch (error) {
    console.error('Error updating row:', error)
    notificationMessage.value = 'Lưu dòng thất bại.'
    showNotification.value = true
  } finally {
    const next = { ...updatingRowMap.value }
    delete next[rowKey]
    updatingRowMap.value = next
  }
}

const handleRowBlur = (event: FocusEvent, group: TTLVTBDesignerGroup, item: Record<string, unknown>) => {
  const currentTarget = event.currentTarget as HTMLElement | null
  const nextFocused = event.relatedTarget as Node | null
  if (currentTarget && nextFocused && currentTarget.contains(nextFocused)) {
    return
  }
  const rowKey = getRowKey(group, item)
  const timer = rowUpdateTimers.get(rowKey)
  if (timer) clearTimeout(timer)
  const newTimer = setTimeout(async () => {
    const activeInsideCurrent =
      currentTarget && document.activeElement
        ? currentTarget.contains(document.activeElement)
        : false
    if (activeInsideCurrent) {
      rowUpdateTimers.delete(rowKey)
      return
    }
    closeAllOptionDropdownsExceptActiveElement()
    await updateRowNow(group, item)
    rowUpdateTimers.delete(rowKey)
  }, 180)
  rowUpdateTimers.set(rowKey, newTimer)
}

const getAlignClass = (align: string | null | undefined) => {
  if (align === 'left') return 'text-left'
  if (align === 'right') return 'text-right'
  return 'text-center'
}

const getJustifyClass = (align: string | null | undefined) => {
  if (align === 'right') return 'justify-end'
  if (align === 'center') return 'justify-center'
  return 'justify-start'
}

const getHeaderCellStyle = (group: TTLVTBDesignerGroup, node: DesignerTemplateNode) => {
  const fieldStyleConfig = getFieldStyleConfig(group, node.sourceField)
  const configHeaderStyle = (fieldStyleConfig as any)?.headerStyle || {}
  const nodeHeaderStyle = (node as any)?.style || {}
  const style = {
    ...nodeHeaderStyle,
    ...configHeaderStyle
  }
  const headerStyle: Record<string, string> = {}
  if (style?.fontWeight) headerStyle.fontWeight = String(style.fontWeight)
  if (style?.fontSize) headerStyle.fontSize = `${Number(style.fontSize)}px`
  if (style?.backgroundColor) headerStyle.backgroundColor = String(style.backgroundColor)
  if (style?.border === 'none') headerStyle.border = 'none'
  return headerStyle
}

const getGroupLeafColumns = (group: TTLVTBDesignerGroup): DesignerTemplateNode[] => {
  return collectLeafNodes(group?.template?.headerChildren || [])
}

const getGroupTotalLeafWidth = (group: TTLVTBDesignerGroup) => {
  return getGroupLeafColumns(group)
    .reduce((total, leaf) => total + Math.max(1, Number(leaf.width) || 0), 0)
}

const getGroupLeafWidthStyle = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode) => {
  const total = getGroupTotalLeafWidth(group)
  if (!total) return {}
  const normalizedWidth = Math.max(1, Number(leaf.width) || 1)
  return {
    width: `${(normalizedWidth / total) * 100}%`
  }
}

const getValueAlign = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode) => {
  const fieldStyleConfig = getFieldStyleConfig(group, leaf.sourceField)
  const configValueStyle = (fieldStyleConfig as any)?.valueStyle || {}
  const leafValueStyle = (leaf as any)?.valueStyle || {}
  return normalizeAlign(configValueStyle?.align ?? leafValueStyle?.align ?? leaf?.align)
}

const getValueCellStyle = (group: TTLVTBDesignerGroup, leaf: DesignerTemplateNode): Record<string, string> => {
  const fieldStyleConfig = getFieldStyleConfig(group, leaf.sourceField)
  const configValueStyle = (fieldStyleConfig as any)?.valueStyle || {}
  const leafValueStyle = (leaf as any)?.valueStyle || {}
  const valueStyle = {
    ...leafValueStyle,
    ...configValueStyle
  }
  const style: Record<string, string> = {}
  style.textAlign = getValueAlign(group, leaf)
  if (valueStyle?.fontWeight) style.fontWeight = String(valueStyle.fontWeight)
  if (valueStyle?.fontSize) style.fontSize = `${Number(valueStyle.fontSize)}px`
  if (valueStyle?.backgroundColor) style.backgroundColor = String(valueStyle.backgroundColor)
  if (valueStyle?.color) style.color = String(valueStyle.color)
  if (valueStyle?.padding !== undefined && valueStyle?.padding !== null) style.padding = `${Number(valueStyle.padding)}px`
  if (valueStyle?.border === 'none') style.border = 'none'
  return style
}

const getHeaderParentAlign = (
  parent: { text?: string; style?: Record<string, unknown> | null } | { readonly text: string } | null | undefined
) => {
  const style = parent && 'style' in parent ? parent.style : null
  const align = String(style?.align || style?.textAlign || 'center')
  return align === 'left' || align === 'right' ? align : 'center'
}

const loadDynamicHeaderByBoPhan = async () => {
  const boPhan = String(data.value?.bophan || '').trim().toUpperCase()
  if (!boPhan) {
    dynamicHeaderByBoPhan.value = []
    return
  }
  try {
    dynamicHeaderByBoPhan.value = await GetDynamicFormHeaders(boPhan)
  } catch (error) {
    console.error('Error fetching dynamic header by bophan:', error)
    dynamicHeaderByBoPhan.value = []
  }
}

const dynamicHeaderTitleLines = computed(() =>
  dynamicHeaderByBoPhan.value
    .map(item => String(item.text || '').trim())
    .filter(Boolean)
    .slice(0, 4)
)

const fetchDesignerByWo = async () => {
  try {
    designerLoading.value = true
    designerError.value = null
    const woCodeForDesigner = getCurrentWoCode()
    if (!woCodeForDesigner) {
      designerGroups.value = []
      rowChangeSignatureMap.value = {}
      designerError.value = 'Thiếu woCode để tải dữ liệu thiết kế theo WO.'
      return
    }
    const response = await GetDesignerByWo(woCodeForDesigner)
    if (!response?.IsSuccess) {
      designerGroups.value = []
      rowChangeSignatureMap.value = {}
      designerError.value = response?.Message || 'Không tải được dữ liệu thiết kế theo WO.'
      return
    }
    const payload = response.Data as unknown as Record<string, unknown> | undefined
    const rawGroups = Array.isArray(payload?.groups)
      ? payload?.groups
      : (Array.isArray(payload?.Groups) ? payload?.Groups : [])

    designerGroups.value = rawGroups
      .map((raw) => {
        const item = (raw || {}) as Record<string, unknown>
        const template = (item.template ?? item.Template ?? null) as Record<string, unknown> | null
        const udfFieldConfigs = Array.isArray(item.udfFieldConfigs)
          ? (item.udfFieldConfigs as TTLVTBUdfFieldConfig[])
          : (Array.isArray(item.UdfFieldConfigs) ? (item.UdfFieldConfigs as TTLVTBUdfFieldConfig[]) : [])
        const fieldStyles = Array.isArray(item.fieldStyles)
          ? (item.fieldStyles as TTLVTBFieldStyleConfig[])
          : (Array.isArray(item.FieldStyles) ? (item.FieldStyles as TTLVTBFieldStyleConfig[]) : [])
        return {
          type: String(item.type ?? item.Type ?? ''),
          deviceCount: Number(item.deviceCount ?? item.DeviceCount ?? 0),
          items: Array.isArray(item.items) ? (item.items as Record<string, unknown>[]) : (Array.isArray(item.Items) ? (item.Items as Record<string, unknown>[]) : []),
          udfFieldConfigs,
          fieldStyles,
          template: template
            ? {
              templateId: Number(template.templateId ?? template.TemplateId ?? 0),
              categoryCode: String(template.categoryCode ?? template.CategoryCode ?? ''),
              templateName: String(template.templateName ?? template.TemplateName ?? ''),
              headerParents: Array.isArray(template.headerParents) ? template.headerParents : [],
              tableStyle: (template.tableStyle ?? null) as Record<string, unknown> | null,
              rowStyle: (template.rowStyle ?? null) as Record<string, unknown> | null,
              headerChildren: Array.isArray(template.headerChildren) ? (template.headerChildren as DesignerTemplateNode[]) : []
            }
            : null
        } satisfies TTLVTBDesignerGroup
      })
      .sort((a, b) => a.type.localeCompare(b.type))
    syncRowChangeSignatures(designerGroups.value)

    const optionalTypes = new Set<string>()
    designerGroups.value.forEach((group) => {
      getRawGroupUdfConfigs(group).forEach((cfg: any) => {
        const normalized = normalizeUdfConfig(cfg)
        if (normalized.dataType === 'option' && normalized.optionalType) {
          optionalTypes.add(normalized.optionalType)
        }
      })

      // Fallback theo template leaf node: phòng trường hợp BE chưa trả UdfFieldConfigs
      getGroupLeafColumns(group).forEach((leaf) => {
        const leafDataType = String((leaf as any)?.dataType || (leaf as any)?.DataType || '').toLowerCase()
        const leafInputType = String((leaf as any)?.inputType || (leaf as any)?.InputType || '').toLowerCase()
        if (leafDataType === 'option' || leafInputType === 'select') {
          const optionalType = getOptionalTypeForLeaf(group, leaf)
          if (optionalType) {
            optionalTypes.add(optionalType)
          }
        }
      })
    })

    const optionMap: Record<string, string[]> = {}
    for (const optionalType of optionalTypes) {
      try {
        const values = await GetTypeOptionValues(optionalType)
        optionMap[optionalType] = (Array.isArray(values) ? values : [])
          .map((row: any) => String(row?.option_VALUE ?? row?.OPTION_VALUE ?? '').trim())
          .filter(Boolean)
      } catch (error) {
        console.error(`Error fetching option values for ${optionalType}:`, error)
        optionMap[optionalType] = []
      }
    }
    optionValuesByType.value = optionMap
  } catch (err) {
    console.error('Error fetching designer by WO:', err)
    designerGroups.value = []
    rowChangeSignatureMap.value = {}
    designerError.value = 'There are .'
  } finally {
    designerLoading.value = false
  }
}

// Computed property to check if sections should be disabled
const isFormDisabled = computed(() => {
  return data.value?.evtstatus == 'C' || data.value?.evtstatus == 'R6'
})


// Export PDF function (giống AOSSBM3, gọi API HPNDCV/ExportPdf)
const handleExportPdf = async () => {
  if (!data.value?.evt_code || !data.value?.matbi) {
    notificationMessage.value = 'Thiếu thông tin wocode hoặc matbi để xuất PDF'
    showNotification.value = true
    return
  }

  try {
    isExporting.value = true
    const result = await ExportPdf(data.value.evt_code, data.value.matbi)
    if (result.data?.IsSuccess && result.data?.Data?.previewUrl) {
      window.open(result.data.Data.previewUrl, '_blank')
      notificationMessage.value = 'Xuất PDF thành công!'
    } else {
      notificationMessage.value = 'Lỗi khi xuất PDF: ' + (result.data?.Message || 'Không thể tạo PDF')
    }
  } catch (error) {
    console.error('Export PDF error:', error)
    notificationMessage.value = 'Lỗi khi xuất PDF: ' + (error as Error).message
  } finally {
    isExporting.value = false
    showNotification.value = true
  }
}

// Handle notification hide
const handleNotificationHide = () => {
  showNotification.value = false
}


//office 2

// Fetch NdTruoc data
const fetchNdTruoc = async () => {
  try {
    const response: NdTruocResponse = await GetNdTruoc(wocode)
    if (response?.IsSuccess) {
      ndTruocData.value = response.Data
    }
  } catch (err) {
    console.error('Error fetching NdTruoc:', err)
  }
}

// Handler for CheckboxList component events
const handleToggleItem = async (item: NdTruocItem) => {
  try {
    const newIstick = item.ND_ISTICK === '+' ? '-' : '+'
    console.log('Toggling checkbox:', item.ND_Line, 'from', item.ND_ISTICK, 'to', newIstick)
    
    const response = await UpdateTichTruocND(wocode, item.ND_Line, newIstick)
    console.log('API response:', response)
    
    item.ND_ISTICK = newIstick
    
    showNotification.value = true
    
  } catch (error) {
    console.error('Error updating tick status:', error)
    showNotification.value = true
  }
}

// Tool modal handlers
const openToolModal = () => {
  showToolModal.value = true
}

const handleToolAdded = async () => {
  await fetchToolData()
  showNotification.value = true
  showToolModal.value = false
}

// Fetch tool data from API (Mục 3)
const fetchToolData = async () => {
  try {
    toolLoading.value = true
    const response: ToolResponse = await GetToolByWO(wocode)
    if (response?.IsSuccess && response.Data) {
      toolData.value = response.Data
    } else {
      toolData.value = []
    }
  } catch (err) {
    console.error('Error fetching tool data:', err)
    toolData.value = []
  } finally {
    toolLoading.value = false
  }
}

// Handle delete tool
const handleDeleteTool = async (tool: ToolData) => {
  try {
    const response = await DeleteTool(wocode, tool.Ma_Tool)
    if (response?.IsSuccess) {
      const index = toolData.value.findIndex(item => item.Ma_Tool === tool.Ma_Tool)
      if (index > -1) {
        toolData.value.splice(index, 1)
      }
      showNotification.value = true
    } else {
      showNotification.value = true
    }
  } catch (error) {
    console.error('Error deleting tool:', error)
    showNotification.value = true
  }
}

// Handler for công việc khác tick update (CVK2)
const handleCongViecKhacTickUpdate = async (checked: boolean) => {
  congViecKhacChecked.value = checked
  try {
    const istick = checked ? '+' : '-'
    const response = await UpdateTichCVK(wocode, congViecKhacLine.value, istick, congViecKhacType.value)
    if (response?.IsSuccess) {
      notificationMessage.value = 'Cập nhật thành công!'
      showNotification.value = true
    } else {
      notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
      showNotification.value = true
    }
  } catch (error) {
    console.error('Error updating công việc khác tick:', error)
    notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
    showNotification.value = true
  }
}

// Handler for công việc khác text update (CVK2)
const handleCongViecKhacTextUpdate = async (text: string) => {
  congViecKhacText.value = text
  try {
    await UpdateCVK2(wocode, 1, text)
    showNotification.value = true
  } catch (error) {
    console.error('Error updating công việc khác text:', error)
  }
}

// Fetch công việc khác từ API (CVK2)
const fetchCongViecKhac = async () => {
  try {
    const response = await GetCVK2(wocode)
    if (response?.IsSuccess && response.Data && response.Data.length > 0) {
      const firstItem = response.Data[0]
      congViecKhacText.value = firstItem.ND_CONTENT || ''
      congViecKhacChecked.value = (firstItem.ND_ISTICK || '+') === '+'
      congViecKhacLine.value = firstItem.ND_Line || 0
      congViecKhacType.value = firstItem.ND_TYPE || 'CVK2_PH1'
    }
  } catch (err) {
    console.error('Error fetching công việc khác CVK2:', err)
  }
}

// Fetch NdSau data (Section 6)
const fetchNdSau = async () => {
  try {
    const response: NdTruocResponse = await GetNdSau(wocode)
    if (response?.IsSuccess) {
      ndSauData.value = response.Data
    }
  } catch (err) {
    console.error('Error fetching NdSau:', err)
  }
}

// Handler for Section 6 CheckboxList events
const handleSauTick = async (item: NdTruocItem) => {
  try {
    const newIstick = item.ND_ISTICK === '+' ? '-' : '+'
    const response = await TichNdSau(wocode, item.ND_Line, newIstick)
    item.ND_ISTICK = newIstick
    showNotification.value = true
  } catch (error) {
    console.error('Error updating tick status Section 6:', error)
    showNotification.value = true
  }
}

// Handler for nội dung sau bảo dưỡng tick update (CVK6)
const handleNdSauTickUpdate = async (checked: boolean) => {
  ndSauChecked.value = checked
  try {
    const istick = checked ? '+' : '-'
    const response = await UpdateTichCVK(wocode, ndSauLine.value, istick, ndSauType.value)
    if (response?.IsSuccess) {
      notificationMessage.value = 'Cập nhật thành công!'
      showNotification.value = true
    } else {
      notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
      showNotification.value = true
    }
  } catch (error) {
    console.error('Error updating nội dung sau bảo dưỡng tick:', error)
    notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
    showNotification.value = true
  }
}

// Handler for nội dung sau bảo dưỡng text update (CVK6)
const handleNdSauTextUpdate = async (text: string) => {
  ndSauText.value = text
  try {
    await NoteCVK6(wocode, text)
    showNotification.value = true
  } catch (error) {
    console.error('Error updating nội dung sau bảo dưỡng text:', error)
  }
}

// Fetch công việc khác mục 6 from API (CVK6)
const fetchCongViecKhac6 = async () => {
  try {
    const response = await GetCVK6(wocode)
    if (response?.IsSuccess && response.Data && response.Data.length > 0) {
      const firstItem = response.Data[0]
      ndSauText.value = firstItem.ND_CONTENT || ''
      ndSauChecked.value = firstItem.ND_ISTICK === '+'
      ndSauLine.value = firstItem.ND_Line || 0
      ndSauType.value = firstItem.ND_TYPE || 'CVK6_PH1'
    }
  } catch (error) {
    console.error('Error fetching congViecKhac6:', error)
  }
}

// Fetch NdBaoDuong data (mục 4)
const fetchNdBaoDuong = async () => {
  try {
    const response: NdTruocResponse = await GetNdBaoDuong(wocode)
    if (response?.IsSuccess) {
      ndBaoDuongData.value = response.Data
    }
  } catch (err) {
    console.error('Error fetching NdBaoDuong:', err)
  }
}

// Handler for CheckboxList (mục 4 - bảo dưỡng)
const handleBaoDuongTick = async (item: NdTruocItem) => {
  try {
    const newIstick = item.ND_ISTICK === '+' ? '-' : '+'
    const response = await UpdateTichBaoDuongND(wocode, item.ND_Line, newIstick)
    item.ND_ISTICK = newIstick
    showNotification.value = true
  } catch (error) {
    console.error('Error updating bảo dưỡng tick status:', error)
    showNotification.value = true
  }
}

// Handler for nội dung bảo dưỡng tick update (mục 4 - CVK4)
const handleNdBaoDuongTickUpdate = async (checked: boolean) => {
  ndBaoDuongChecked.value = checked
  try {
    const istick = checked ? '+' : '-'
    const response = await UpdateTichCVK(wocode, ndBaoDuongLine.value, istick, ndBaoDuongType.value)
    if (response?.IsSuccess) {
      notificationMessage.value = 'Cập nhật thành công!'
      showNotification.value = true
    } else {
      notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
      showNotification.value = true
    }
  } catch (error) {
    console.error('Error updating nội dung bảo dưỡng tick:', error)
    notificationMessage.value = 'Có lỗi xảy ra khi cập nhật!'
    showNotification.value = true
  }
}

// Handler for nội dung bảo dưỡng text update (mục 4 - CVK4)
const handleNdBaoDuongTextUpdate = async (text: string) => {
  ndBaoDuongText.value = text
  try {
    await NoteCVK4(wocode, text)
    showNotification.value = true
  } catch (error) {
    console.error('Error updating nội dung bảo dưỡng text:', error)
  }
}

// Fetch công việc khác mục 4 từ API (CVK4)
const fetchCongViecKhac4 = async () => {
  try {
    const response = await GetCVK4(wocode)
    if (response?.IsSuccess && response.Data && response.Data.length > 0) {
      const firstItem = response.Data[0]
      ndBaoDuongText.value = firstItem.ND_CONTENT || ''
      ndBaoDuongChecked.value = firstItem.ND_ISTICK === '+'
      ndBaoDuongLine.value = firstItem.ND_Line || 0
      ndBaoDuongType.value = firstItem.ND_TYPE || 'CVK4_PH1'
    }
  } catch (error) {
    console.error('Error fetching congViecKhac4:', error)
  }
}

</script>


<style scoped>
.disabled-table {
  pointer-events: none;
  opacity: 0.6;
}

.cursor-pointer {
  cursor: pointer;
}

.pointer-events-none {
  pointer-events: none;
}

.export-pdf-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.2s ease-in-out !important;
  font-weight: 600 !important;
  padding: 0 48px !important;
  height: 48px !important;
  min-width: 200px !important;
}

.export-pdf-btn:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}

.export-pdf-btn:active {
  transform: translateY(0) !important;
}

.section-5-container,
.section-5-group,
.section-5-table-wrap {
  overflow: visible !important;
  max-height: none !important;
  height: auto !important;
}
</style>


<template>
  <div class="min-h-screen w-full overflow-visible" style="font-family: 'Times New Roman', Times, serif !important">
    <!-- Loading -->
    <Loading :spinning="pending" fullscreen />

    <ErrorView v-if="!pending && error" :message="error" />

    <div v-else-if="!pending && data" class="bg-white mx-auto">
      <div class="w-[97%] border-2 border-black mx-auto">
        <HeaderPermission
          :data="data"
          :wocode="wocode"
          :disabled="isFormDisabled"
          :dynamic-header-lines="dynamicHeaderTitleLines"
          @updated="refreshFirstForm"
        />
         <CheckboxList 
          title="2. Kiểm tra trước khi thực hiện / Проверка перед выполнением"
          :data="ndTruocData"
          @toggle-item="handleToggleItem"
          :showCongViecKhac="true"
          :congViecKhacChecked="congViecKhacChecked"
          :congViecKhacText="congViecKhacText"
          :isFormDisabled="isFormDisabled"
          :wocode="wocode"
          @update-cong-viec-khac-tick="handleCongViecKhacTickUpdate"
          @update-cong-viec-khac-text="handleCongViecKhacTextUpdate"
        />

        
        <!-- Section 3: Danh mục thiết bị -->
        <ToolEquipmentTable 
          :tool-data="toolData"
          :tool-loading="toolLoading"
          @open-tool-modal="openToolModal"
          @delete-tool-item="handleDeleteTool"
        />

        <!-- Section 4: Nội dung bảo dưỡng -->
        <CheckboxList 
          title="4.Bảo dưỡng hệ thống và thiết bị / Содержание ППР"
          :data="ndBaoDuongData"
          @toggle-item="handleBaoDuongTick"
          :showCongViecKhac="true"
          :congViecKhacChecked="ndBaoDuongChecked"
          :congViecKhacText="ndBaoDuongText"
          :isFormDisabled="false"
          :wocode="wocode"
          @update-cong-viec-khac-tick="handleNdBaoDuongTickUpdate"
          @update-cong-viec-khac-text="handleNdBaoDuongTextUpdate"
        />
        <div class="font-black bg-blue-200 pl-4 py-3 border border-[#2863c2] rounded-sm shadow-sm mt-2">
          5. Kết quả kiểm tra trạng thái làm việc của các thiết bị/ Результаты проверки приборов
        </div>
        <div class="section-5-container border border-[#2863c2] rounded-sm shadow-sm mt-2 p-3 space-y-4">
          <div v-if="designerLoading" class="text-sm text-slate-600">Đang tải dữ liệu thiết kế theo WO...</div>
          <div v-else-if="designerError" class="text-sm text-sky-700">{{ designerError }}</div>
          <div v-else-if="!designerGroups.length" class="text-sm text-slate-600">
            There are no records to display.
          </div>
          <div v-else class="space-y-4">
            <section
              v-for="group in designerGroups"
              :key="group.type"
              class="section-5-group rounded border border-slate-300 bg-white"
            >
              
              <div class="section-5-table-wrap overflow-visible">
                <table class="min-w-full border-collapse table-fixed">
                  <colgroup v-if="getGroupLeafColumns(group).length">
                    <col
                      v-for="leaf in getGroupLeafColumns(group)"
                      :key="`${group.type}-col-${leaf.headerId}-${leaf.displayOrder}`"
                      :style="getGroupLeafWidthStyle(group, leaf)"
                    />
                  </colgroup>
                  <thead>
                    <tr
                      v-for="(parent, pIndex) in (group.template?.headerParents?.length ? group.template?.headerParents : [{ text: group.type }])"
                      :key="`${group.type}-parent-${pIndex}`"
                    >
                      <th
                        class="border border-slate-300 bg-slate-100 px-2 py-2 text-sm font-semibold"
                        :class="getAlignClass(getHeaderParentAlign(parent))"
                        :colspan="Math.max(getGroupLeafColumns(group).length, 1)"
                      >
                        {{ parent?.text || group.type }}
                      </th>
                    </tr>
                    <tr
                      v-for="(row, rowIndex) in buildHeaderPreviewRows(group.template?.headerChildren || [])"
                      :key="`${group.type}-header-row-${rowIndex}`"
                    >
                      <th
                        v-for="cell in row"
                        :key="`${group.type}-cell-${cell.node.headerId}-${cell.node.displayOrder}`"
                        class="border border-slate-300 bg-white px-2 py-2 text-xs font-semibold text-slate-800"
                        :class="getAlignClass(cell.node.align)"
                        :colspan="cell.colspan"
                        :rowspan="cell.rowspan"
                        :style="getHeaderCellStyle(group, cell.node)"
                      >
                        {{ cell.node.text }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!group.items?.length">
                      <td
                        class="border border-slate-300 px-2 py-3 text-center text-xs text-slate-500"
                        :colspan="Math.max(getGroupLeafColumns(group).length, 1)"
                      >
                        There are no records to display.
                      </td>
                    </tr>
                    <tr v-for="(item, itemIndex) in group.items" :key="`${group.type}-item-${itemIndex}`">
                      <td
                        v-for="leaf in getGroupLeafColumns(group)"
                        :key="`${group.type}-${itemIndex}-${leaf.headerId}-${leaf.displayOrder}`"
                        class="border border-slate-300 px-2 py-1 text-xs text-slate-800"
                        :class="getAlignClass(getValueAlign(group, leaf))"
                        :style="getValueCellStyle(group, leaf)"
                      >
                        <template v-if="getCellEditorType(group, leaf) === 'readonly'">
                          <span
                            class="flex min-h-[32px] w-full items-center truncate px-1"
                            :class="getJustifyClass(getValueAlign(group, leaf))"
                          >
                            {{ getItemValueBySourceField(item, leaf.sourceField) }}
                          </span>
                        </template>
                        <template v-if="getCellEditorType(group, leaf) === 'option'">
                          <div
                            class="relative w-full"
                            tabindex="0"
                            @focusout="handleRowBlur($event, group, item)"
                          >
                            <details
                              class="group w-full"
                              :ref="(el) => bindOptionDetailsRef(el, group, itemIndex, leaf)"
                              @toggle="handleOptionDropdownToggle($event, group, itemIndex, leaf)"
                            >
                              <summary
                                class="block min-h-[32px] w-full cursor-pointer list-none rounded border bg-white px-1.5 py-1 text-xs text-slate-700 outline-none transition group-open:ring-1 group-open:ring-sky-300"
                                :style="{ textAlign: getValueAlign(group, leaf) }"
                                :title="getSelectedOptionDisplayList(group, item, leaf).join(', ')"
                              >
                                <div class="w-full">
                                  <div
                                    v-if="!getSelectedOptionDisplayList(group, item, leaf).length"
                                    class="flex min-h-[22px] w-full items-center px-1 py-0.5"
                                    :class="getJustifyClass(getValueAlign(group, leaf))"
                                  >
                                    
                                  </div>
                                  <div
                                    v-else
                                    class="flex min-h-[22px] w-full flex-wrap items-start gap-1 px-0.5 py-0.5"
                                    :class="getJustifyClass(getValueAlign(group, leaf))"
                                  >
                                    <div
                                      v-for="selected in getSelectedOptionDisplayList(group, item, leaf)"
                                      :key="`${leaf.sourceField}-selected-${selected}`"
                                      class="inline-flex min-w-0 max-w-full items-center gap-1 rounded border border-slate-300 bg-slate-50 px-1 py-0.5 text-[11px] leading-4"
                                    >
                                      <span class="break-all">{{ selected }}</span>
                                      <button
                                        type="button"
                                        class="rounded px-1 text-[10px] text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                                        @click="removeSelectedOptionTag($event, group, item, leaf, selected)"
                                      >
                                        x
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </summary>
                              <div
                                class="absolute left-0 right-0 z-[9999] w-full min-w-full overflow-visible rounded border border-slate-300 bg-white p-1 shadow-lg"
                                :class="getOptionDropdownPositionClass(group, itemIndex, leaf)"
                              >
                                <button
                                  v-for="opt in getOptionValuesForLeaf(group, leaf)"
                                  :key="`${leaf.sourceField}-${opt}`"
                                  type="button"
                                  class="flex w-full items-center gap-2 rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                                  @click.prevent="toggleOptionByClick(group, item, leaf, opt)"
                                >
                                  <span class="min-w-0 flex-1 truncate" :class="getAlignClass(getValueAlign(group, leaf))">{{ opt }}</span>
                                  <span v-if="isOptionSelected(item, leaf, opt)" class="text-blue-600">✓</span>
                                </button>
                                <p v-if="!getOptionValuesForLeaf(group, leaf).length" class="px-1 py-1 text-[11px] text-slate-500">
                                  No Data
                                </p>
                              </div>
                            </details>
                          </div>
                        </template>
                        <template v-else-if="getCellEditorType(group, leaf) !== 'readonly'">
                          <input
                            :type="getCellEditorType(group, leaf) === 'number' ? 'number' : 'text'"
                            class="min-h-[32px] w-full rounded border border-slate-300 px-1 py-0 text-xs outline-none focus:border-blue-600"
                            :style="{ textAlign: getValueAlign(group, leaf) }"
                            :value="getItemValueBySourceField(item, leaf.sourceField)"
                            @input="handleTextCellInput($event, item, leaf)"
                            @blur="handleRowBlur($event, group, item)"
                          />
                        </template>
                      </td>
                      <td
                        v-if="!getGroupLeafColumns(group).length"
                        class="border border-slate-300 px-2 py-1 text-xs text-slate-500"
                      >
                        There are no records to display.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
        <!-- Section 6: Nội dung sau bảo dưỡng -->
        <CheckboxList 
          title="6.Kiểm tra sau khi bảo dưỡng / Проверка состояния оборудования после ППР"
          :data="ndSauData"
          @toggle-item="handleSauTick"
          :showCongViecKhac="true"
          :congViecKhacChecked="ndSauChecked"
          :congViecKhacText="ndSauText"
          :isFormDisabled="isFormDisabled"
          :wocode="wocode"
          @update-cong-viec-khac-tick="handleNdSauTickUpdate"
          @update-cong-viec-khac-text="handleNdSauTextUpdate"
        />

        <!-- Section 7: Tình trạng thiết bị sau bảo dưỡng -->
        <TinhTrangThietBiSauBaoDuong 
          :wocode="wocode"
          :initial-tinh-trang-thiet-bi="tinhTrangThietBi"
          :initial-tong-thoi-gian="tongThoiGian"
          :initial-nhan-luc="nhanLuc"
          :disabled="isFormDisabled"
          @notification="handleNotificationFromComponent"
          @update:tinhTrangThietBi="tinhTrangThietBi = $event"
          @update:tongThoiGian="tongThoiGian = $event"
          @update:nhanLuc="nhanLuc = $event"
        />

        <!-- Mục 8: Vật tư tiêu hao (WO) -->
        <VatTuTieuHaoWO 
          :org="data?.gian || ''"
          :wo="data?.evt_code || wocode"
          :disabled="isFormDisabled"
          :woequipment="data?.matbi || ''"
          :gian="data?.gian || ''"
        />

        <!-- Mục 9 & 10: Ghi chú và WO Person Table -->
        <GhiChuWOPersonTable
          :wocode="wocode"
          :initialGhiChu="data?.Ghichu || undefined"
          :gian="data?.gian"
          :bophan="data?.bophan"
          :disabled="isFormDisabled"
          @notification="handleNotificationFromComponent"
        />
      </div>
    </div>
  </div>
  
  <!-- Export PDF Button -->
  <div class="mt-6 flex justify-center">
    <button 
      @click="handleExportPdf"
      :disabled="isExporting || !data?.evt_code || !data?.matbi"
      class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
    >
      <svg v-if="isExporting" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      {{ isExporting ? 'Đang xuất PDF...' : 'Xuất PDF' }}
    </button>
  </div>

  <!-- Notification Toast -->
  <NotificationToast 
      :show="showNotification"
      :message="notificationMessage"
      :duration="1000"
      @hide="handleNotificationHide"
    />

  <!-- Tool Selection Modal -->
  <ToolSelectionModal
    :visible="showToolModal"
    :gian="data?.gian"
    :bophan="data?.bophan"
    @update:visible="showToolModal = $event"
    @tool-added="handleToolAdded"
  />
</template>
