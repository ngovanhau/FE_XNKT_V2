export interface LoginPayload {
  Username: string
  Password: string
}

export interface AuthTokenData {
  AccessToken: string
  ExpiresAt: string
  RefreshToken: string
  RefreshTokenExpiresAt: string
}

export interface LoginResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: AuthTokenData
}

export interface RefreshTokenPayload {
  AccessToken: string
  RefreshToken: string
}

export interface RefreshTokenResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: AuthTokenData
}

export interface AuthUser {
  Username: string
  IsActive: 'Y' | 'N'
  CreatedAt: string
}

export interface CategoryItem {
  [key: string]: string | number | boolean | null
}

export interface GetAllUsersResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: {
    Data: AuthUser[]
    TotalCount: number
  }
}

export interface GetCategoriesResponse {
  HttpStatus: number
  IsSuccess: boolean
  Data: {
    Data: CategoryItem[]
    TotalCount: number
  }
}

export interface CategoryPayload {
  CATEGORY_CODE: string
  CATEGORY_NAME: string
  DESCRIPTION: string
  IS_ACTIVE: 'Y' | 'N'
  DISPLAY_ORDER: string
}

export interface CreateUserPayload {
  Username: string
  Password: string
  IsActive?: 'Y' | 'N'
}

export interface UpdateUserPayload {
  Username: string
  IsActive: 'Y' | 'N'
  NewPassword: string
}

export interface AuthActionResponse {
  HttpStatus: number
  IsSuccess: boolean
  Message?: string
  Data?: unknown
}

export interface TemplateHeaderNode {
  _id?: string
  headerId: number | null
  text: string
  sourceField: string | null
  width: number | null
  align: 'left' | 'center' | 'right' | null
  displayOrder: number
  style?: Record<string, unknown> | null
  valueStyle?: Record<string, unknown> | null
  inputType?: 'text' | 'number' | 'select' | 'checkbox' | 'textarea' | null
  defaultValue?: string | number | boolean | null
  validation?: Record<string, unknown> | null
  options?: unknown[] | Record<string, unknown> | null
  dataType?: 'text' | 'number' | 'option' | string | null
  optionalType?: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
  children: TemplateHeaderNode[]
}

export interface TemplateHeaderParent {
  text: string
  style?: Record<string, unknown> | null
}

export interface TemplateByCategoryData {
  templateId: number
  categoryCode: string
  templateName: string
  headerParents: TemplateHeaderParent[]
  tableStyle?: Record<string, unknown> | null
  rowStyle?: Record<string, unknown> | null
  headerChildren: TemplateHeaderNode[]
}

export interface TemplateByCategoryResponse {
  status: number
  message?: string
  data: TemplateByCategoryData
}

export interface SaveTemplatePayload {
  templateName: string
  headerParents: TemplateHeaderParent[]
  tableStyle?: Record<string, unknown> | null
  rowStyle?: Record<string, unknown> | null
  headerChildren: TemplateHeaderNode[]
}

export interface SaveTemplateResponse {
  status: number
  message?: string
  data: string
}

export interface TemplateHeaderNodePayload {
  parentHeaderId: number | null
  text: string
  sourceField: string | null
  width: number | null
  align: 'left' | 'center' | 'right' | null
  displayOrder: number
  dataType?: 'text' | 'number' | 'option' | string | null
  optionalType?: string | null
  optionSelectionMode?: 'single' | 'multiple' | string | null
}

export interface TypeOptionTypeItem {
  optional_TYPE: string
  description: string
}

export interface TypeOptionValueItem {
  value_ID: number
  optional_TYPE: string
  option_VALUE: string
  display_ORDER: number
}

export interface TypeOptionPagedResponse {
  httpStatus: number
  isSuccess: boolean
  data: {
    data: TypeOptionTypeItem[]
    totalCount: number
  }
}

export interface TypeOptionActionResponse {
  httpStatus: number
  isSuccess: boolean
  data?: unknown
  message?: string
}

const getStoredValue = (key: string) => {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem(key)?.trim() || ''
}

const getAccessTokenFromStorage = () => {
  const directToken = getStoredValue('AccessToken')
  if (directToken) return directToken

  const dataRaw = getStoredValue('Data')
  if (dataRaw) {
    try {
      const parsedData = JSON.parse(dataRaw)
      if (typeof parsedData?.AccessToken === 'string' && parsedData.AccessToken.trim()) {
        return parsedData.AccessToken.trim()
      }
    } catch {}
  }

  const loginResponseRaw = getStoredValue('loginResponse')
  if (loginResponseRaw) {
    try {
      const parsedResponse = JSON.parse(loginResponseRaw)
      if (typeof parsedResponse?.Data?.AccessToken === 'string' && parsedResponse.Data.AccessToken.trim()) {
        return parsedResponse.Data.AccessToken.trim()
      }
    } catch {}
  }

  return ''
}

