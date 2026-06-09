export interface ToolData {
  Ma_Tool: string
  Ten_TB: string
  Nha_SX: string
  So_Seri: string
  Ma_Ky_Hieu: string | null
  Hang_Kiem_Dinh: string
}

export interface ToolResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: ToolData[]
}

export async function GetToolByWO(wo: string): Promise<ToolResponse> {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`Tool/GetToolByWO`, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function AddTool(wo: string, toolData: ToolData) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.post(`Tool/AddTool`, {
      Ma_Tool: toolData.Ma_Tool,
      Ten_TB: toolData.Ten_TB,
      Ma_Ky_Hieu: toolData.Ma_Ky_Hieu,
      So_Seri: toolData.So_Seri,
      Nha_SX: toolData.Nha_SX,
      Hang_Kiem_Dinh: toolData.Hang_Kiem_Dinh
    }, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function DeleteTool(wo: string, ma_Tool: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.delete(`Tool/DeleteTool`, {
      params: { wo, ma_Tool }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

interface GetToolsPagedParams {
  currentPage: number
  pageSize: number
  gian: string
  search?: string
  bophan?: string
}

interface GetToolsPagedResponse {
  IsSuccess: boolean
  Data: ToolData[]
  TotalCount?: number
  Message?: string
}

/**
 * Lấy danh sách tools có phân trang
 * @param params - Tham số cho API GetToolsPaged
 * @returns Promise<GetToolsPagedResponse>
 */
export const GetToolsPaged = async (params: GetToolsPagedParams): Promise<GetToolsPagedResponse> => {
  try {
    const { $axios } = useNuxtApp()
    
    const response = await $axios.get('Tool/GetToolsPaged', {
      params: {
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        gian: params.gian,
        ...(params.search && { search: params.search }),
        ...(params.bophan && { bophan: params.bophan })
      }
    })
    
    return response.data as GetToolsPagedResponse
  } catch (error) {
    console.error('Error in GetToolsPaged API:', error)
    throw error
  }
}

/**
 * Tìm kiếm tools theo từ khóa
 * @param searchText - Từ khóa tìm kiếm
 * @param currentPage - Trang hiện tại
 * @param pageSize - Số lượng items per page
 * @param gian - Giàn
 * @returns Promise<GetToolsPagedResponse>
 */
export const SearchTools = async (
  searchText: string,
  currentPage: number = 1,
  pageSize: number = 10,
  gian: string 
): Promise<GetToolsPagedResponse> => {
  return GetToolsPaged({
    currentPage,
    pageSize,
    gian,
    search: searchText
  })
}

/**
 * Lấy danh sách tất cả tools không phân trang
 * @param gian - Giàn
 * @returns Promise<GetToolsPagedResponse>
 */
export const GetAllTools = async (gian: string ): Promise<GetToolsPagedResponse> => {
  return GetToolsPaged({
    currentPage: 1,
    pageSize: 1000, // Lấy nhiều để có tất cả
    gian
  })
}
