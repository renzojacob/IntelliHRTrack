import { api } from './api'

export const employeeService = {
  async getEmployees(search?: string, departmentId?: number, status?: string) {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (departmentId) params.append('department_id', departmentId.toString())
    if (status) params.append('status', status)

    const response = await api.get(`/api/v1/employees?${params.toString()}`)
    return response.data
  },

  async getEmployee(id: number) {
    const response = await api.get(`/api/v1/employees/${id}`)
    return response.data
  },

  async createEmployee(data: any) {
    const response = await api.post('/api/v1/employees', data)
    return response.data
  },

  async updateEmployee(id: number, data: any) {
    const response = await api.put(`/api/v1/employees/${id}`, data)
    return response.data
  },

  async deleteEmployee(id: number) {
    const response = await api.delete(`/api/v1/employees/${id}`)
    return response.data
  },
}













