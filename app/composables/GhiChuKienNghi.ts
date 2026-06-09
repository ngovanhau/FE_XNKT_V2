// Get WO Data List ORA
export const GetWODataListORA = async (wo: string) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get('TablePerson/LoadPerson', {
      params: {
        wo: wo
      }
    })
    return response.data
  } catch (error) {
    console.error('Error getting WO data list ORA:', error)
    throw error
  }
}

// Get List Select
export const GetListSelect = async (gian: string, bophan: string) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.get('TablePerson/GetListSelect', {
      params: {
        gian: gian,
        bophan: bophan
      }
    })
    return response.data
  } catch (error) {
    console.error('Error getting list select:', error)
    throw error
  }
}

// Save Person Table
export const SavePersonTable = async (wocode: string, data: any[]) => {
  try {
    const { $axios } = useNuxtApp()
    
    // Format data to match API requirements
    const formattedData = data.map(item => ({
      idRow: item.idRow,
      ViTri: item.ViTri || '',
      ChucDanh: item.ChucDanh || '',
      HoTen: item.HoTen || '',
      MaPer: item.MaPer || '',
      ChuKy: item.ChuKy || '',
      Ngay: item.Ngay || null, // Ensure null instead of empty string
      status: item.status || 0
    }))
    
    const response = await $axios.put('TablePerson/SavePersonTable', formattedData, {
      params: {
        wocode: wocode
      }
    })
    return response.data
  } catch (error) {
    console.error('Error saving person table:', error)
    throw error
  }
}

// Update Ghi Chu R5
export const UpdateGhiChuR5 = async (woCode: string, ghichu: string) => {
  try {
    const { $axios } = useNuxtApp()
    const response = await $axios.put('Note/UpdateNote', null, {
      params: {
        woCode,
        note: ghichu
      },
      __skipWoInject: true
    } as any)
    return response.data
  } catch (error) {
    console.error('Error updating ghi chu R5:', error)
    throw error
  }
}
