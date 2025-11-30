import { api } from './api'

export interface CheckInData {
  employee_id: number
  method?: string
  device_id?: number
  location_lat?: number
  location_lng?: number
}

export interface CheckOutData {
  employee_id: number
  attendance_id?: number
  method?: string
}

export const attendanceService = {
  async checkIn(data: CheckInData, imageFile?: File) {
    const formData = new FormData()
    formData.append('employee_id', data.employee_id.toString())
    formData.append('method', data.method || 'face')
    if (data.device_id) formData.append('device_id', data.device_id.toString())
    if (data.location_lat) formData.append('location_lat', data.location_lat.toString())
    if (data.location_lng) formData.append('location_lng', data.location_lng.toString())
    if (imageFile) formData.append('image', imageFile)

    const response = await api.post('/api/v1/attendance/check-in', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async checkOut(data: CheckOutData, imageFile?: File) {
    const formData = new FormData()
    formData.append('employee_id', data.employee_id.toString())
    if (data.attendance_id) formData.append('attendance_id', data.attendance_id.toString())
    formData.append('method', data.method || 'face')
    if (imageFile) formData.append('image', imageFile)

    const response = await api.post('/api/v1/attendance/check-out', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getTodayAttendance() {
    const response = await api.get('/api/v1/attendance/today')
    return response.data
  },

  async getAttendance(employeeId?: number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (employeeId) params.append('employee_id', employeeId.toString())
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const response = await api.get(`/api/v1/attendance?${params.toString()}`)
    return response.data
  },
}













