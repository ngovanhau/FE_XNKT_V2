// FORMMAIN API functions

// GET /api/v1/FORMMAIN/GetNdTruoc
export const GetNdTruoc = async (p_wo: string) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get('/FORMMAIN/GetNdTruoc', {
      
      params: { p_wo }
    })
    return response.data
  } catch (error) {
    console.error('Error in GetNdTruoc:', error)
    throw error
  }
}

export async function UpdateTichTruocND(wo: string, line: number, istick: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put(`FORMMAIN/UpdateTichTruocND`, null, {
      params: { wo, line, istick }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function GetCVK2(wo: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`FORMMAIN/CVK2`, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function UpdateCVK2(wo: string, line: number, content: string) {
  const { $axios } = useNuxtApp()
  try {
    const params = { wo, line, content }
    const response = await $axios.put(`FORMMAIN/NoteCVK2`, null, {
      params
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

// GET /api/v1/FORMMAIN/GetNdBaoDuong
export const GetNdBaoDuong = async (wo: string) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get('/FORMMAIN/GetNdBaoDuong', {
      
      params: { wo }
    })
    return response.data
  } catch (error) {
    console.error('Error in GetNdBaoDuong:', error)
    throw error
  }
}

export async function UpdateTichBaoDuongND(wo: string, line: number, istick: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put(`FORMMAIN/TichNdBaoDuong`, null, {
      params: { wo, line, istick }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

// GET /api/v1/FORMMAIN/CVK4
export async function GetCVK4(wo: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`FORMMAIN/CVK4`, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function NoteCVK4(wo: string, content: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put(`FORMMAIN/NoteCVK4`, null, {
      params: { wo, content }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

// PUT /api/v1/FORMMAIN/NoteCVK4
export async function NoteCVK6(wo: string, content: string) {
  const { $axios } = useNuxtApp()
  try {
    const params = { wo, content }
    const response = await $axios.put(`FORMMAIN/NoteCVK6`, null, {
      params
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

// Export PDF function
export async function ExportPdf(wocode: string, matbi: string) {
   const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`FORMMAIN/ExportPdf?wocode=${wocode}&matbi=${matbi}`)
    return response
  } catch (error) {
    console.error('Error in ExportPdf:', error)
    throw error
  }
}

export async function UpdateTichCVK(wo: string, line: number, istick: string, type: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put(`U5NDCV/UpdateTichCVK`, null, {
      params: {
        wo,
        line,
        istick,
        type
      }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function GetNdSau(wo: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`FORMMAIN/GetNdSau`, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function TichNdSau(wo: string, line: number, istick: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.put(`FORMMAIN/TichNdSau`, null, {
      params: { wo, line, istick }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}

export async function GetCVK6(wo: string) {
  const { $axios } = useNuxtApp()
  try {
    const response = await $axios.get(`FORMMAIN/CVK6`, {
      params: { wo }
    })
    return response.data
  } 
  catch (error: any) { 
    throw error
   }
}
