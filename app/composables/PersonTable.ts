
export interface PersonData {
  per_code: string
  per_desc: string
  per_jobtitle: string
  per_trade: string
  per_udfchkbox01: string
}

export interface PersonResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: PersonData[]
}