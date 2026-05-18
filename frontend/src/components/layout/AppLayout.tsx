import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { notificationsApi } from '../../api/endpoints';
import { Bell, LogOut, LayoutDashboard, CheckSquare, Shield, Leaf, Menu, X, ChevronDown } from 'lucide-react';
import Footer from './Footer';
import FloatingChatbot from '../chat/FloatingChatbot';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    notificationsApi.count().then(r => setUnreadCount(r.data.unread)).catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.count().then(r => setUnreadCount(r.data.unread)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/'); // ✅ Fixed: was '/login'
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['admin', 'employee'] },
    { name: 'My Tasks', path: '/my-tasks', icon: <CheckSquare className="w-4 h-4" />, roles: ['employee'] },
    { name: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4" />, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(l => l.roles.includes(user?.role || ''));
  const initials = (user?.full_name || user?.username || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-morning-200 selection:text-morning-900">
      {/* ── Top Navigation ── */}
      <nav className="sticky top-0 z-40 glass border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo + Nav Links */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-md shadow-forest-600/20 group-hover:shadow-forest-600/30 transition-shadow">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-[1.05rem] font-bold font-heading text-slate-900 tracking-tight hidden sm:block">
                  Forest eOffice
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center gap-1">
                {visibleLinks.map(link => {
                  const active = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'text-forest-700 bg-forest-50'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      {link.icon}
                      {link.name}
                      {active && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-forest-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link
                to="/notifications"
                className={`relative p-2.5 rounded-xl transition-all ${
                  location.pathname === '/notifications'
                    ? 'bg-morning-50 text-morning-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile dropdown */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setProfileOpen(v => !v)}
                  className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition group"
                >
                  <div className="flex flex-col items-end leading-none">
                    <span className="text-sm font-semibold text-slate-800">{user?.full_name?.split(' ')[0] || user?.username}</span>
                    <span className="text-xs text-slate-400 capitalize mt-0.5">{user?.role}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-morning-400 to-morning-600 flex items-center justify-center text-white text-xs font-bold shadow ring-2 ring-white">
                    {initials}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-100 overflow-hidden animate-scale-in z-50">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.full_name || user?.username}</p>
                      <p className="text-xs text-slate-400 capitalize">{user?.role} · {user?.section || 'All Sections'}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                onClick={() => setMobileMenuOpen(v => !v)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-x-0 top-16 bg-white border-b border-slate-100 shadow-xl animate-slide-up z-50 px-4 py-4 space-y-1">
            {visibleLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  location.pathname === link.path
                    ? 'bg-forest-50 text-forest-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="border-t border-slate-100 mt-2 pt-2">
              <div className="flex items-center gap-3 px-4 py-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-morning-400 to-morning-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user?.full_name || user?.username}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {user && <FloatingChatbot />}
      <Footer />
    </div>
  );
}
