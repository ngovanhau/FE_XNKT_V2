export interface DynamicFormHeaderItem {
  headerId: number
  mrcCode: string
  text: string
  displayOrder: number
  style: Record<string, unknown> | null
}

export interface DynamicFormHeaderDepartment {
  mrcCode: string
  mrcDesc: string
}

export interface DynamicFormHeaderPayload {
  text: string
  displayOrder?: number | null
  style?: Record<string, unknown> | null
}

interface ApiWrapper<T> {
  success?: boolean
  statusCode?: number
  message?: string
  data?: T
  Data?: T
}

const normalizeHeaderItem = (row: any): DynamicFormHeaderItem => ({
  headerId: Number(row?.headerId ?? row?.HeaderId ?? 0),
  mrcCode: String(row?.mrcCode ?? row?.MrcCode ?? row?.MRCCODE ?? '').trim().toUpperCase(),
  text: String(row?.text ?? row?.Text ?? '').trim(),
  displayOrder: Number(row?.displayOrder ?? row?.DisplayOrder ?? 0),
  style: row?.style ?? row?.Style ?? null
})

const normalizeDepartmentItem = (row: any): DynamicFormHeaderDepartment => ({
  mrcCode: String(row?.mrcCode ?? row?.MrcCode ?? row?.MRC_CODE ?? '').trim().toUpperCase(),
  mrcDesc: String(row?.mrcDesc ?? row?.MrcDesc ?? row?.MRC_DESC ?? '').trim()
})

const normalizeListResponse = (response: any): DynamicFormHeaderItem[] => {
  const wrapper = response as ApiWrapper<any[]>
  const rows = wrapper?.data ?? wrapper?.Data ?? []
  if (!Array.isArray(rows)) return []
  return rows
    .map(normalizeHeaderItem)
    .filter(item => item.headerId > 0 && item.mrcCode)
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
}

const normalizeDepartmentListResponse = (response: any): DynamicFormHeaderDepartment[] => {
  const wrapper = response as ApiWrapper<any[]>
  const rows = wrapper?.data ?? wrapper?.Data ?? []
  if (!Array.isArray(rows)) return []
  return rows
    .map(normalizeDepartmentItem)
    .filter(item => item.mrcCode)
}

const normalizeMrcCode = (mrcCode: string) => mrcCode.trim().toUpperCase()
const noCacheHeaders = {
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
}

const buildNoCacheParams = (extra?: Record<string, unknown>) => ({
  ...(extra || {}),
  _: Date.now()
})

export const GetDynamicFormHeaderDepartments = async (search?: string): Promise<DynamicFormHeaderDepartment[]> => {
  const { $axios } = useNuxtApp()
  const trimmedSearch = String(search || '').trim()
  const response = await $axios.get('dynamic-form-headers/departments', {
    headers: noCacheHeaders,
    params: buildNoCacheParams(trimmedSearch ? { search: trimmedSearch } : {})
  })
  return normalizeDepartmentListResponse(response.data)
}

export const GetDynamicFormHeaders = async (mrcCode: string): Promise<DynamicFormHeaderItem[]> => {
  const { $axios } = useNuxtApp()
  const code = normalizeMrcCode(mrcCode)
  const response = await $axios.get(`dynamic-form-headers/${encodeURIComponent(code)}`, {
    headers: noCacheHeaders,
    params: buildNoCacheParams()
  })
  return normalizeListResponse(response.data)
}

export const CreateDynamicFormHeader = async (
  mrcCode: string,
  payload: DynamicFormHeaderPayload
): Promise<DynamicFormHeaderItem[]> => {
  const { $axios } = useNuxtApp()
  const code = normalizeMrcCode(mrcCode)
  const response = await $axios.post(`dynamic-form-headers/${encodeURIComponent(code)}`, payload)
  return normalizeListResponse(response.data)
}

export const UpdateDynamicFormHeader = async (
  mrcCode: string,
  headerId: number,
  payload: DynamicFormHeaderPayload
): Promise<DynamicFormHeaderItem[]> => {
  const { $axios } = useNuxtApp()
  const code = normalizeMrcCode(mrcCode)
  const response = await $axios.put(`dynamic-form-headers/${encodeURIComponent(code)}/${headerId}`, payload)
  return normalizeListResponse(response.data)
}

export const DeleteDynamicFormHeader = async (
  mrcCode: string,
  headerId: number
): Promise<DynamicFormHeaderItem[]> => {
  const { $axios } = useNuxtApp()
  const code = normalizeMrcCode(mrcCode)
  const response = await $axios.delete(`dynamic-form-headers/${encodeURIComponent(code)}/${headerId}`)
  return normalizeListResponse(response.data)
}