const updateStoredToken = (tokenData: AuthTokenData) => {
  if (typeof window === 'undefined') return
  localStorage.setItem('AccessToken', tokenData.AccessToken)
  localStorage.setItem('ExpiresAt', tokenData.ExpiresAt)
  localStorage.setItem('RefreshToken', tokenData.RefreshToken)
  localStorage.setItem('RefreshTokenExpiresAt', tokenData.RefreshTokenExpiresAt)
}

export const RefreshAccessToken = async (): Promise<string> => {
  const { $axios } = useNuxtApp()
  const payload: RefreshTokenPayload = {
    AccessToken: getAccessTokenFromStorage(),
    RefreshToken: getStoredValue('RefreshToken')
  }

  if (!payload.AccessToken || !payload.RefreshToken) {
    throw new Error('Missing AccessToken/RefreshToken in localStorage')
  }

  const response = await $axios.post<RefreshTokenResponse>('Auth/RefreshToken', payload)
  if (!response.data?.IsSuccess || !response.data?.Data?.AccessToken) {
    throw new Error('Refresh token failed')
  }

  updateStoredToken(response.data.Data)
  return response.data.Data.AccessToken
}

const requestWithAuth = async <T>(
  requester: (accessToken: string) => Promise<T>
): Promise<T> => {
  let accessToken = getAccessTokenFromStorage()
  if (!accessToken) {
    throw new Error('Missing AccessToken in localStorage')
  }

  try {
    return await requester(accessToken)
  } catch (error: any) {
    const statusCode = error?.response?.status
    if (statusCode !== 401) {
      throw error
    }

    accessToken = await RefreshAccessToken()
    return await requester(accessToken)
  }
}

const requestWithOptionalAuth = async <T>(
  requester: (accessToken: string | null) => Promise<T>
): Promise<T> => {
  let accessToken = getAccessTokenFromStorage()
  if (!accessToken) {
    return await requester(null)
  }

  try {
    return await requester(accessToken)
  } catch (error: any) {
    const statusCode = error?.response?.status
    if (statusCode !== 401) {
      throw error
    }

    accessToken = await RefreshAccessToken()
    return await requester(accessToken)
  }
}

const buildAuthHeaders = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
  AccessToken: accessToken,
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
})

const REQUEST_TIMEOUT_MS = 15000

export const Login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { $axios } = useNuxtApp()
  const response = await $axios.post<LoginResponse>('Auth/Login', payload)
  return response.data
}

export const GetAllUsers = async (
  search: string = '',
  currentPage: number = 1,
  pageSize: number = 20
): Promise<GetAllUsersResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get<GetAllUsersResponse>('Auth/GetAllUsers', {
      headers: buildAuthHeaders(accessToken),
      params: {
        search,
        currentPage,
        pageSize
      },
      timeout: REQUEST_TIMEOUT_MS
    })
    return response.data
  })
}

export const CreateUser = async (payload: CreateUserPayload): Promise<AuthActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post<AuthActionResponse>('Auth/CreateUser', payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const UpdateUser = async (payload: UpdateUserPayload): Promise<AuthActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put<AuthActionResponse>('Auth/UpdateUser', payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const GetCategories = async (
  search: string = '',
  currentPage: number = 1,
  pageSize: number = 20
): Promise<GetCategoriesResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get<GetCategoriesResponse>('U5TTLV_CATEGORY/GetCategories', {
      headers: buildAuthHeaders(accessToken),
      params: {
        search,
        currentPage,
        pageSize
      },
      timeout: REQUEST_TIMEOUT_MS
    })
    return response.data
  })
}

export const CreateCategory = async (payload: CategoryPayload): Promise<AuthActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post<AuthActionResponse>('U5TTLV_CATEGORY/CreateCategory', payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const UpdateCategory = async (payload: CategoryPayload): Promise<AuthActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put<AuthActionResponse>('U5TTLV_CATEGORY/UpdateCategory', payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const DeleteCategory = async (categoryCode: string): Promise<AuthActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.delete<AuthActionResponse>('U5TTLV_CATEGORY/DeleteCategory', {
      headers: buildAuthHeaders(accessToken),
      params: {
        categoryCode
      }
    })
    return response.data
  })
}

