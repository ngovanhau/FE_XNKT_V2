export  interface VatTuTieuHaoWOItem {
  id: string
  partcode: string
  partdescription: string
  storecode: string | null
  partuom: string
  usedqty: string
  workordernum?: string
  matlist_lineno?: string
  partorganization?: string
  woattachto?: string | null
}

export interface PartApiResult {
  success: boolean
  message: string
}

function toPartApiResult(
  response: any,
  defaultSuccessMessage: string,
  defaultFailMessage: string
): PartApiResult {
  const root = response?.data || {}
  const payload = root?.data || root?.Data || {}
  const success =
    payload?.Success === true ||
    payload?.IsSuccess === true ||
    root?.Success === true ||
    root?.IsSuccess === true ||
    payload === true ||
    root?.data === true
  const message =
    payload?.Message ||
    payload?.message ||
    root?.message ||
    root?.Message ||
    (success ? defaultSuccessMessage : defaultFailMessage)
  return { success, message }
}

function extractPartApiErrorMessage(error: any, fallback: string): string {
  const responseData = error?.response?.data || {}
  const payload = responseData?.data || responseData?.Data || {}
  return (
    payload?.Message ||
    payload?.message ||
    responseData?.message ||
    responseData?.Message ||
    fallback
  )
}

export async function getPartsByWO(org: string, wo: string): Promise<VatTuTieuHaoWOItem[]> {
  try {
    if (!wo) return []
    const { $axios } = useNuxtApp()
    const response = await $axios.get('/Part/GetAll', {
      params: { org: org || '', wo }
    })
    const data = response.data?.data
    const items: VatTuTieuHaoWOItem[] = Array.isArray(data)
      ? data.map((d: any) => ({
          id: String(d.id ?? ''),
          partcode: String(d.partcode ?? ''),
          partdescription: String(d.partdescription ?? ''),
          storecode: d.storecode ?? '',
          partuom: String(d.partuom ?? ''),
          usedqty: String(d.usedqty ?? d.plannedqty ?? ''),
          workordernum: String(d.workordernum ?? ''),
          matlist_lineno: String(d.matlist_lineno ?? ''),
          partorganization: String(d.partorganization ?? (org || '')),
          woattachto: d.woattachto ?? ''
        }))
      : []
    return items
  } catch (error) {
    console.error('Error getPartsByWO:', error)
    throw error
  }
}

export async function deletePartWO(params: {
  workordernum?: string
  matlist_lineno?: string
  organization?: string
  woequipment?: string | null
  longdescription?: string
  partcode?: string
  partdescription?: string
  plannedqty?: string
  partuom?: string
}): Promise<PartApiResult> {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.delete('/Part/Delete', {
      params: {
        workordernum: params.workordernum || '',
        matlist_lineno: params.matlist_lineno || '',
        organization: params.organization || '',
        woequipment: params.woequipment || '',
        longdescription: params.longdescription || '',
        partcode: params.partcode || '',
        partdescription: params.partdescription || '',
        plannedqty: params.plannedqty || '',
        partuom: params.partuom || ''
      }
    })
    return toPartApiResult(response, 'Xóa vật tư thành công!', 'Không thể xóa vật tư!')
  } catch (error) {
    console.error('Error deletePartWO:', error)
    return {
      success: false,
      message: extractPartApiErrorMessage(error, 'Lỗi khi gọi API xóa vật tư!')
    }
  }
}

export async function createPartWO(params: {
  workordernum: string
  org: string
  qty: string | number
  woequipment: string
  partcode: string
  partdescription: string
  partuom: string
}): Promise<PartApiResult> {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.post('/Part/Create', null, {
      params: {
        workordernum: params.workordernum,
        org: params.org,
        qty: String(params.qty),
        woequipment: params.woequipment,
        partcode: params.partcode,
        partdescription: params.partdescription,
        partuom: params.partuom
      }
    })
    return toPartApiResult(response, 'Thêm vật tư thành công!', 'Không thể thêm vật tư!')
  } catch (error) {
    console.error('Error createPartWO:', error)
    return {
      success: false,
      message: extractPartApiErrorMessage(error, 'Lỗi khi gọi API tạo vật tư!')
    }
  }
}

