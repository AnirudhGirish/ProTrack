import { useEffect, useState } from 'react';
import { employeeApi, filesApi } from '../api/endpoints';
import { StatCard, Card, Spinner, ErrorMessage, EmptyState, SectionHeader, ProgressBar } from '../components/common/UIComponents';
import type { File, EmployeeSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RefreshCw, CheckSquare, Clock, List, ChevronDown, UserPlus, AlertCircle, Inbox } from 'lucide-react';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  received: ['in_progress'],
  in_progress: ['under_review', 'closed'],
  under_review: ['approved', 'returned'],
  returned: ['in_progress'],
  approved: ['closed'],
  closed: [],
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  received:     { label: 'Received',     color: 'text-slate-600',  bg: 'bg-slate-100',  dot: 'bg-slate-400' },
  in_progress:  { label: 'In Progress',  color: 'text-blue-600',   bg: 'bg-blue-50',    dot: 'bg-blue-500' },
  under_review: { label: 'Under Review', color: 'text-amber-700',  bg: 'bg-amber-50',   dot: 'bg-amber-400' },
  returned:     { label: 'Returned',     color: 'text-red-600',    bg: 'bg-red-50',     dot: 'bg-red-500' },
  approved:     { label: 'Approved',     color: 'text-forest-600', bg: 'bg-forest-50',  dot: 'bg-forest-500' },
  closed:       { label: 'Closed',       color: 'text-slate-500',  bg: 'bg-slate-100',  dot: 'bg-slate-300' },
};

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  low:      { label: 'Low',      color: 'text-slate-500',  bg: 'bg-slate-100' },
  normal:   { label: 'Normal',   color: 'text-blue-600',   bg: 'bg-blue-50' },
  high:     { label: 'High',     color: 'text-amber-700',  bg: 'bg-amber-50' },
  critical: { label: 'Critical', color: 'text-red-700',    bg: 'bg-red-50' },
};

