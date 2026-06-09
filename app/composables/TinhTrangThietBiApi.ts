export const UpdateWoInfoTinhTrangTbiR5 = async (wo: string, number: number) => {
  
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put('TTTB/UpdateTTTB', null, {
      params: { wo, number }
    })
    return response.data
  } catch (error) {
    console.error('Error calling UpdateWoInfoTinhTrangTbiR5:', error)
    throw error
  }
}


export const GetTGNL = async (wo: string): Promise<TGNLGetResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const res = await $axios.get('U5TGNL/GetTGNL', { params: { wo } })
    return res.data as TGNLGetResponse
  } catch (error) {
    console.error('Error in GetTGNL:', error)
    throw error
  }
}

export const UpdateTGNL = async (payload: TGNLItem): Promise<TGNLUpdateResponse> => {
  try {
    const { $axios } = useNuxtApp()
    const res = await $axios.put('U5TGNL/UpdateTGNL', payload)
    return res.data as TGNLUpdateResponse
  } catch (error) {
    console.error('Error in UpdateTGNL:', error)
    throw error
  }
}

export interface TGNLItem {
  WO_CODE: string
  udf1?: string
  udf2?: string
}

export interface TGNLGetResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: TGNLItem[]
}

export interface TGNLUpdateResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: string // "SUCCESS"
}

