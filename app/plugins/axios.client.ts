import axios from 'axios'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const pickWoFromUrl = () => {
    const params = new URLSearchParams(window.location.search || '')
    return (
      (params.get('wocode') || '').trim() ||
      (params.get('wo') || '').trim() ||
      (params.get('WO') || '').trim()
    )
  }

  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })

  api.interceptors.request.use((requestConfig) => {
    const shouldSkipWoInject = Boolean((requestConfig as any).__skipWoInject)
    if (shouldSkipWoInject) {
      return requestConfig
    }

    const requestUrl = String(requestConfig.url || '')
    const isDesignerByWoApi =
      requestUrl.includes('TTLVTB/GetDesignerByWo') ||
      requestUrl.includes('/api/v1/TTLVTB/GetDesignerByWo')
    const isNguoiChoPhepApi =
      requestUrl.includes('Part/NguoiChoPhep') ||
      requestUrl.includes('/api/v1/Part/NguoiChoPhep')
    const isUpdateNoteApi =
      requestUrl.includes('Note/UpdateNote') ||
      requestUrl.includes('/api/v1/Note/UpdateNote')

    // Các endpoint này không dùng param wo auto-inject.
    if (isDesignerByWoApi || isNguoiChoPhepApi || isUpdateNoteApi) {
      return requestConfig
    }

    const wo = pickWoFromUrl()
    if (!wo) return requestConfig

    const params = { ...(requestConfig.params || {}) } as Record<string, any>
    const hasWo = typeof params.wo === 'string' && params.wo.trim() !== ''
    const hasPWo = typeof params.p_wo === 'string' && params.p_wo.trim() !== ''
    const hasUpperWo = typeof params.WO === 'string' && params.WO.trim() !== ''

    if (Object.prototype.hasOwnProperty.call(params, 'wo') && !hasWo) {
      params.wo = wo
    }
    if (Object.prototype.hasOwnProperty.call(params, 'p_wo') && !hasPWo) {
      params.p_wo = wo
    }
    if (Object.prototype.hasOwnProperty.call(params, 'WO') && !hasUpperWo) {
      params.WO = wo
    }

    if (!Object.prototype.hasOwnProperty.call(params, 'wo') &&
      !Object.prototype.hasOwnProperty.call(params, 'p_wo') &&
      !Object.prototype.hasOwnProperty.call(params, 'WO')) {
      params.wo = wo
    }

    requestConfig.params = params
    return requestConfig
  })

  return {
    provide: {
      axios: api
    }
  }
})
