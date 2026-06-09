
// External endpoint: NguoiChoPhep by org (paging via startrow: 1, 51, 101, ...)
export const GetNguoiChoPhep = async (org: string, startrow: number = 1): Promise<NguoiChoPhepResponse> => {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get('Part/NguoiChoPhep', {
      params: { org, startrow },
      __skipWoInject: true
    } as any)
    return response.data as NguoiChoPhepResponse
  } catch (error) {
    console.error('Error fetching NguoiChoPhep:', error)
    throw error
  }
}

// Get persons list
export const GetPersonList = async (query: any) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.get('/Person/GetPerson', {
      params: query
    })
    return response.data
  } catch (error) {
    console.error('Error fetching persons:', error)
    throw error
  }
}

// Update người cho phép
export const UpdateNguoiChoPhep = async (wo: string, nguoiChoPhep: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.put(`/Person/UpdateNguoiChoPhep?wo=${wo}&nguoiChoPhep=${nguoiChoPhep}`)
    return response.data
  } catch (error) {
    console.error('Error updating người cho phép:', error)
    throw error
  }
}

// Load person data for TO-1
export const LoadPersonV2 = async (wo: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.get(`/TablePerson/LoadPersonV2?wo=${wo}`)
    return response.data
  } catch (error) {
    console.error('Error loading person data:', error)
    throw error
  }
}

// Get person select list
export const GetPersonSelectList = async (gian: string, bophan: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.get(`/TablePerson/GetListSelect?gian=${gian}&bophan=${bophan}`)
    return response.data
  } catch (error) {
    console.error('Error getting person select list:', error)
    throw error
  }
}


// Update person with truongnhombaoduong for TO-1
export const UpdatePersonWithTruongNhom = async (woCode: string, truongnhombaoduong: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.put(`/TablePerson/UpdateV2?woCode=${woCode}&truongnhombaoduong=${truongnhombaoduong}`)
    return response.data
  } catch (error) {
    console.error('Error updating person with truong nhom:', error)
    throw error
  }
}

// Update person with VHTB
export const UpdatePersonWithVHTB = async (woCode: string, VHTB: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.put(`/TablePerson/UpdateV2?woCode=${woCode}&VHTB=${VHTB}`)
    return response.data
  } catch (error) {
    console.error('Error updating person with VHTB:', error)
    throw error
  }
}

// Update person with BDTB
export const UpdatePersonWithBDTB = async (woCode: string, BDTB: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.put(`/TablePerson/UpdateV2?woCode=${woCode}&BDTB=${BDTB}`)
    return response.data
  } catch (error) {
    console.error('Error updating person with BDTB:', error)
    throw error
  }
}

// Update person with truongcongtrinh
export const UpdatePersonWithTruongCongTrinh = async (woCode: string, truongcongtrinh: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.put(`/TablePerson/UpdateV2?woCode=${woCode}&truongcongtrinh=${truongcongtrinh}`)
    return response.data
  } catch (error) {
    console.error('Error updating person with truongcongtrinh:', error)
    throw error
  }
}

// Get Trưởng công trình list
export const GetTruongCongTrinh = async (gian: string, bophan: string) => {
  const { $axios } = useNuxtApp()
  
  try {
    const response = await $axios.get(`Person/GetPerson?gian=${gian}&bophan=${bophan}`)
    return response.data
  } catch (error) {
    console.error('Error getting Trưởng công trình list:', error)
    throw error
  }
}

export interface NguoiChoPhepItem {
  id: string
  schedgroup?: string
  schedgroupdesc?: string
  userdefinedfieldvalue?: string
  description?: string
  JobTitle?: string
}

export interface NguoiChoPhepResponse {
  message: string
  data: NguoiChoPhepItem[]
}

// Types for GetWODataListORA API
export interface WOPersonData {
  idRow: number
  ViTri: string
  MaPer: string
  HoTen: string
  ChucDanh: string
  ChuKy: string | null
  Ngay: string | null
  status: number
}

export interface GetWODataListORAResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: WOPersonData[]
}

// Types for GetListSelect API
export interface PersonSelectData {
  per_code: string
  per_desc: string
  per_jobtitle: string | null
  per_trade: string
  per_udfchkbox01: string
}

export interface GetListSelectResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: PersonSelectData[]
}
