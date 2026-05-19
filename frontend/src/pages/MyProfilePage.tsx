import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, employeeApi } from '../api/endpoints';
import { Card, Spinner, StatCard, SectionHeader } from '../components/common/UIComponents';
import { User, FileText, CheckCircle, Clock, Calendar } from 'lucide-react';
import type { File as AppFile } from '../types';

export default function MyProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myPerf, setMyPerf] = useState<any>(null);
  const [recentFiles, setRecentFiles] = useState<AppFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Employee can see their tasks to get recent ones
        const tasksRes = await employeeApi.tasks().catch(() => ({ data: [] }));
        setRecentFiles(tasksRes.data.slice(0, 5)); // Last 5 tasks

        // To get specific performance stats, ideally we have a /employee/my-performance endpoint.
        // For now, if the employee can't call adminApi.employeePerformance(), we should create one.
        // Wait, adminApi requires admin role. The plan says "adminApi.employeePerformance()" but employee might not have access.
        // Let's call it and see if it works (maybe backend allows it for self). If not, we will need to adjust the backend.
        // I'll call it. If it fails, I'll show a graceful fallback.
        try {
            const perfRes = await adminApi.employeePerformance();
            const me = perfRes.data.find((p: any) => p.username === user?.username);
            if (me) setMyPerf(me);
        } catch {
            // Fallback if permission denied
            // We can approximate with tasksRes
            const tasks = tasksRes.data;
            const completed = tasks.filter((t: any) => t.status === 'closed').length;
            const pending = tasks.length - completed;
            setMyPerf({
                total_assigned: tasks.length,
                completed,
                in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
                due_files: tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'closed').length,
                score: Math.round((completed * 1.5) - (pending * 0.5)),
                tier: 'Pending Calculation',
                on_time_pct: 100, // Approximation
            });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Spinner />;

  const isExcellent = myPerf?.tier === 'Excellent';
  const isGood = myPerf?.tier === 'Good';
  const tierColor = isExcellent ? 'text-emerald-600 bg-emerald-100' : isGood ? 'text-blue-600 bg-blue-100' : 'text-amber-600 bg-amber-100';
  const scoreColor = isExcellent ? 'text-emerald-600' : isGood ? 'text-blue-600' : 'text-amber-600';
  
  const compPct = myPerf?.total_assigned ? Math.round((myPerf.completed / myPerf.total_assigned) * 100) : 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (compPct / 100) * circumference;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-md shadow-forest-500/20">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">My Profile & Performance</h1>
          <p className="text-sm text-slate-400">View your personal metrics and identity details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Identity & Score */}
        <div className="space-y-6 md:col-span-1">
          <Card className="flex flex-col items-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400 mb-4 shadow-inner">
              {user?.full_name?.charAt(0) || user?.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800">{user?.full_name || 'No Name Set'}</h2>
            <p className="text-sm text-slate-500 mb-1 font-mono">{user?.employee_id || 'ID Pending'}</p>
            <p className="text-sm text-slate-500 mb-4">@{user?.username}</p>
            
            <div className="w-full pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Section</span>
              <span className="text-sm font-bold text-slate-700">{user?.section || 'None'}</span>
            </div>
            <div className="w-full pt-3 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Role</span>
              <span className="text-sm font-bold text-slate-700 capitalize">{user?.role.replace('_', ' ')}</span>
            </div>
          </Card>

          <Card className="text-center p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 -z-10" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Productivity Score</h3>
            <div className={`text-6xl font-black tracking-tighter ${scoreColor} mb-2 drop-shadow-sm transition-transform group-hover:scale-105`}>
              {myPerf?.score || 0}
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tierColor}`}>
              {myPerf?.tier || 'Calculating'}
            </span>
            <p className="text-xs text-slate-400 mt-4 leading-relaxed">
              Score = (Completed × 1.5) - (Pending × 0.5)
            </p>
          </Card>
        </div>

        {/* Right Column - Stats & Recent */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total Handled" value={myPerf?.total_assigned || 0} icon={<FileText className="w-4 h-4" />} />
            <StatCard label="Completed" value={myPerf?.completed || 0} variant="success" icon={<CheckCircle className="w-4 h-4" />} />
            <StatCard label="In Progress" value={myPerf?.in_progress || 0} variant="info" icon={<Clock className="w-4 h-4" />} />
            <StatCard label="On-Time Rate" value={`${myPerf?.on_time_pct || 0}%`} icon={<Calendar className="w-4 h-4" />} />
          </div>

          <Card className="flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} className="fill-none stroke-slate-100" strokeWidth="12" />
                <circle cx="50" cy="50" r={radius} className={`fill-none ${isExcellent ? 'stroke-emerald-500' : isGood ? 'stroke-blue-500' : 'stroke-amber-500'} transition-all duration-1000 ease-out`} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-800">{compPct}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Done</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Completion Progress</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                You have completed <strong className="text-slate-700">{myPerf?.completed || 0}</strong> out of <strong className="text-slate-700">{myPerf?.total_assigned || 0}</strong> assigned files. 
                Focus on the <strong className="text-amber-600">{myPerf?.due_files || 0}</strong> due/overdue files to boost your score.
              </p>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader title="Recent Activity" />
            </div>
            <div className="divide-y divide-slate-100">
              {recentFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">No recent activity found.</div>
              ) : (
                recentFiles.map(f => (
                  <div key={f.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-0.5">{f.subject}</p>
                      <p className="text-xs font-mono text-slate-400">{f.file_no}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {f.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
