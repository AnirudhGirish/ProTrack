import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, FileText, Clock } from 'lucide-react';
import Footer from '../../components/layout/Footer';

interface DocLayoutProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  children: React.ReactNode;
  badge?: string;
}

export default function DocLayout({ title, subtitle, lastUpdated, children, badge }: DocLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* ── Doc Navbar ── */}
      <nav className="glass sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition font-medium text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-700 transition">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold font-heading text-slate-600 hidden sm:block">Forest eOffice</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero Header ── */}
      <div className="bg-gradient-to-br from-slate-50 to-white border-b border-slate-100 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-5 animate-fade-in">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-forest-50 to-morning-50 border border-forest-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-forest-600" />
            </div>
            {badge && (
              <span className="text-xs font-semibold text-morning-600 bg-morning-50 border border-morning-100 px-3 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-slate-900 tracking-tight mb-3 animate-slide-up">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed animate-slide-up delay-100">{subtitle}</p>
          )}
          <div className="flex items-center gap-2 mt-5 text-sm text-slate-400 animate-fade-in delay-200">
            <Clock className="w-4 h-4" />
            <span>Last updated: <strong className="text-slate-600">{lastUpdated}</strong></span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 md:py-16 animate-slide-up delay-100">
        <div className="prose prose-slate prose-lg max-w-none">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