export const GetTemplateByCategory = async (categoryCode: string): Promise<TemplateByCategoryResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get<TemplateByCategoryResponse>(`templates/${encodeURIComponent(categoryCode)}`, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const SaveTemplate = async (templateId: number, payload: SaveTemplatePayload): Promise<SaveTemplateResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put<SaveTemplateResponse>(`templates/${templateId}`, payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const GetTemplateById = async (templateId: number): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get(`templates/id/${templateId}`, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const DeleteTemplate = async (templateId: number): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.delete(`templates/${templateId}`, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const GetTemplateHeaders = async (templateId: number): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get(`templates/${templateId}/headers`, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const CreateTemplateHeader = async (templateId: number, payload: TemplateHeaderNodePayload): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post(`templates/${templateId}/headers`, payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const UpdateTemplateHeader = async (
  templateId: number,
  headerId: number,
  payload: Omit<TemplateHeaderNodePayload, 'parentHeaderId'>
): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put(`templates/${templateId}/headers/${headerId}`, payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const DeleteTemplateHeader = async (templateId: number, headerId: number): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.delete(`templates/${templateId}/headers/${headerId}`, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const GetTypeOptions = async (): Promise<any> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get('/TypeOption/Types', {
      headers: buildAuthHeaders(accessToken),
      timeout: REQUEST_TIMEOUT_MS
    })
    return response.data
  })
}

export const GetTypeOptionsPaged = async (
  currentPage: number = 1,
  pageSize: number = 20,
  search: string = ''
): Promise<TypeOptionPagedResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.get<TypeOptionPagedResponse>('/TypeOption/Types', {
      headers: buildAuthHeaders(accessToken),
      params: {
        currentPage,
        pageSize,
        search
      },
      timeout: REQUEST_TIMEOUT_MS
    })
    return response.data
  })
}

export const CreateTypeOptionTable = async (): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post<TypeOptionActionResponse>('/TypeOption/CreateTable', {}, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const CreateTypeOptionType = async (payload: {
  optional_TYPE: string
  description: string
}): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post<TypeOptionActionResponse>('/TypeOption/Types', payload, {
      headers: buildAuthHeaders(accessToken)
    })
    return response.data
  })
}

export const UpdateTypeOptionType = async (
  optionalType: string,
  payload: { description: string }
): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put<TypeOptionActionResponse>(
      `/TypeOption/Types/${encodeURIComponent(optionalType)}`,
      payload,
      {
        headers: buildAuthHeaders(accessToken)
      }
    )
    return response.data
  })
}

export const DeleteTypeOptionType = async (optionalType: string): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.delete<TypeOptionActionResponse>(
      `/TypeOption/Types/${encodeURIComponent(optionalType)}`,
      {
        headers: buildAuthHeaders(accessToken)
      }
    )
    return response.data
  })
}

export const GetTypeOptionValues = async (optionalType: string): Promise<TypeOptionValueItem[]> => {
  const { $axios } = useNuxtApp()
  const normalizedType = optionalType.trim().toUpperCase()
  return requestWithOptionalAuth(async (accessToken) => {
    const response = await $axios.get<any>(
      `/TypeOption/Types/${encodeURIComponent(normalizedType)}/Values`,
      {
        headers: accessToken ? buildAuthHeaders(accessToken) : undefined,
        timeout: REQUEST_TIMEOUT_MS
      }
    )
    const payload = response.data
    return (payload?.data || payload?.Data || []) as TypeOptionValueItem[]
  })
}

export const CreateTypeOptionValue = async (
  optionalType: string,
  payload: { option_VALUE: string; display_ORDER: number }
): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.post<TypeOptionActionResponse>(
      `/TypeOption/Types/${encodeURIComponent(optionalType)}/Values`,
      payload,
      {
        headers: buildAuthHeaders(accessToken)
      }
    )
    return response.data
  })
}

export const UpdateTypeOptionValue = async (
  valueId: number,
  payload: { option_VALUE: string; display_ORDER: number }
): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.put<TypeOptionActionResponse>(
      `/TypeOption/Values/${valueId}`,
      payload,
      {
        headers: buildAuthHeaders(accessToken)
      }
    )
    return response.data
  })
}

export const DeleteTypeOptionValue = async (valueId: number): Promise<TypeOptionActionResponse> => {
  const { $axios } = useNuxtApp()
  return requestWithAuth(async (accessToken) => {
    const response = await $axios.delete<TypeOptionActionResponse>(
      `/TypeOption/Values/${valueId}`,
      {
        headers: buildAuthHeaders(accessToken)
      }
    )
    return response.data
  })
}
