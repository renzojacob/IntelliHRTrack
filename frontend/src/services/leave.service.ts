import { api } from './api'

export interface LeaveRequest {
  id: string;
  employee: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  reason: string;
  employeeId: string;
  submittedAt: string;
}

export interface LeaveRequestCreate {
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface LeaveRequestUpdate {
  status: 'pending' | 'approved' | 'declined' | 'cancelled';
  remarks?: string;
}

export interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  maxDays: number;
}

export interface BlackoutPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  reason: string;
  restrictionLevel: 'no-leave' | 'restricted';
}

export const leaveService = {
  // Employee endpoints
  async applyForLeave(leaveData: LeaveRequestCreate) {
    const response = await api.post('/api/v1/leaves/employee/apply', leaveData)
    return response.data
  },

  async getMyLeaves() {
    const response = await api.get('/api/v1/leaves/employee/my-leaves')
    return response.data
  },

  async getMyLeaveBalance() {
    const response = await api.get('/api/v1/leaves/employee/balance')
    return response.data
  },

  // Admin endpoints
  async getAllLeaves() {
    const response = await api.get('/api/v1/leaves/admin/all')
    return response.data
  },

  async getPendingLeaves() {
    const response = await api.get('/api/v1/leaves/admin/pending')
    return response.data
  },

  async updateLeaveStatus(leaveId: string, statusData: LeaveRequestUpdate) {
    const response = await api.put(`/api/v1/leaves/admin/${leaveId}/status`, statusData)
    return response.data
  },

  async getBlackoutPeriods() {
    const response = await api.get('/api/v1/leaves/admin/blackout-periods')
    return response.data
  },
}