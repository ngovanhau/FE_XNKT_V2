
interface NdTruocItem {
  ND_WO: string
  ND_TYPE: string
  ND_CONTENT: string
  ND_CONTENT2: string
  ND_ISTICK: string
  ND_Line: number
}

interface NdTruocData {
  Left: NdTruocItem[]
  Right: NdTruocItem[]
}

interface NdTruocResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: NdTruocData
}

export type { NdTruocItem, NdTruocData, NdTruocResponse }