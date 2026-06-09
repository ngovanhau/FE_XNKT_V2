export interface TTLVTBItem {
  NO: number
  WO_CODE: string
  TAGNAME: string
  DESCRIPTION: string
  TYPE: string
  udf1: string
  udf2: string
  udf3: string
  udf4: string
  udf5: string
  udf6: string
  udf7: string
  udf8: string
  udf9: string
  udf10: string
  udf11: string
  udf12: string
  udf13: string
  udf14: string
  udf15: string
}

export interface TTLVTBResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: TTLVTBItem[]
  Message?: string
}

export interface TTLVTBUpdateRequest {
  NO: number
  WO_CODE: string
  TYPE: string
  udf1: string
  udf2: string
  udf3: string
  udf4: string
  udf5: string
  udf6: string
  udf7: string
  udf8: string
  udf9: string
  udf10: string
  udf11: string
  udf12: string
  udf13: string
  udf14: string
  udf15: string
}

export interface TTLVTBUpdateResponse {
  HttpStatus: number
  IsSuccess: boolean
  Message?: string
}

export interface TTLVTBCreateRequest {
  WO_CODE: string
  TYPE: string
  udf1: string
  udf2: string
  udf3: string
  udf4: string
  udf5: string
  udf6: string
  udf7: string
  udf8: string
  udf9: string
  udf10: string
  udf11: string
  udf12: string
  udf13: string
  udf14: string
  udf15: string
}

export interface TTLVTBCreateResponse {
  HttpStatus: number
  IsSuccess: boolean
  Message?: string
}

export interface DesignerTemplateNode {
  headerId: number | null
  text: string
  sourceField: string | null
  width: number | null
  align: 'left' | 'center' | 'right' | null
  displayOrder: number
  style?: Record<string, unknown> | null
  valueStyle?: Record<string, unknown> | null
  dataType?: 'text' | 'number' | 'option' | string | null
  optionalType?: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
  inputType?: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | string | null
  children: DesignerTemplateNode[]
}

export interface DesignerTemplateParent {
  text: string
  style?: Record<string, unknown> | null
}

export interface DesignerTemplate {
  templateId: number
  categoryCode: string
  templateName: string
  headerParents: DesignerTemplateParent[]
  tableStyle?: Record<string, unknown> | null
  rowStyle?: Record<string, unknown> | null
  headerChildren: DesignerTemplateNode[]
}

export interface TTLVTBDesignerGroup {
  type: string
  deviceCount: number
  items: Record<string, unknown>[]
  template: DesignerTemplate | null
  udfFieldConfigs?: TTLVTBUdfFieldConfig[]
  fieldStyles?: TTLVTBFieldStyleConfig[]
}

export interface TTLVTBUdfFieldConfig {
  sourceField: string
  headerText: string
  dataType: 'text' | 'number' | 'option' | string
  optionalType: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
  inputType: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | string | null
}

export interface TTLVTBFieldStyleConfig {
  sourceField: string
  headerText?: string
  headerStyle?: Record<string, unknown> | null
  valueStyle?: Record<string, unknown> | null
  dataType?: 'text' | 'number' | 'option' | string | null
  inputType?: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | string | null
  optionalType?: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
}

export interface TTLVTBDesignerData {
  woCode: string
  matbi: string
  groups: TTLVTBDesignerGroup[]
}

export interface TTLVTBDesignerResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: TTLVTBDesignerData
  Message?: string
}

export interface TTLVTBUpdateRowResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data?: unknown
  Message?: string
}

// Get all TTLVTB by WO and type
export const GetAllTTLVTB = async (wocode: string, type: string): Promise<TTLVTBResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`TTLVTB/GetAll`, { params: { wo: wocode, type } })
    return response.data
  } catch (error) {
    console.error('Error fetching TTLVTB data:', error)
    throw error
  }
}

// Update TTLVTB
export const UpdateTTLVTB = async (data: TTLVTBUpdateRequest): Promise<TTLVTBUpdateResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put(`TTLVTB/Update`, data)
    return response.data
  } catch (error) {
    console.error('Error updating TTLVTB data:', error)
    throw error
  }
}

export const GetDesignerByWo = async (woCode: string): Promise<TTLVTBDesignerResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get(`TTLVTB/GetDesignerByWo`, {
      params: { woCode },
      __skipWoInject: true
    } as any)
    return response.data
  } catch (error) {
    console.error('Error fetching TTLVTB designer by WO:', error)
    throw error
  }
}

export const UpdateTTLVTBRow = async (payload: Record<string, unknown>): Promise<TTLVTBUpdateRowResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put(`TTLVTB/UpdateRow`, payload)
    return response.data
  } catch (error) {
    console.error('Error updating TTLVTB row:', error)
    throw error
  }
}

