import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, ArrowRight, Shield, BarChart3, Users } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate('/dashboard'); // ✅ Fixed: was '/'
    } catch (err: unknown) {
      const axiosErr = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(axiosErr || msg);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Real-time productivity analytics' },
    { icon: <Shield className="w-5 h-5" />, text: 'Government-grade security & RBAC' },
    { icon: <Users className="w-5 h-5" />, text: 'Multi-department file tracking' },
  ];

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative bg-gradient-to-br from-forest-900 via-forest-800 to-slate-900 p-12 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-morning-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-forest-500/5 rounded-full border border-forest-500/10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center shadow-lg shadow-forest-900/40 group-hover:shadow-forest-500/30 transition-shadow">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-bold font-heading text-lg leading-none tracking-tight">Forest eOffice</p>
              <p className="text-forest-300 text-xs font-medium mt-0.5">Productivity Monitoring System</p>
            </div>
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-8">
          <div className="animate-slide-up">
            <h1 className="text-5xl font-extrabold font-heading text-white leading-[1.1] mb-5">
              Empower Your<br />
              <span className="text-gradient-forest">Department</span>
            </h1>
            <p className="text-forest-200/80 text-lg leading-relaxed max-w-sm">
              Monitor file movements, track team performance, and eliminate bottlenecks — all from a single, secure platform.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3 animate-slide-up delay-200">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-forest-700/60 border border-forest-600/40 flex items-center justify-center text-forest-300 shrink-0 group-hover:bg-forest-600/60 transition">
                  {f.icon}
                </div>
                <span className="text-forest-100/80 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Live stats strip */}
          <div className="flex gap-6 pt-4 border-t border-white/10 animate-slide-up delay-300">
            {[['12k+', 'Files Tracked'], ['98%', 'Uptime SLA'], ['4 sec', 'Avg Response']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-white font-mono">{v}</p>
                <p className="text-xs text-forest-300/70 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="relative z-10 text-forest-400/60 text-xs animate-fade-in delay-500">
          Secured by JWT · Role-Based Access Control · Audit Logs
        </p>
      </div>

      {/* ── Right Login Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50 relative">
        {/* Top-right back link */}
        <Link to="/" className="absolute top-8 right-8 text-sm text-slate-500 hover:text-slate-700 font-medium transition flex items-center gap-1.5 group">
          <span className="group-hover:underline">Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="w-full max-w-[400px] animate-scale-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold font-heading text-slate-900">Forest eOffice</p>
              <p className="text-xs text-slate-500">Productivity Monitoring</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold font-heading text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 text-sm">Sign in with your official credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input pr-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-scale-in">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-semibold text-sm transition-all shadow-lg shadow-forest-600/25 hover:shadow-forest-700/30 btn-press btn-shimmer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
            Use your official Forest Department credentials.<br />
            Contact your administrator if you need access.
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link to="/privacy-policy" className="hover:text-slate-600 transition">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms-of-service" className="hover:text-slate-600 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
