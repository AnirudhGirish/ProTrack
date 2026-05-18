export interface User {
  id: string;
  username: string;
  role: 'admin' | 'section_head' | 'employee' | 'readonly';
  employee_id: string | null;
  section: string | null;
  full_name: string | null;
  email: string | null;
  is_active: boolean;
}

export interface File {
  id: string;
  file_no: string;
  subject: string;
  section: string;
  status: string;
  created_date: string;
  closed_date: string | null;
  initiated_by: string | null;
  current_user: string | null;
  assigned_to: string | null;
  movements: number;
  remarks: string | null;
  due_date: string | null;
  priority: string;
  processing_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface SectionBreakdown {
  section: string;
  total: number;
  completed: number;
  pending: number;
  avg_processing_days: number | null;
}

export interface EmployeeScore {
  employee_id: string;
  employee_name: string;
  section: string | null;
  total: number;
  completed: number;
  pending: number;
  avg_processing_days: number | null;
  productivity_score: number;
}

export interface UnderperformingSection {
  section: string;
  total: number;
  completed: number;
  pending: number;
  pending_ratio: number;
  avg_processing_days: number | null;
  reasons: string[];
}

export interface OldPendingFile {
  file_no: string;
  subject: string;
  section: string;
  current_user: string | null;
  pending_days: number;
  priority: string;
  due_date: string | null;
}

export interface DashboardData {
  total_files: number;
  completed: number;
  pending: number;
  avg_processing_time_days: number | null;
  completion_rate: number;
  section_breakdown: SectionBreakdown[];
  employee_scores: EmployeeScore[];
  underperforming_sections: UnderperformingSection[];
  old_pending_files: OldPendingFile[];
  insights: string[];
  llm_snapshot: Record<string, unknown> | null;
}

export interface EmployeeSummary {
  total: number;
  pending: number;
  completed: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ChatMessage {
  id: string;
  session_id?: string;
  role: string;
  content: string;
  llm_provider?: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

export interface UserFormData {
  username: string;
  password: string;
  role: string;
  employee_id?: string;
  section?: string;
  full_name?: string;
}
