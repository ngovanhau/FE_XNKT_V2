

// OpenForm Types
export interface OpenFormItem {
  NO: number
  NAME: string
  KEYTYPE: string
  KEYVALUE: string
  URL: string
}

export interface OpenFormCreateRequest {
  NO: number
  NAME: string
  KEYTYPE: string
  KEYVALUE: string
  URL: string
}

export interface OpenFormUpdateRequest {
  NO: number
  NAME: string
  KEYTYPE: string
  KEYVALUE: string
  URL: string
}

export interface OpenFormResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: OpenFormItem[]
}

export interface OpenFormPagedData {
  Items: OpenFormItem[]
  TotalCount: number
}

export interface OpenFormPagedResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: OpenFormItem[] | OpenFormPagedData
  Message?: string
}

export interface OpenFormSingleResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: OpenFormItem
}

export interface OpenFormDeleteResponse {
  HttpStatus: number
  IsSuccess: boolean
  Message?: string
  Data?: unknown
}


export const GetAllOpenForms = async (
  page: number = 1,
  pagesize: number = 10,
  keyword?: string
): Promise<OpenFormPagedResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get<OpenFormPagedResponse>(`OpenForm/GetAll`, {
      params: {
        page,
        pagesize,
        ...(keyword ? { keyword } : {})
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching OpenForms:', error)
    throw error
  }
}

// Create new OpenForm
export const CreateOpenForm = async (data: OpenFormCreateRequest): Promise<OpenFormSingleResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.post<OpenFormSingleResponse>(`OpenForm/Create`, data)
    return response.data
  } catch (error) {
    console.error('Error creating OpenForm:', error)
    throw error
  }
}

// Update OpenForm
export const UpdateOpenForm = async (data: OpenFormUpdateRequest): Promise<OpenFormSingleResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put<OpenFormSingleResponse>(`OpenForm/Update`, data)
    return response.data
  } catch (error) {
    console.error('Error updating OpenForm:', error)
    throw error
  }
}

// Delete OpenForm
export const DeleteOpenForm = async (no: number): Promise<OpenFormDeleteResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.delete<OpenFormDeleteResponse>(`OpenForm/Delete?NO=${no}`)
    return response.data
  } catch (error) {
    console.error('Error deleting OpenForm:', error)
    throw error
  }
}
