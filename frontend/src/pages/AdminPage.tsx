import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, filesApi, assignmentsApi } from '../api/endpoints';
import { Card, Spinner, StatCard, SectionHeader } from '../components/common/UIComponents';
import type { User, File as AppFile } from '../types';
import toast from 'react-hot-toast';
import { Users, FileText, CheckCircle, Clock, Upload, Download, Trash2, Plus, Shield, UserCheck, ChevronDown } from 'lucide-react';

type AdminTab = 'overview' | 'files' | 'users' | 'import';

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <CheckCircle className="w-4 h-4" /> },
  { key: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> },
  { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { key: 'import', label: 'CSV Import', icon: <Upload className="w-4 h-4" /> },
];

const STATUS_COLORS: Record<string, string> = {
  closed: 'bg-forest-50 text-forest-700',
  received: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-700',
  under_review: 'bg-amber-50 text-amber-700',
  returned: 'bg-red-50 text-red-700',
  approved: 'bg-teal-50 text-teal-700',
};

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<AppFile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.stats().then(r => setStats(r.data)).catch(() => {}),
      filesApi.list({ page_size: 100 }).then(r => setFiles(r.data.items)).catch(() => {}),
      adminApi.listUsers({ page_size: 100 }).then(r => setUsers(r.data.items)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [tab]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-morning-500 to-morning-700 flex items-center justify-center shadow-md shadow-morning-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">Admin Panel</h1>
          <p className="text-sm text-slate-400">Manage files, users, and system data</p>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {tab === 'overview' && <OverviewTab stats={stats} />}
      {tab === 'files' && <FilesTab files={files} users={users} />}
      {tab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
      {tab === 'import' && <ImportTab />}
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────── */
function OverviewTab({ stats }: { stats: Record<string, number> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Files" value={stats.total_files ?? 0} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Completed" value={stats.completed ?? 0} variant="success" icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard label="Pending" value={stats.pending ?? 0} variant="warning" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Active Users" value={stats.total_users ?? 0} icon={<Users className="w-4 h-4" />} />
      </div>
    </div>
  );
}

/* ─── Files Tab ─────────────────────────────── */
function FilesTab({ files, users }: { files: AppFile[]; users: User[] }) {
  const [form, setForm] = useState({
    file_no: '', subject: '', section: '', status: 'received', priority: 'normal', created_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningFile, setAssigningFile] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, { name: string; id: string }>>({});
  const [localFiles, setLocalFiles] = useState<AppFile[]>(files);

  useEffect(() => { setLocalFiles(files); }, [files]);

  // Load current assignments map: file_id -> {name, id}
  useEffect(() => {
    assignmentsApi.list().then(res => {
      const map: Record<string, { name: string; id: string }> = {};
      for (const a of (res.data || [])) {
        map[a.file_id] = { name: a.employee_name, id: a.employee_id };
      }
      setAssignments(map);
    }).catch(() => {});
  }, [files]);

  // Only employees (not admins) are valid assignment targets
  const employees = users.filter(u => u.role === 'employee' && u.is_active);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.file_no.trim() || !form.subject.trim() || !form.section.trim()) {
      toast.error('File No, Subject, and Section are required');
      return;
    }
    setSaving(true);
    try {
      await filesApi.create({ ...form, created_date: form.created_date || new Date().toISOString().split('T')[0] });
      toast.success('File created successfully');
      setForm({ file_no: '', subject: '', section: '', status: 'received', priority: 'normal', created_date: '' });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create file');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, fileNo: string) => {
    if (!confirm(`Delete file "${fileNo}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await filesApi.delete(id);
      toast.success('File deleted');
      setLocalFiles(prev => prev.filter(f => f.id !== id));
    } catch { toast.error('Failed to delete file'); }
    finally { setDeletingId(null); }
  };

  const handleAssign = async (fileId: string, employeeId: string, fileNo: string) => {
    if (!employeeId) return;
    setAssigningFile(fileId);
    try {
      await assignmentsApi.assign(employeeId, fileId);
      const emp = employees.find(e => e.id === employeeId);
      const empName = emp?.full_name || emp?.username || 'employee';
      toast.success(`File ${fileNo} assigned to ${empName}`);
      // Update local assignment map
      setAssignments(prev => ({ ...prev, [fileId]: { name: empName, id: employeeId } }));
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to assign file');
    } finally {
      setAssigningFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add File Form */}
      <Card>
        <SectionHeader title="Add New File" action={
          <span className="text-xs text-slate-400">{localFiles.length} total files</span>
        } />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">File No *</label>
              <input value={form.file_no} onChange={e => setForm({ ...form, file_no: e.target.value })}
                placeholder="e.g. FL/2024/001" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Subject *</label>
              <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="File subject" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Section *</label>
              <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. Legal & Land" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="form-select">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Created Date</label>
              <input type="date" value={form.created_date} onChange={e => setForm({ ...form, created_date: e.target.value })}
                className="form-input" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white font-semibold text-sm hover:from-forest-700 hover:to-forest-800 transition shadow-md shadow-forest-600/20 disabled:opacity-50 btn-press">
            <Plus className="w-4 h-4" />
            {saving ? 'Adding…' : 'Add File'}
          </button>
        </form>
      </Card>

      {/* Files Table */}
      <Card className="p-0">
        <div className="p-6 pb-0">
          <SectionHeader title={`All Files (${localFiles.length})`} action={
            <span className="text-xs text-slate-400">Assign files to employees using the dropdown</span>
          } />
        </div>
        <div className="overflow-auto max-h-[600px]">
          <table className="data-table">
            <thead className="sticky top-0 z-10">
              <tr>
                <th>File No</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Assign Employee</th>
                <th className="text-right pr-6">Delete</th>
              </tr>
            </thead>
            <tbody>
              {localFiles.map(f => {
                const currentAssignee = assignments[f.id];
                const isAssigning = assigningFile === f.id;
                return (
                  <tr key={f.id}>
                    <td className="font-bold text-slate-800 font-mono text-xs">{f.file_no}</td>
                    <td className="max-w-[160px]">
                      <span className="block truncate text-slate-700 text-sm">{f.subject}</span>
                    </td>
                    <td className="text-slate-500 text-sm">{f.section}</td>
                    <td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[f.status] || 'bg-slate-100 text-slate-600'}`}>
                        {f.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        f.priority === 'critical' ? 'bg-red-50 text-red-700' :
                        f.priority === 'high' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {f.priority}
                      </span>
                    </td>
                    <td>
                      {currentAssignee ? (
                        <span className="flex items-center gap-1.5 text-xs text-forest-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          {currentAssignee.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">— Unassigned</span>
                      )}
                    </td>
                    <td>
                      {f.status === 'closed' ? (
                        <span className="text-xs text-slate-300">Closed</span>
                      ) : (
                        <div className="relative w-44">
                          <select
                            className="w-full appearance-none text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg pl-3 pr-7 py-1.5 hover:border-morning-300 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-morning-200 disabled:opacity-40"
                            disabled={isAssigning}
                            value={currentAssignee?.id || ''}
                            onChange={e => handleAssign(f.id, e.target.value, f.file_no)}
                          >
                            <option value="">Select employee…</option>
                            {employees.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.full_name || emp.username}{emp.section ? ` (${emp.section})` : ''}
                              </option>
                            ))}
                          </select>
                          {isAssigning ? (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-slate-300 border-t-morning-500 animate-spin" />
                          ) : (
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="text-right pr-6">
                      <button
                        onClick={() => handleDelete(f.id, f.file_no)}
                        disabled={deletingId === f.id}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === f.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── Users Tab ─────────────────────────────── */
function UsersTab({ users, setUsers }: { users: User[]; setUsers: (u: User[]) => void }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'employee', employee_id: '', section: '', full_name: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Username and password are required'); return; }
    setSaving(true);
    try {
      const res = await adminApi.createUser(form);
      setUsers([res.data, ...users]);
      toast.success(`User "${form.username}" created`);
      setForm({ username: '', password: '', role: 'employee', employee_id: '', section: '', full_name: '' });
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-red-50 text-red-700',
    section_head: 'bg-morning-50 text-morning-700',
    employee: 'bg-forest-50 text-forest-700',
    readonly: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      {/* Add User Form */}
      <Card>
        <SectionHeader title="Add New User" action={
          <span className="text-xs text-slate-400">{users.length} total users</span>
        } />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Username *</label>
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="e.g. john.doe" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="Min 8 characters" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Full Name</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="Display name" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="form-select">
                <option value="employee">Employee</option>
                <option value="section_head">Section Head</option>
                <option value="admin">Admin</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Employee ID</label>
              <input value={form.employee_id} onChange={e => setForm({ ...form, employee_id: e.target.value })}
                placeholder="e.g. EMP-001" className="form-input" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Section</label>
              <input value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}
                placeholder="e.g. Legal & Land" className="form-input" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-morning-600 to-morning-700 text-white font-semibold text-sm hover:from-morning-700 hover:to-morning-800 transition shadow-md shadow-morning-600/20 disabled:opacity-50 btn-press">
            <Plus className="w-4 h-4" />
            {saving ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </Card>

      {/* Users Table */}
      <Card className="p-0">
        <div className="p-6 pb-0">
          <SectionHeader title={`System Users (${users.length})`} />
        </div>
        <div className="overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Section</th>
                <th>Employee ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-bold text-slate-800 font-mono text-xs">{u.username}</td>
                  <td className="text-slate-700 text-sm">{u.full_name || '—'}</td>
                  <td>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-500'}`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-slate-500 text-sm">{u.section || '—'}</td>
                  <td className="text-slate-500 text-xs font-mono">{u.employee_id || '—'}</td>
                  <td>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-forest-50 text-forest-700' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ─── Import Tab ────────────────────────────── */
function ImportTab() {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUpload = async (file: globalThis.File) => {
    setUploading(true);
    try {
      const res = await adminApi.importCsv(file);
      toast.success(res.data.message || 'CSV imported successfully');
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = '';
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `forest_eoffice_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV downloaded');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Import */}
      <Card>
        <SectionHeader title="Import CSV" />
        <p className="text-sm text-slate-500 mb-6">
          Upload a CSV file to bulk-import files into the system. The file should include columns:
          <code className="ml-1 text-xs bg-slate-100 text-morning-700 px-1.5 py-0.5 rounded font-mono">file_no, subject, section, priority, status, created_date</code>
        </p>

        {/* Drop zone */}
        <label
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragOver
              ? 'border-forest-400 bg-forest-50'
              : uploading
              ? 'border-slate-200 bg-slate-50 cursor-wait'
              : 'border-slate-200 bg-slate-50 hover:border-forest-300 hover:bg-forest-50/50'
          }`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.name.endsWith('.csv')) handleUpload(file);
            else toast.error('Please drop a .csv file');
          }}
        >
          <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" disabled={uploading} />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-forest-500 animate-spin" />
              <p className="text-sm font-medium text-slate-500">Importing data…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-semibold text-slate-600">Drop CSV here or click to browse</p>
              <p className="text-xs text-slate-400">Supports .csv files only</p>
            </div>
          )}
        </label>
      </Card>

      {/* Export */}
      <Card>
        <SectionHeader title="Export Data" />
        <p className="text-sm text-slate-500 mb-5">Download all current file data as a CSV for backups or external analysis.</p>
        <button
          onClick={handleExport}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-semibold text-sm transition shadow-sm btn-press"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Download Current Data as CSV
        </button>
      </Card>
    </div>
  );
}
