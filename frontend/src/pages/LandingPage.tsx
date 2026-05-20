import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Leaf, Shield, BarChart3, Clock, Lock, ArrowRight, CheckCircle2,
  Users, FileText, Zap, Globe, ChevronRight
} from 'lucide-react';
import Footer from '../components/layout/Footer';

const STATS = [
  { value: '12,000+', label: 'Files Tracked' },
  { value: '98.7%', label: 'System Uptime' },
  { value: '6', label: 'Departments Active' },
  { value: '< 4s', label: 'Avg. Query Time' },
];

const FEATURES = [
  {
    icon: <Clock className="w-7 h-7" />,
    title: 'Real-Time File Tracking',
    desc: 'Every movement, assignment, and status change is captured instantly. Eliminate the guesswork of where a file is at any given moment.',
    color: 'text-forest-600',
    bg: 'bg-forest-50',
    border: 'border-forest-100',
  },
  {
    icon: <BarChart3 className="w-7 h-7" />,
    title: 'Advanced Analytics',
    desc: 'Interactive dashboards and dynamic Quadrant Scatter Charts break down section performance, individual workloads, completion rates, and SLA compliance at a glance.',
    color: 'text-morning-600',
    bg: 'bg-morning-50',
    border: 'border-morning-100',
  },
  {
    icon: <Lock className="w-7 h-7" />,
    title: 'Bank-Grade Security',
    desc: 'JWT authentication, strict Role-Based Access Control, encrypted sessions, and comprehensive immutable audit logs for full accountability.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: 'AI-Powered Chatbot',
    desc: 'Ask natural language questions like "Which sections are underperforming?" and get instant, data-backed answers without running a single report.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  {
    icon: <Users className="w-7 h-7" />,
    title: 'Granular Productivity Metrics',
    desc: 'Algorithmic productivity scoring maps employees into performance tiers (Marvellous to Needs Improvement), while deep-dive modals separate Admin-assigned vs Self-taken workload.',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  {
    icon: <Globe className="w-7 h-7" />,
    title: 'Multi-Department Support',
    desc: 'Manage Legal & Land, Revenue, Environment, and all other sections from a single unified platform with section-level access controls.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
  },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload & Register Files', desc: 'Admins upload file records via CSV import or manual entry. Each file gets a unique ID, section tag, priority, and due date.' },
  { step: '02', title: 'Assign to Employees', desc: 'Files are assigned to department employees. Instant notifications are dispatched via the system notification center.' },
  { step: '03', title: 'Track Status in Real-Time', desc: 'Employees update file status through their task panel — Received → In Progress → Under Review → Approved → Closed.' },
  { step: '04', title: 'Analyse & Act', desc: 'The dashboard surfaces bottlenecks and maps employee performance tiers via dynamic scatter charts, empowering administrators to act before delays compound.' },
];

const TRUST_BADGES = [
  'JWT Authentication', 'RBAC Enforced', 'Audit Logs', 'TLS 1.3 Encrypted', 'GDPR Compliant', 'ISO 27001 Aligned',
];

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans overflow-x-hidden">
      {/* ═══════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════ */}
      <nav className="fixed w-full z-50 glass px-6 py-3.5 flex justify-between items-center animate-fade-in">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-md shadow-forest-600/20 group-hover:shadow-forest-600/30 transition-shadow">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-[1.05rem] font-bold font-heading text-slate-900 tracking-tight">Forest eOffice</span>
        </Link>

        <div className="flex items-center gap-4">
          <a href="#features" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition">Features</a>
          <a href="#how-it-works" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition">How it works</a>
          {token ? (
            <Link
              to="/dashboard"
              id="goto-dashboard-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-semibold text-sm transition shadow-md shadow-forest-600/20 btn-press btn-shimmer"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              to="/login"
              id="sign-in-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm transition shadow-md btn-press"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0fdf420_1px,transparent_1px),linear-gradient(to_bottom,#f0fdf420_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

        {/* Decorative blobs */}
        <div className="absolute top-24 right-[10%] w-72 h-72 bg-forest-300/30 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute top-32 left-[5%] w-64 h-64 bg-morning-300/20 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-forest-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forest-50 border border-forest-100 text-forest-700 text-sm font-semibold animate-fade-in">
              <Shield className="w-4 h-4" />
              Government-Grade Productivity Monitoring
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold font-heading text-slate-900 leading-[1.05] animate-slide-up">
              Modernise Your<br />
              Department With{' '}
              <span className="text-gradient">Intelligent</span>{' '}
              File Tracking
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
              Forest eOffice eliminates file bottlenecks, surfaces hidden delays, and empowers leadership with real-time insights — purpose-built for government departments.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-slide-up delay-200">
              <Link
                to={token ? '/dashboard' : '/login'}
                id="hero-get-started-btn"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-bold text-base transition shadow-xl shadow-forest-600/25 hover:shadow-forest-700/30 btn-press btn-shimmer w-full sm:w-auto justify-center"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base transition shadow-md border border-slate-200 w-full sm:w-auto justify-center"
              >
                See How It Works
              </a>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 animate-fade-in delay-300">
              {TRUST_BADGES.map(b => (
                <span key={b} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-3 py-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-500" />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Hero dashboard preview card */}
          <div className="mt-16 max-w-3xl mx-auto animate-slide-up delay-300">
            <div className="glass-card rounded-3xl p-6 border border-slate-200/60 shadow-2xl shadow-slate-300/30">
              <div className="flex items-center gap-3 mb-5 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-xs text-slate-400 bg-slate-100 px-4 py-1 rounded-full font-medium">System Insights — Live Dashboard</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Total Files', value: '1,284', color: 'text-slate-800' },
                  { label: 'Completed', value: '1,089', color: 'text-forest-600' },
                  { label: 'Pending', value: '195', color: 'text-amber-600' },
                  { label: 'Completion', value: '84.8%', color: 'text-morning-600' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5">
                {[
                  { section: 'Legal & Land', pct: 92, color: 'bg-gradient-to-r from-forest-400 to-forest-600' },
                  { section: 'Revenue Department', pct: 78, color: 'bg-gradient-to-r from-morning-400 to-morning-600' },
                  { section: 'Environment Wing', pct: 85, color: 'bg-gradient-to-r from-teal-400 to-teal-600' },
                  { section: 'Wildlife Division', pct: 61, color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
                ].map(row => (
                  <div key={row.section} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-36 shrink-0 font-medium">{row.section}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right">{row.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════ */}
      <section className="bg-slate-900 py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl font-extrabold font-mono text-white">{s.value}</p>
              <p className="text-sm text-slate-400 font-medium mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES SECTION
      ═══════════════════════════════════════ */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-forest-600 uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl font-extrabold font-heading text-slate-900 mb-4">Everything you need to run a lean, accountable department</h2>
            <p className="text-slate-500 text-lg">Purpose-built for Indian government departments with unique workflow requirements and strict compliance mandates.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`p-7 rounded-2xl border ${f.border} ${f.bg} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm border ${f.border} ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-morning-600 uppercase tracking-widest mb-3">Process</p>
            <h2 className="text-4xl font-extrabold font-heading text-slate-900 mb-4">From upload to insight in four steps</h2>
            <p className="text-slate-500 text-lg">A simple, structured workflow that brings clarity to even the most complex multi-department file routing.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-0" />
                )}
                <div className="relative z-10 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-500 to-morning-600 flex items-center justify-center mb-5 shadow-md shadow-forest-600/20">
                    <span className="text-white font-bold font-mono text-sm">{step.step}</span>
                  </div>
                  <h3 className="font-bold font-heading text-slate-900 mb-2 text-base">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          DOCUMENT LINKS SECTION
      ═══════════════════════════════════════ */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Documentation & Compliance</p>
            <h2 className="text-3xl font-extrabold font-heading text-slate-900">Complete transparency, documented</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'User Manual', to: '/user-manual', icon: <FileText className="w-5 h-5" />, desc: 'Step-by-step guide for end users' },
              { label: 'Admin Manual', to: '/admin-manual', icon: <Shield className="w-5 h-5" />, desc: 'System administration guide' },
              { label: 'Privacy Policy', to: '/privacy-policy', icon: <Lock className="w-5 h-5" />, desc: 'How we handle your data' },
              { label: 'Terms of Service', to: '/terms-of-service', icon: <FileText className="w-5 h-5" />, desc: 'Usage terms and conditions' },
              { label: 'Security Architecture', to: '/security-architecture', icon: <Shield className="w-5 h-5" />, desc: 'Technical security framework' },
              { label: 'API Documentation', to: '/api-documentation', icon: <Zap className="w-5 h-5" />, desc: 'Developer integration guide' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-forest-200 hover:bg-forest-50/50 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-forest-100 flex items-center justify-center text-slate-500 group-hover:text-forest-600 transition">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-forest-800 transition">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-forest-500 transition" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gradient-to-br from-forest-900 via-forest-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-forest-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-extrabold font-heading text-white mb-4">Ready to transform your department?</h2>
          <p className="text-forest-200/80 text-lg mb-8 leading-relaxed">
            Join departments that have cut file processing delays by an average of 43% in their first quarter with Forest eOffice.
          </p>
          <Link
            to={token ? '/dashboard' : '/login'}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-forest-800 font-bold text-base hover:bg-forest-50 transition shadow-2xl btn-press"
          >
            {token ? 'Go to Dashboard' : 'Get Started Now'}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
