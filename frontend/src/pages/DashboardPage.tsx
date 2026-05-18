import { useEffect, useState } from 'react';
import { productivityApi, employeeApi } from '../api/endpoints';
import { StatCard, Card, Spinner, ErrorMessage, EmptyState, SectionHeader, ProgressBar } from '../components/common/UIComponents';
import type { DashboardData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, FileText, CheckCircle, Clock, TrendingUp, AlertTriangle, Award, Flame, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/* ── Employee Lite Dashboard ─────────────────── */
function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [sectionData, setSectionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      employeeApi.summary(),
      productivityApi.sections(),
    ])
      .then(([sumRes, secRes]) => {
        setSummary(sumRes.data);
        // Find this employee's section stats from the org data
        const allSections = secRes.data || [];
        const mySection = allSections.find((s: any) => s.section === user?.section);
        setSectionData(mySection || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.section]);

  if (loading) return <Spinner />;

  const myRate = summary?.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">
            Welcome, {user?.full_name?.split(' ')[0] || user?.username}
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {user?.section
              ? <><span className="font-semibold text-forest-600">{user.section}</span> · Personal productivity overview</>
              : 'Your personal productivity overview'}
          </p>
        </div>
        <button
          onClick={() => navigate('/my-tasks')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 text-white text-sm font-semibold transition shadow-md shadow-forest-600/20 btn-press hover:from-forest-700 hover:to-forest-800"
        >
          <CheckCircle className="w-4 h-4" />
          Go to My Tasks
        </button>
      </div>

      {/* Personal stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="My Total Files" value={summary?.total ?? 0} icon={<FileText className="w-4 h-4" />} />
        <StatCard label="In Progress" value={summary?.in_progress ?? 0} icon={<Clock className="w-4 h-4" />} variant="warning" />
        <StatCard label="Completed" value={summary?.completed ?? 0} icon={<CheckCircle className="w-4 h-4" />} variant="success" />
        <StatCard label="Completion Rate" value={`${myRate}%`} icon={<TrendingUp className="w-4 h-4" />} variant={myRate >= 80 ? 'success' : 'warning'} />
      </div>

      {/* Personal progress ring + Section stats side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Progress */}
        <Card>
          <SectionHeader title="My Progress" />
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-28 h-28 mb-5">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#empProgressGrad)" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - myRate / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="empProgressGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-slate-900">{myRate}%</span>
                <span className="text-xs text-slate-400">Complete</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Completed</span>
                  <span className="font-bold text-slate-700">{summary?.completed ?? 0}</span>
                </div>
                <ProgressBar value={summary?.completed ?? 0} max={summary?.total ?? 1} color="forest" />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Pending</span>
                  <span className="font-bold text-slate-700">{summary?.pending ?? 0}</span>
                </div>
                <ProgressBar value={summary?.pending ?? 0} max={summary?.total ?? 1} color="warning" />
              </div>
            </div>
          </div>
        </Card>

        {/* My Section Stats */}
        <Card>
          <SectionHeader
            title={user?.section ? `${user.section} Section` : 'Section Overview'}
            action={
              <span className="text-xs text-slate-400 font-medium">Your section's performance</span>
            }
          />
          {sectionData ? (
            <div className="space-y-4 pt-2">
              {[
                { label: 'Total Files', value: sectionData.total, color: 'text-slate-800' },
                { label: 'Completed', value: sectionData.completed, color: 'text-forest-700' },
                { label: 'Pending', value: sectionData.pending, color: 'text-amber-700' },
                { label: 'Avg Processing Time', value: `${sectionData.avg_processing_days ?? 'N/A'} days`, color: 'text-slate-600' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
              <div className="mt-2">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                  <span>Section completion</span>
                  <span className="font-bold text-slate-700">
                    {sectionData.total > 0 ? Math.round((sectionData.completed / sectionData.total) * 100) : 0}%
                  </span>
                </div>
                <ProgressBar value={sectionData.completed} max={sectionData.total || 1} color="forest" />
              </div>
            </div>
          ) : (
            <EmptyState
              title="No section data"
              description={user?.section ? "No files found for your section yet." : "You haven't been assigned to a section yet."}
              icon={<User className="w-8 h-8 text-slate-300" />}
            />
          )}
        </Card>
      </div>

      {/* Quick tip */}
      <div className="bg-gradient-to-r from-morning-50 to-forest-50 border border-morning-100 rounded-2xl p-4 flex items-start gap-3">
        <Award className="w-5 h-5 text-morning-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Tip: Pick up files from your section</p>
          <p className="text-xs text-slate-500 mt-0.5">
            Go to <strong>My Tasks → Available in My Section</strong> to see unassigned files you can take up and start working on immediately.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Admin / Full Dashboard ──────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();

  // Employees get their own lite dashboard
  if (user?.role === 'employee' || user?.role === 'readonly') {
    return <EmployeeDashboard />;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    productivityApi.dashboard()
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load dashboard'))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => fetchData()} />;
  if (!data) return <EmptyState title="No data available" description="Start by uploading files via the admin panel." />;

  const chartData = data.section_breakdown.map(s => ({
    name: s.section.length > 10 ? s.section.slice(0, 10) + '…' : s.section,
    Total: s.total,
    Completed: s.completed,
    Pending: s.pending,
  }));

  const pendingPct = data.total_files > 0 ? Math.round((data.pending / data.total_files) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">Productivity Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Live overview of department file performance and employee metrics</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition shadow-sm btn-press"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Files"
          value={data.total_files.toLocaleString()}
          icon={<FileText className="w-4 h-4" />}
          variant="default"
        />
        <StatCard
          label="Completed"
          value={data.completed.toLocaleString()}
          icon={<CheckCircle className="w-4 h-4" />}
          variant="success"
          trend="up"
          trendValue="On target"
        />
        <StatCard
          label="Pending"
          value={data.pending.toLocaleString()}
          icon={<Clock className="w-4 h-4" />}
          variant={pendingPct > 30 ? 'danger' : 'warning'}
          trend={pendingPct > 30 ? 'down' : 'neutral'}
          trendValue={`${pendingPct}% of total`}
        />
        <StatCard
          label="Completion Rate"
          value={`${data.completion_rate}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          variant={data.completion_rate >= 80 ? 'success' : 'warning'}
          trend={data.completion_rate >= 80 ? 'up' : 'down'}
          trendValue={data.completion_rate >= 80 ? 'Excellent' : 'Needs attention'}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <SectionHeader title="Section-wise Performance" />
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barSize={16} barGap={4}>
                <CartesianGrid strokeDasharray="2 4" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="Total" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title="No section data yet" description="Add files and assign them to sections." />
          )}
          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
            {[['bg-slate-200', 'Total'], ['bg-forest-500', 'Completed'], ['bg-amber-400', 'Pending']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm ${c}`} />
                <span className="text-xs text-slate-400 font-medium">{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Overall progress ring card */}
        <Card>
          <SectionHeader title="Overall Progress" />
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="url(#progressGrad)" strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - data.completion_rate / 100)}`}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold font-mono text-slate-900">{data.completion_rate}%</span>
                <span className="text-xs text-slate-400 font-medium">Complete</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {[
                { label: 'Completed', value: data.completed, total: data.total_files, color: 'forest' },
                { label: 'Pending', value: data.pending, total: data.total_files, color: 'warning' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>{row.label}</span>
                    <span className="font-bold text-slate-700">{row.value.toLocaleString()}</span>
                  </div>
                  <ProgressBar value={row.value} max={row.total} color={row.color} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Underperforming sections */}
        <Card>
          <SectionHeader
            title="Underperforming Sections"
            action={
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3 h-3" />
                {data.underperforming_sections.length} flagged
              </span>
            }
          />
          {data.underperforming_sections.length > 0 ? (
            <div className="space-y-3">
              {data.underperforming_sections.map(u => {
                const pct = u.total > 0 ? Math.round((u.pending / u.total) * 100) : 0;
                return (
                  <div key={u.section} className="p-4 rounded-xl bg-red-50/60 border border-red-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-red-800 text-sm">{u.section}</p>
                        <p className="text-xs text-red-400 mt-0.5">{u.reasons.join(' · ')}</p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2.5 py-1 rounded-full shrink-0 ml-2">
                        {u.pending}/{u.total} pending
                      </span>
                    </div>
                    <ProgressBar value={u.pending} max={u.total} color="danger" />
                    <p className="text-right text-xs text-red-500 font-medium mt-1">{pct}% backlog rate</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="All sections on track"
              description="No sections are below acceptable performance thresholds."
              icon={<CheckCircle className="w-8 h-8 text-forest-400" />}
            />
          )}
        </Card>

        {/* Employee leaderboard */}
        <Card>
          <SectionHeader
            title="Employee Leaderboard"
            action={
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-morning-600 bg-morning-50 px-2.5 py-1 rounded-full">
                <Award className="w-3 h-3" />
                Top performers
              </span>
            }
          />
          {data.employee_scores.length > 0 ? (
            <div className="space-y-2">
              {data.employee_scores.slice(0, 8).map((e, idx) => (
                <div key={e.employee_id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    idx === 0 ? 'bg-amber-100 text-amber-600' :
                    idx === 1 ? 'bg-slate-100 text-slate-500' :
                    idx === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-50 text-slate-400'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{e.employee_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <ProgressBar value={e.completed} max={e.total} color="forest" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">{e.productivity_score}</p>
                    <p className="text-xs text-slate-400">{e.completed}/{e.total}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No employee scores" description="Assign files to employees to see scores." />
          )}
        </Card>
      </div>

      {/* ── Old Pending Files ── */}
      <Card>
        <SectionHeader
          title="Aged Pending Files"
          action={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              <Flame className="w-3 h-3" />
              Requires attention
            </span>
          }
        />
        {data.old_pending_files.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>File No</th>
                  <th>Section</th>
                  <th>Current Assignee</th>
                  <th className="text-right">Days Overdue</th>
                </tr>
              </thead>
              <tbody>
                {data.old_pending_files.map(f => (
                  <tr key={f.file_no}>
                    <td className="font-semibold text-slate-800">{f.file_no}</td>
                    <td className="text-slate-600">{f.section}</td>
                    <td className="text-slate-500">{f.current_user || '— Unassigned'}</td>
                    <td className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                        f.pending_days > 30 ? 'bg-red-100 text-red-700' :
                        f.pending_days > 14 ? 'bg-amber-100 text-amber-700' :
                        'bg-orange-50 text-orange-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {f.pending_days}d
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No aged files" description="All pending files are within SLA timeframes." icon={<CheckCircle className="w-8 h-8 text-forest-400" />} />
        )}
      </Card>

      {/* ── Insights ── */}
      {data.insights.length > 0 && (
        <Card className="bg-gradient-to-br from-forest-50 to-morning-50 border-forest-100">
          <SectionHeader title="AI Insights" />
          <ul className="space-y-3">
            {data.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-forest-500 to-morning-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {insight}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