function StatusBadge({ status }: { status: string }) {
  const sm = STATUS_META[status] || STATUS_META.received;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sm.bg} ${sm.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
      {sm.label}
    </span>
  );
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<EmployeeSummary | null>(null);
  const [myTasks, setMyTasks] = useState<File[]>([]);
  const [sectionFiles, setSectionFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFile, setActionFile] = useState<string | null>(null);
  const [takingUp, setTakingUp] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my' | 'section'>('my');

  const fetchData = () => {
    setLoading(true);
    setError('');
    Promise.all([
      employeeApi.summary(),
      employeeApi.tasks(),
      employeeApi.sectionFiles(),
    ])
      .then(([sumRes, taskRes, secRes]) => {
        setSummary(sumRes.data);
        setMyTasks(taskRes.data);
        setSectionFiles(secRes.data);
      })
      .catch(err => setError(err.response?.data?.detail || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (fileId: string, toStatus: string) => {
    setActionFile(fileId);
    try {
      await filesApi.updateStatus(fileId, toStatus);
      toast.success(`Status updated → ${STATUS_META[toStatus]?.label || toStatus}`);
      fetchData();
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update status');
    } finally {
      setActionFile(null);
    }
  };

  const handleTakeUp = async (fileId: string, fileNo: string) => {
    setTakingUp(fileId);
    try {
      await employeeApi.selfAssign(fileId);
      toast.success(`✅ File ${fileNo} is now in your queue — marked In Progress`);
      fetchData();
      setActiveTab('my'); // Switch to My Files tab to see the taken file
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Could not take up file');
    } finally {
      setTakingUp(null);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  if (user?.role === 'admin') {
    return (
      <EmptyState
        title="Use the Admin Panel"
        description="Go to Admin → Files tab to manage and assign files. Use Dashboard for productivity analytics."
        icon={<CheckSquare className="w-8 h-8 text-slate-400" />}
      />
    );
  }

  const completionPct = (summary?.total ?? 0) > 0
    ? Math.round(((summary?.completed ?? 0) / (summary?.total ?? 1)) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">My Workspace</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {user?.section
              ? <><span className="font-semibold text-forest-600">{user.section}</span> · Your assigned files and section availability</>
              : 'Your assigned files and work queue'
            }
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition shadow-sm btn-press"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="My Files" value={summary?.total ?? 0} icon={<List className="w-4 h-4" />} />
        <StatCard label="In Progress" value={(summary as any)?.in_progress ?? 0} icon={<Clock className="w-4 h-4" />} variant="warning" />
        <StatCard label="Completed" value={summary?.completed ?? 0} icon={<CheckSquare className="w-4 h-4" />} variant="success" trendValue={`${completionPct}% rate`} trend={completionPct >= 80 ? 'up' : 'neutral'} />
        <StatCard label="Available" value={sectionFiles.length} icon={<Inbox className="w-4 h-4" />} variant="default" trendValue="in your section" />
      </div>

      {/* ── Tab Switch ── */}
      <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'my' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          My Files
          {myTasks.length > 0 && (
            <span className="ml-1 bg-forest-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {myTasks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('section')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'section' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Available in My Section
          {sectionFiles.length > 0 && (
            <span className="ml-1 bg-morning-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {sectionFiles.length}
            </span>
          )}
        </button>
      </div>

      {/* ── My Files Tab ── */}
      {activeTab === 'my' && (
        <Card>
          <SectionHeader title="My Assigned Files" action={
            <span className="text-xs text-slate-400 font-medium">{myTasks.length} file{myTasks.length !== 1 ? 's' : ''}</span>
          } />
          {myTasks.length === 0 ? (
            <EmptyState
              title="No files assigned to you"
              description={user?.section
                ? `Switch to "Available in My Section" to pick up files from ${user.section}.`
                : "Files assigned to you by admin or taken up by you will appear here."}
              icon={<CheckSquare className="w-8 h-8 text-slate-300" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File No</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Source</th>
                    <th className="text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map(task => {
                    const pm = PRIORITY_META[task.priority] || PRIORITY_META.normal;
                    const transitions = STATUS_TRANSITIONS[task.status] || [];
                    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'closed';
                    const selfAssigned = (task as any).assigned_by_self;
                    return (
                      <tr key={task.id}>
                        <td className="font-bold text-slate-800 font-mono text-xs">{task.file_no}</td>
                        <td>
                          <span className="text-sm text-slate-700 line-clamp-1 max-w-[200px] block" title={task.subject}>
                            {task.subject}
                          </span>
                        </td>
                        <td><StatusBadge status={task.status} /></td>
                        <td>
                          <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${pm.bg} ${pm.color}`}>
                            {pm.label}
                          </span>
                        </td>
                        <td>
                          {task.due_date ? (
                            <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
                              {isOverdue && '⚠ '}
                              {new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selfAssigned ? 'bg-morning-50 text-morning-700' : 'bg-slate-100 text-slate-500'}`}>
                            {selfAssigned ? '🙋 Self' : '👤 Admin'}
                          </span>
                        </td>
                        <td className="text-right">
                          {task.status !== 'closed' && transitions.length > 0 ? (
                            <div className="flex items-center justify-end gap-2">
                              {actionFile === task.id ? (
                                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-forest-500 animate-spin" />
                                  Updating…
                                </span>
                              ) : (
                                <div className="relative">
                                  <select
                                    className="appearance-none text-xs font-semibold text-morning-700 bg-morning-50 border border-morning-200 rounded-lg pl-3 pr-8 py-1.5 hover:bg-morning-100 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-morning-300"
                                    disabled={actionFile === task.id}
                                    onChange={e => { if (e.target.value) handleStatusChange(task.id, e.target.value); }}
                                    defaultValue=""
                                    key={task.status}
                                  >
                                    <option value="" disabled>Move to…</option>
                                    {transitions.map(s => (
                                      <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-morning-500 pointer-events-none" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300 font-medium">
                              {task.status === 'closed' ? '✓ Closed' : '—'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Section Files Tab ── */}
      {activeTab === 'section' && (
        <Card>
          <SectionHeader
            title={user?.section ? `Available in ${user.section}` : 'Available Section Files'}
            action={
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Unassigned files in your section</span>
              </div>
            }
          />
          {!user?.section ? (
            <EmptyState
              title="No section assigned to your account"
              description="Ask your admin to assign you to a section so you can see and take up files."
              icon={<AlertCircle className="w-8 h-8 text-amber-400" />}
            />
          ) : sectionFiles.length === 0 ? (
            <EmptyState
              title="No files available to take up"
              description={`All files in ${user.section} are either assigned or closed. Check back later.`}
              icon={<Inbox className="w-8 h-8 text-forest-400" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File No</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Initiated By</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionFiles.map(file => {
                    const pm = PRIORITY_META[file.priority] || PRIORITY_META.normal;
                    const isBeingTaken = takingUp === file.id;
                    return (
                      <tr key={file.id} className="hover:bg-morning-50/30 transition">
                        <td className="font-bold text-slate-800 font-mono text-xs">{file.file_no}</td>
                        <td>
                          <span className="text-sm text-slate-700 line-clamp-1 max-w-[200px] block" title={file.subject}>
                            {file.subject}
                          </span>
                        </td>
                        <td><StatusBadge status={file.status} /></td>
                        <td>
                          <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${pm.bg} ${pm.color}`}>
                            {pm.label}
                          </span>
                        </td>
                        <td className="text-slate-500 text-sm">
                          {file.created_date
                            ? new Date(file.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="text-slate-500 text-sm">{file.initiated_by || '—'}</td>
                        <td className="text-right">
                          <button
                            onClick={() => handleTakeUp(file.id, file.file_no)}
                            disabled={isBeingTaken || takingUp !== null}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-morning-700 bg-morning-50 hover:bg-morning-100 border border-morning-200 px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed btn-press"
                          >
                            {isBeingTaken ? (
                              <>
                                <div className="w-3 h-3 rounded-full border-2 border-morning-300 border-t-morning-600 animate-spin" />
                                Taking up…
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                Take Up
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ── Completion Progress ── */}
      {(summary?.total ?? 0) > 0 && (
        <div className="bg-gradient-to-r from-forest-50 to-morning-50 rounded-2xl border border-forest-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Your overall completion</p>
            <p className="text-lg font-extrabold font-mono text-forest-700">{completionPct}%</p>
          </div>
          <ProgressBar value={summary?.completed ?? 0} max={summary?.total ?? 1} color="forest" />
          <p className="text-xs text-slate-400 mt-2">{summary?.completed} of {summary?.total} files completed</p>
        </div>
      )}
    </div>
  );
}
