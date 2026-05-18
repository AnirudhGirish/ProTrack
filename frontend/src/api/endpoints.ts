import api from './client';
import type { User, DashboardData, EmployeeSummary, File as AppFile, ChatSession, ChatMessage, Notification, PaginatedResponse, UserFormData } from '../types';

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ access_token: string; token_type: string; role: string; username: string; employee_id: string | null }>('/auth/login', { username, password }),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const filesApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<AppFile>>('/files', { params }),
  get: (id: string) => api.get<AppFile>(`/files/${id}`),
  create: (data: Partial<AppFile>) => api.post<AppFile>('/files', data),
  update: (id: string, data: Partial<AppFile>) => api.patch<AppFile>(`/files/${id}`, data),
  updateStatus: (id: string, to_status: string, remarks?: string) => api.patch<AppFile>(`/files/${id}/status`, { to_status, remarks }),
  delete: (id: string) => api.delete(`/files/${id}`),
};

export const productivityApi = {
  dashboard: () => api.get<DashboardData>('/productivity/dashboard'),
  sections: () => api.get('/productivity/sections'),
  employees: () => api.get('/productivity/employees'),
  underperforming: () => api.get('/productivity/underperforming'),
};

export const employeeApi = {
  summary: () => api.get<EmployeeSummary>('/employee/summary'),
  tasks: () => api.get<AppFile[]>('/employee/tasks'),
  sectionFiles: () => api.get<AppFile[]>('/employee/section-files'),
  selfAssign: (file_id: string) => api.post(`/employee/self-assign/${file_id}`),
};

export const assignmentsApi = {
  list: () => api.get('/assignments'),
  assign: (employee_id: string, file_id: string, priority?: string) =>
    api.post('/assignments', { employee_id, file_id, priority }),
  unassign: (id: string) => api.delete(`/assignments/${id}`),
  bulkAssign: (employee_id: string, file_ids: string[]) =>
    api.post('/assignments/bulk', { employee_id, file_ids }),
};

export const adminApi = {
  listUsers: (params?: Record<string, string | number>) => api.get<PaginatedResponse<User>>('/admin/users', { params }),
  createUser: (data: UserFormData) => api.post<User>('/admin/users', data),
  updateUser: (id: string, data: Partial<User>) => api.patch<User>(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  importCsv: (file: globalThis.File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/admin/import-csv', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  exportCsv: () => api.get('/admin/export-csv', { responseType: 'blob' }),
  stats: () => api.get('/admin/stats'),
  auditLog: (params?: Record<string, string | number>) => api.get('/admin/audit-log', { params }),
  slaConfig: () => api.get('/admin/sla-config'),
  updateSla: (id: string, data: Record<string, number>) => api.patch(`/admin/sla-config/${id}`, data),
};

export const chatApi = {
  sendMessage: (query: string, session_id?: string) =>
    api.post('/chat/message', { query, session_id }),
  listSessions: () => api.get<ChatSession[]>('/chat/sessions'),
  getSession: (id: string) => api.get<ChatMessage[]>(`/chat/sessions/${id}`),
  deleteSession: (id: string) => api.delete(`/chat/sessions/${id}`),
};

export const notificationsApi = {
  list: (params?: Record<string, string | number>) => api.get<PaginatedResponse<Notification>>('/notifications', { params }),
  count: () => api.get<{ total: number; unread: number }>('/notifications/count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
