import { api } from './api'

export interface TodayAttendanceResponse {
  attendance?: {
    id: number
    check_in_time?: string
    check_out_time?: string
    status?: string
  }
  checked_in?: boolean
  checked_out?: boolean
}

export const attendanceService = {
  async getTodayAttendance(): Promise<TodayAttendanceResponse> {
    const response = await api.get('/api/v1/attendance/today')
    return response.data
  },

  async checkIn(payload: any, imageFile?: File) {
    if (imageFile) {
      const fd = new FormData()
      fd.append('image', imageFile)
      for (const key of Object.keys(payload)) {
        const val = (payload as any)[key]
        if (val !== undefined && val !== null) fd.append(key, String(val))
      }
      const response = await api.post('/api/v1/attendance/check-in', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    }

    const response = await api.post('/api/v1/attendance/check-in', payload)
    return response.data
  },

  async checkOut(payload: any, imageFile?: File) {
    if (imageFile) {
      const fd = new FormData()
      fd.append('image', imageFile)
      for (const key of Object.keys(payload)) {
        const val = (payload as any)[key]
        if (val !== undefined && val !== null) fd.append(key, String(val))
      }
      const response = await api.post('/api/v1/attendance/check-out', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    }

    const response = await api.post('/api/v1/attendance/check-out', payload)
    return response.data
  },
}