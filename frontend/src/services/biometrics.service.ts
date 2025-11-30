import { api } from './api'

export const biometricsService = {
  async enrollFace(employeeId: number, imageFile: File) {
    const formData = new FormData()
    formData.append('employee_id', employeeId.toString())
    formData.append('image', imageFile)

    const response = await api.post('/api/v1/biometrics/face/enroll', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async verifyFace(employeeId: number, imageFile: File) {
    const formData = new FormData()
    formData.append('employee_id', employeeId.toString())
    formData.append('image', imageFile)

    const response = await api.post('/api/v1/biometrics/face/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async getTemplates(employeeId: number) {
    const response = await api.get(`/api/v1/biometrics/${employeeId}/templates`)
    return response.data
  },

  async deleteTemplate(templateId: number) {
    const response = await api.delete(`/api/v1/biometrics/templates/${templateId}`)
    return response.data
  },
}













