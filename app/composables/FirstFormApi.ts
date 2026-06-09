const pickQueryValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return (value[0] ?? '').toString().trim()
  }
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).trim()
}

const pickWoFromQueryString = (queryString: string) => {
  const params = new URLSearchParams(queryString || '')
  return (
    (params.get('wocode') || '').trim() ||
    (params.get('wo') || '').trim() ||
    (params.get('WO') || '').trim()
  )
}

const resolveWoCode = (wo?: string) => {
  const direct = (wo || '').trim()
  if (direct) return direct

  const nuxtApp = useNuxtApp()
  const fromRouterCurrentRoute =
    pickQueryValue(nuxtApp.$router?.currentRoute?.value?.query?.wocode) ||
    pickQueryValue(nuxtApp.$router?.currentRoute?.value?.query?.wo) ||
    pickQueryValue(nuxtApp.$router?.currentRoute?.value?.query?.WO)
  if (fromRouterCurrentRoute) return fromRouterCurrentRoute

  const route = useRoute()
  const fromRoute =
    pickQueryValue(route.query.wocode) ||
    pickQueryValue(route.query.wo) ||
    pickQueryValue(route.query.WO)
  if (fromRoute) return fromRoute

  const fromRouteFullPath = pickWoFromQueryString(route.fullPath.split('?')[1] || '')
  if (fromRouteFullPath) return fromRouteFullPath

  if (typeof window !== 'undefined') {
    const fromLocation = pickWoFromQueryString(window.location.search)
    if (fromLocation) return fromLocation
    const fromHref = pickWoFromQueryString(window.location.href.split('?')[1] || '')
    if (fromHref) return fromHref
  }

  const requestUrl = useRequestURL()
  const fromRequest = pickWoFromQueryString(requestUrl.search)
  return fromRequest
}

const resolveWoCodeWithRetry = async (wo?: string) => {
  let resolvedWo = resolveWoCode(wo)
  if (resolvedWo) return resolvedWo

  if (typeof window !== 'undefined') {
    await new Promise((resolve) => setTimeout(resolve, 80))
    resolvedWo = resolveWoCode(wo)
    if (resolvedWo) return resolvedWo

    const fromRegex = decodeURIComponent(window.location.href || '').match(/[?&](?:wocode|wo|WO)=([^&#]+)/)
    if (fromRegex?.[1]) {
      return fromRegex[1].trim()
    }
  }

  return ''
}

export async function GetFirstForm(wo?: string): Promise<FirstFormResponse> {
  const { $axios } = useNuxtApp()
  try {
    const resolvedWo = await resolveWoCodeWithRetry(wo)
    if (!resolvedWo) {
      throw new Error('Missing wo/wocode in URL query after retry')
    }
    const response = await $axios.get(`FirstForm/FirstForm`, {
      params: { wo: resolvedWo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

// interface
export interface FirstFormResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: FirstFormData
}

export interface FirstFormData {
  evt_code: string
  gian: string
  bophan: string
  matbi: string
  TenPhieuCV: string
  MaBD: string | null
  TenBD: string | null
  LoaiBD: string | null
  nhanluc: number | null
  thoigianBD: number | null
  evt_TGBD: string | null
  evt_TGKT: string | null
  TTHDThietBi: string | null
  KQNghiemThu: string | null
  LanhDaoGian: string | null
  KSBBDCS: string | null
  TruongBoPhan: string | null
  KSVanHanh: string | null
  TGLVThietBi: number | null
  TGLVThietBiTheoNam: number | null
  Org_TBi: string | null
  NgayLanhDao: string | null
  NgayTruongBoPhan: string | null
  NgayKSVH: string | null
  NgayKSBBDSC: string | null
  CapBD: string | null
  ViTriLapDat: string | null
  TinhTrangTbi: string | null
  NguoiChoPhep: string | null
  ChucDanh: string | null
  img: string | null
  License: string | null
  JSA: string | null
  BVTTB: string | null
  NgayPVGAS: string | null
  NgayBVTTB: string | null
  VetifiTruongBoPhan: string | null
  VetifiKSBBDSC: string | null
  VetifiKSVH: string | null
  VetifiLDG: string | null
  VetifiPVGAS: string | null
  VetifiBVTTB: string | null
  evtsystem: string | null
  evtstatus: string | null
  MATB: string | null
  TENTBI: string | null
  TAGNO: string | null
  MODEL: string | null
  NSX: string | null
  HUONGKHACPHUC: string | null
  NGUYENNHAN: string | null
  MOTAHUHONG: string | null
  GIANTRUONG: string | null
  TRUONGNHOM: string | null
  NGUOISD: string | null
  DAIDIENPVGAS: string | null
  GIANPHO: string | null
  Image1Path: string | null
  Image2Path: string | null
  Image3Path: string | null
  Image4Path: string | null
  Image5Path: string | null
  Image6Path: string | null
  NAMSD: string | null
  DangBaoDuong: string | null
  TheoHuongDan: string | null
  KyMaHieu: string | null
  NgayNguoiChoPhep: string | null
  Ghichu: string | null
  evtrstatus: string | null
  Timer: string | null
  PPMCode: string | null
  PTWNo: string | null
}
