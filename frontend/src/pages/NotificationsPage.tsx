import { useEffect, useState } from 'react';
import { notificationsApi } from '../api/endpoints';
import { Card, Spinner, EmptyState } from '../components/common/UIComponents';
import type { Notification } from '../types';
import toast from 'react-hot-toast';
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  file_overdue: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
  },
  file_assigned: {
    icon: <Info className="w-4 h-4" />,
    color: 'text-morning-600',
    bg: 'bg-morning-50',
    border: 'border-morning-100',
  },
  status_update: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'text-forest-600',
    bg: 'bg-forest-50',
    border: 'border-forest-100',
  },
  default: {
    icon: <Bell className="w-4 h-4" />,
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
  },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.list({ page_size: 50 })
      .then(r => setNotifs(r.data.items))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    await notificationsApi.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-50 border border-forest-100 text-forest-700 hover:bg-forest-100 text-sm font-semibold transition btn-press"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {notifs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No notifications"
              description="You're all caught up! New notifications will appear here."
              icon={<Bell className="w-8 h-8 text-slate-300" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifs.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-5 transition-colors ${
                    !n.is_read ? 'bg-slate-50/80' : 'bg-white'
                  } hover:bg-slate-50 animate-slide-up`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                          {!n.is_read && (
                            <span className="ml-2 inline-block w-2 h-2 rounded-full bg-forest-500 animate-pulse-slow" />
                          )}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-slate-300" />
                          <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                            {n.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className="shrink-0 text-xs font-semibold text-forest-600 hover:text-forest-800 hover:bg-forest-50 px-3 py-1.5 rounded-lg transition border border-forest-100"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {notifs.length > 0 && (
        <p className="text-center text-xs text-slate-300 font-medium">
          Showing {notifs.length} most recent notifications
        </p>
      )}
    </div>
  );
}
