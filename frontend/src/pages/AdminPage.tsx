import { useEffect, useState, type FormEvent } from 'react';
import { adminApi, filesApi, assignmentsApi, productivityApi } from '../api/endpoints';
import { Card, Spinner, StatCard, SectionHeader } from '../components/common/UIComponents';
import type { User, File as AppFile } from '../types';
import toast from 'react-hot-toast';
import { Users, FileText, CheckCircle, Clock, Upload, Download, Trash2, Plus, Shield, UserCheck, ChevronDown, Edit2, BarChart2, Layers } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

type AdminTab = 'overview' | 'files' | 'employees' | 'sections' | 'users' | 'import';

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <BarChart2 className="w-4 h-4" /> },
  { key: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> },
  { key: 'employees', label: 'Employees', icon: <UserCheck className="w-4 h-4" /> },
  { key: 'sections', label: 'Sections', icon: <Layers className="w-4 h-4" /> },
  { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { key: 'import', label: 'Data Import/Export', icon: <Download className="w-4 h-4" /> },
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
  const [sections, setSections] = useState<{id: string, name: string}[]>([]);
  const [empPerformance, setEmpPerformance] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [sectionBreakdown, setSectionBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [
        statsRes, filesRes, usersRes, sectionsRes, empPerfRes, trendRes, secBreakdownRes
      ] = await Promise.all([
        adminApi.stats().catch(() => ({ data: {} })),
        filesApi.list({ page_size: 100 }).catch(() => ({ data: { items: [] } })),
        adminApi.listUsers({ page_size: 100 }).catch(() => ({ data: { items: [] } })),
        adminApi.getSections().catch(() => ({ data: [] })),
        adminApi.employeePerformance().catch(() => ({ data: [] })),
        adminApi.monthlyTrend().catch(() => ({ data: [] })),
        productivityApi.sections().catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data as Record<string, number>);
      setFiles(filesRes.data.items);
      setUsers(usersRes.data.items);
      setSections(sectionsRes.data);
      setEmpPerformance(empPerfRes.data);
      setMonthlyTrend(trendRes.data);
      setSectionBreakdown(secBreakdownRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
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
      <div className="flex flex-wrap gap-1 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
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
      {tab === 'overview' && (
        <OverviewTab 
          stats={stats} 
          empPerformance={empPerformance} 
          sectionBreakdown={sectionBreakdown} 
          monthlyTrend={monthlyTrend} 
        />
      )}
      {tab === 'files' && <FilesTab files={files} users={users} sections={sections} refresh={fetchAll} />}
      {tab === 'employees' && <EmployeesTab performance={empPerformance} />}
      {tab === 'sections' && <SectionsTab sections={sections} breakdown={sectionBreakdown} refresh={fetchAll} />}
      {tab === 'users' && <UsersTab users={users} sections={sections} refresh={fetchAll} />}
      {tab === 'import' && <ImportTab />}
    </div>
  );
}

/* ─── Overview Tab ──────────────────────────── */
function OverviewTab({ stats, empPerformance, sectionBreakdown, monthlyTrend }: { stats: any, empPerformance: any[], sectionBreakdown: any[], monthlyTrend: any[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Files" value={stats.total_files ?? 0} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="Completed" value={stats.completed ?? 0} variant="success" icon={<CheckCircle className="w-4 h-4" />} />
        <StatCard label="Pending" value={stats.pending ?? 0} variant="warning" icon={<Clock className="w-4 h-4" />} />
        <StatCard label="Active Users" value={stats.total_users ?? 0} icon={<Users className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <SectionHeader title="Pending vs Completed by Section" />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="section" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="pending" name="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <SectionHeader title="File Volume Trend (Last 12 Months)" />
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="intake" name="Intake" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="disposal" name="Disposal" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Employee Performance Quadrant" action={
          <span className="text-xs text-slate-400">Score vs Total Files</span>
        } />
        <div className="h-96 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis type="number" dataKey="total_assigned" name="Total Files" tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="score" name="Score" tick={{ fontSize: 12 }} />
              <ZAxis type="number" range={[100, 400]} />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-md border border-slate-100">
                        <p className="font-bold text-slate-800">{data.username}</p>
                        <p className="text-sm text-slate-600">Tier: <span className="font-semibold">{data.tier}</span></p>
                        <p className="text-sm text-slate-600">Score: <span className="font-semibold">{data.score}</span></p>
                        <p className="text-sm text-slate-600">Total Files: <span className="font-semibold">{data.total_assigned}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={4} stroke="#cbd5e1" strokeDasharray="3 3" />
              <ReferenceLine y={6} stroke="#cbd5e1" strokeDasharray="3 3" />
              <ReferenceLine y={8} stroke="#cbd5e1" strokeDasharray="3 3" />
              <Scatter name="Employees" data={empPerformance} shape="circle">
                {empPerformance.map((entry, index) => {
                  let fill = '#ef4444';
                  if (entry.tier === 'Marvellous') fill = '#8b5cf6';
                  else if (entry.tier === 'Excellent') fill = '#10b981';
                  else if (entry.tier === 'Good') fill = '#3b82f6';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500"></span>Marvellous (≥8)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Excellent (≥6)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span>Good (≥4)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span>Needs Imp. (&lt;4)</div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Files Tab ─────────────────────────────── */
function FilesTab({ files, users, sections, refresh }: { files: AppFile[]; users: User[], sections: any[], refresh: () => void }) {
  const [form, setForm] = useState({
    file_no: '', subject: '', section: '', status: 'received', priority: 'normal', created_date: '',
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningFile, setAssigningFile] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, { name: string; id: string }>>({});
  const [search, setSearch] = useState('');

  // Load assignments
  useEffect(() => {
    assignmentsApi.list().then(res => {
      const map: Record<string, { name: string; id: string }> = {};
      for (const a of (res.data || [])) {
        map[a.file_id] = { name: a.employee_name, id: a.employee_id };
      }
      setAssignments(map);
    }).catch(() => {});
  }, [files]);

  const employees = users.filter(u => u.role === 'employee' && u.is_active);
  const filteredFiles = files.filter(f => 
    (f.file_no?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (f.subject?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (f.section?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.file_no.trim() || !form.subject.trim() || !form.section) {
      toast.error('File No, Subject, and Section are required');
      return;
    }
    setSaving(true);
    try {
      await filesApi.create({ ...form, created_date: form.created_date || new Date().toISOString().split('T')[0] });
      toast.success('File created successfully');
      setForm({ file_no: '', subject: '', section: '', status: 'received', priority: 'normal', created_date: '' });
      refresh();
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.detail || 'Failed to create file');
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
      refresh();
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
      setAssignments(prev => ({ ...prev, [fileId]: { name: empName, id: employeeId } }));
    } catch (err: unknown) {
      toast.error((err as any)?.response?.data?.detail || 'Failed to assign file');
    } finally {
      setAssigningFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add File Form */}
      <Card>
        <SectionHeader title="Add New File" />
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
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="form-select">
                <option value="">Select section...</option>
                {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
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
        <div className="p-6 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SectionHeader title={`All Files (${filteredFiles.length})`} />
          <input 
            type="text" 
            placeholder="Search files..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="form-input w-full sm:w-64"
          />
        </div>
        <div className="overflow-auto max-h-[600px] mt-4">
          <table className="data-table">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                <th>File No</th>
                <th>Subject</th>
                <th>Section</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>Assign Employee</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map(f => {
                const currentAssignee = assignments[f.id];
                const isAssigning = assigningFile === f.id;
                // Filter employees for this specific file's section
                const sectionEmps = employees.filter(e => e.section === f.section);
                
                return (
                  <tr key={f.id}>
                    <td className="font-bold text-slate-800 font-mono text-xs">{f.file_no}</td>
                    <td className="max-w-[160px]">
                      <span className="block truncate text-slate-700 text-sm" title={f.subject}>{f.subject}</span>
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
                            {sectionEmps.map(emp => (
                              <option key={emp.id} value={emp.id}>
                                {emp.full_name || emp.username}
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

/* ─── Employees Tab ─────────────────────────── */
function EmployeesTab({ performance }: { performance: any[] }) {
  const [search, setSearch] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [empFiles, setEmpFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const handleRowClick = async (emp: any) => {
    setSelectedEmp(emp);
    setLoadingFiles(true);
    try {
      const res = await adminApi.getEmployeeFiles(emp.id);
      setEmpFiles(res.data);
    } catch (err) {
      toast.error('Failed to load employee files');
      setEmpFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const filtered = performance.filter(p => 
    (p.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (p.employee_id?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <Card className="p-0">
      <div className="p-6 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SectionHeader title={`Employee Performance (${filtered.length})`} />
        <input 
          type="text" 
          placeholder="Search by name or ID..." 
          value={search} 
          onChange={e => setSearch(e.target.value)}
          className="form-input w-full sm:w-64"
        />
      </div>
      <div className="overflow-auto mt-4">
        <table className="data-table">
          <thead className="bg-slate-50 border-y border-slate-200">
            <tr>
              <th>Employee</th>
              <th>Section</th>
              <th>Assigned (By Admin)</th>
              <th>Self Taken</th>
              <th>Total Files</th>
              <th>Completed</th>
              <th>In Progress</th>
              <th>Due (Untouched)</th>
              <th>On-Time %</th>
              <th>Score</th>
              <th>Tier</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.employee_id} onClick={() => handleRowClick(p)} className="cursor-pointer hover:bg-slate-50 transition">
                <td>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{p.full_name || p.username}</span>
                    <span className="text-xs text-slate-400 font-mono">{p.employee_id}</span>
                  </div>
                </td>
                <td className="text-sm text-slate-600">{p.section}</td>
                <td className="font-semibold text-slate-700">{p.assigned_by_admin}</td>
                <td className="text-slate-600">{p.self_taken}</td>
                <td className="font-bold text-slate-800">{p.total_assigned}</td>
                <td className="text-emerald-600 font-semibold">{p.completed}</td>
                <td className="text-blue-600">{p.in_progress}</td>
                <td className={`font-semibold ${p.due_files > 0 ? 'text-red-500' : 'text-slate-500'}`}>{p.due_files}</td>
                <td className="font-semibold">{p.on_time_pct}%</td>
                <td className="font-black text-slate-800">{p.score}</td>
                <td>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    p.tier === 'Marvellous' ? 'bg-purple-100 text-purple-800' :
                    p.tier === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                    p.tier === 'Good' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {p.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedEmp(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{selectedEmp.full_name || selectedEmp.username}</h2>
                <p className="text-sm text-slate-500">Employee Files Overview</p>
              </div>
              <button onClick={() => setSelectedEmp(null)} className="text-slate-400 hover:text-slate-600 p-2">✕</button>
            </div>
            
            <div className="p-6 overflow-auto flex-1 bg-slate-50/50">
              {loadingFiles ? (
                <div className="flex justify-center items-center h-40">
                  <Spinner />
                </div>
              ) : empFiles.length === 0 ? (
                <div className="text-center text-slate-500 py-10 font-medium bg-white rounded-xl border border-dashed border-slate-300">No files assigned.</div>
              ) : (
                <table className="data-table bg-white rounded-xl shadow-sm border border-slate-200">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th>File No</th>
                      <th>Subject</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empFiles.map(f => (
                      <tr key={f.id}>
                        <td className="font-mono text-xs">{f.file_no}</td>
                        <td className="font-semibold text-slate-700">{f.subject}</td>
                        <td>
                          {f.assigned_by_self ? (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">Self Taken</span>
                          ) : (
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">Assigned</span>
                          )}
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${STATUS_COLORS[f.status] || 'bg-slate-100 text-slate-700'}`}>
                            {f.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${f.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                            {f.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ─── Sections Tab ──────────────────────────── */
function SectionsTab({ sections, breakdown, refresh }: { sections: any[], breakdown: any[], refresh: () => void }) {
  const [newSec, setNewSec] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSec.trim()) return;
    setAdding(true);
    try {
      await adminApi.addSection(newSec);
      toast.success('Section added');
      setNewSec('');
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to add section');
    } finally { setAdding(false); }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete section "${name}"?`)) return;
    try {
      await adminApi.deleteSection(name);
      toast.success('Section deleted');
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to delete section');
    }
  };

  // Merge sections list with stats from breakdown
  const combined = sections.map(s => {
    const b = breakdown.find(x => x.section === s.name) || {
      total: 0, completed: 0, pending: 0, avg_processing_days: 0, score: 0
    };
    const compPct = b.total ? Math.round((b.completed / b.total) * 100) : 0;
    const score = Math.round((compPct * 0.6) + 40); // Simple UI approximation
    return { ...s, ...b, compPct, score };
  });

  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader title="Manage Sections" />
        <form onSubmit={handleAdd} className="flex gap-4 mt-4 max-w-md">
          <input 
            value={newSec} 
            onChange={e => setNewSec(e.target.value)}
            placeholder="New section name..." 
            className="form-input flex-1" 
          />
          <button type="submit" disabled={adding || !newSec.trim()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 disabled:opacity-50 transition btn-press">
            {adding ? 'Adding...' : 'Add Section'}
          </button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {combined.map(sec => (
          <div key={sec.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-slate-800 text-lg">{sec.name}</h3>
              <button onClick={() => handleDelete(sec.name)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Completion Rate</p>
                <p className="text-xl font-bold text-slate-800">{sec.compPct}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Avg Processing</p>
                <p className="text-xl font-bold text-slate-800">{sec.avg_processing_days ? `${sec.avg_processing_days} days` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Total Files</p>
                <p className="text-xl font-bold text-slate-800">{sec.total}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-1 uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-amber-600">{sec.pending}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
              <span className="text-sm font-semibold text-slate-500">Section Score</span>
              <span className="text-3xl font-black text-forest-600">{sec.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Users Tab ─────────────────────────────── */
function UsersTab({ users, sections, refresh }: { users: User[], sections: any[], refresh: () => void }) {
  const [form, setForm] = useState({ username: '', password: '', role: 'employee', employee_id: '', section: '', full_name: '' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<User | null>(null);

  const filtered = users.filter(u => 
    (u.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.full_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.section?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (u.role?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.password) { toast.error('Username and password are required'); return; }
    setSaving(true);
    try {
      await adminApi.createUser(form as any);
      toast.success(`User "${form.username}" created`);
      setForm({ username: '', password: '', role: 'employee', employee_id: '', section: '', full_name: '' });
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await adminApi.updateUser(editUser.id, editUser);
      toast.success('User updated');
      setEditUser(null);
      refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Failed to update user');
    }
  };

  const handleDeactivate = async (id: string, currentStatus: boolean) => {
    try {
      await adminApi.updateUser(id, { is_active: !currentStatus });
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'}`);
      refresh();
    } catch {
      toast.error('Failed to change user status');
    }
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
        <SectionHeader title="Add New User" />
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
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })} className="form-select">
                <option value="">Select section...</option>
                {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
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
        <div className="p-6 pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SectionHeader title={`System Users (${filtered.length})`} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="form-input w-full sm:w-64"
          />
        </div>
        <div className="overflow-auto mt-4">
          <table className="data-table">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Section</th>
                <th>Employee ID</th>
                <th>Status</th>
                <th className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.is_active ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditUser(u)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeactivate(u.id, u.is_active)} className={`p-1.5 rounded-lg transition ${u.is_active ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                        {u.is_active ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Edit User</h3>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input value={editUser.full_name || ''} onChange={e => setEditUser({...editUser, full_name: e.target.value})} className="form-input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
                <select value={editUser.role} onChange={e => setEditUser({...editUser, role: e.target.value as any})} className="form-select">
                  <option value="employee">Employee</option>
                  <option value="section_head">Section Head</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section</label>
                <select value={editUser.section || ''} onChange={e => setEditUser({...editUser, section: e.target.value})} className="form-select">
                  <option value="">None</option>
                  {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-forest-600 text-white font-semibold hover:bg-forest-700">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
      toast.error((err as any)?.response?.data?.detail || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (type: 'files' | 'employees' | 'sections') => {
    try {
      const call = type === 'files' ? adminApi.exportCsv() :
                   type === 'employees' ? adminApi.exportEmployeesCsv() :
                   adminApi.exportSectionsCsv();
                   
      const res = await call;
      // Ensure the Blob has the correct CSV MIME type
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      
      // Use standard modern approach for blob downloading
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.setAttribute('download', `${type}_export_data.csv`);
      document.body.appendChild(a); 
      
      // Programmatically click
      a.click(); 
      
      // Cleanup with slight delay to ensure browser registers the click before removal
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 500);
      
      toast.success(`CSV downloaded (${type})`);
    } catch { toast.error(`Export failed for ${type}`); }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <SectionHeader title="Import CSV" />
        <p className="text-sm text-slate-500 mb-6">
          Upload a CSV file to bulk-import files into the system. The file should include columns:
          <code className="ml-1 text-xs bg-slate-100 text-morning-700 px-1.5 py-0.5 rounded font-mono">file_no, subject, section, priority, status, created_date</code>
        </p>

        <label
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragOver ? 'border-forest-400 bg-forest-50' : uploading ? 'border-slate-200 bg-slate-50 cursor-wait' : 'border-slate-200 bg-slate-50 hover:border-forest-300 hover:bg-forest-50/50'
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
          <input type="file" accept=".csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} className="hidden" disabled={uploading} />
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

      <Card>
        <SectionHeader title="Export Data" />
        <p className="text-sm text-slate-500 mb-5">Download system data for external reporting and analysis.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button onClick={() => handleExport('files')} className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold text-sm transition shadow-sm btn-press">
            <Download className="w-4 h-4 text-slate-500" /> Export Files
          </button>
          <button onClick={() => handleExport('employees')} className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold text-sm transition shadow-sm btn-press">
            <Download className="w-4 h-4 text-slate-500" /> Export Employees
          </button>
          <button onClick={() => handleExport('sections')} className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold text-sm transition shadow-sm btn-press">
            <Download className="w-4 h-4 text-slate-500" /> Export Sections
          </button>
        </div>
      </Card>
    </div>
  );
}