export async function updatePartIssue(params: {
  workordernum: string
  org: string
  qty: string | number
  woequipment: string
  partcode: string
}): Promise<PartApiResult> {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put('/Part/UpdateIssue', null, {
      params: {
        workordernum: params.workordernum,
        org: params.org,
        qty: String(params.qty),
        woequipment: params.woequipment,
        partcode: params.partcode
      }
    })
    return toPartApiResult(response, 'Cập nhật vật tư thành công!', 'Không thể cập nhật vật tư!')
  } catch (error) {
    console.error('Error updatePartIssue:', error)
    return {
      success: false,
      message: extractPartApiErrorMessage(error, 'Lỗi khi gọi API cấp thêm vật tư!')
    }
  }
}

export async function updatePartReturn(params: {
  workordernum: string
  org: string
  qty: string | number
  woequipment: string
  partcode: string
}): Promise<PartApiResult> {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put('/Part/UpdateReturn', null, {
      params: {
        workordernum: params.workordernum,
        org: params.org,
        qty: String(params.qty),
        woequipment: params.woequipment,
        partcode: params.partcode
      }
    })
    return toPartApiResult(response, 'Hoàn trả vật tư thành công!', 'Không thể hoàn trả vật tư!')
  } catch (error) {
    console.error('Error updatePartReturn:', error)
    return {
      success: false,
      message: extractPartApiErrorMessage(error, 'Lỗi khi gọi API hoàn trả vật tư!')
    }
  }
}

// type

export const GetVatTuTieuHaoByWO = async (wo: string): Promise<any> => {
  try {
    const { $axios } = useNuxtApp();
    const response = await $axios.get('/VatTuTieuHao/GetAll', {
      params: { wo }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching VatTuTieuHao:', error);
    throw error;
  }
};

export const GetAllPart = async (
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  gian?: string
): Promise<VatTuPartResponse> => {
  try {
    const { $axios } = useNuxtApp();
    const params: any = {
      page,
      pageSize
    };
    
    if (search) {
      params.search = search;
    }
    
    if (gian) {
      params.gian = gian;
    }
    
    const response = await $axios.get('/VTTH/GetAllPUPPart', {
       params
     });
     return response.data;
   } catch (error) {
     console.error('Error fetching VatTu parts:', error);
     throw error;
   }
 };

export const UpdatePart = async (
  gian: string,
  bophan: string,
  matb: string,
  wocode: string,
  data: UpdatePartItem[]
): Promise<UpdatePartResponse> => {
  try {
    const { $axios } = useNuxtApp();
    // Try sending array directly first
    console.log('API Request Body (direct array):', JSON.stringify(data, null, 2));
    
    const response = await $axios.put('/VatTuTieuHao/UpdatePart', data, {
      params: {
        gian,
        bophan,
        matb,
        wocode
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating VatTu parts:', error);
    throw error;
  }
};


export interface VatTuTieuHaoItem {
  idRow?: number
  status?: string
  par_note: string | null
  evt_code: string
  par_code: string
  calculated_column: string | number
  mlp_qty: string | number
  sto_store: string
  par_desc: string
  par_longdescription: string | null
  act_act: string | number
  STO_QTY: string | number
  bin_code: string
  par_uom: string
  act_note: string | null
  par_number: string | null
  par_location: string | null
  act_matlist: string | null
  oldUsedQty: string | number
  oldPlanedQty: string | number
}

export interface VatTuTieuHaoResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: VatTuTieuHaoItem[]
}

export interface VatTuPartItem {
  sto_store: string
  par_code: string
  par_desc: string
  par_longdescription: string | null
  STO_QTY: string
  BIS_BIN: string
  PAR_UOM: string
  total_rows: number
  total_pages: number
}

export interface VatTuPartResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: VatTuPartItem[]
}

export interface UpdatePartItem {
  idRow: number
  status: string
  par_desc: string
  sto_store: string
  calculated_column: string
  evt_code: string
  mlp_qty: string
  par_code: string
  par_longdescription: string
  act_matlist: string
  act_act: string
  act_note: string
  STO_QTY: string
  oldUsedQty: string
  oldPlanedQty: string
  par_uom: string
  par_number: string
  par_location: string
  par_note: string
  bin_code: string
}

export interface UpdatePartResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: any
}
