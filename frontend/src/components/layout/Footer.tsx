import { Link } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-heading text-white tracking-tight">Forest eOffice</span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            A purpose-built productivity monitoring platform for Indian government forest departments — bringing real-time accountability to file management.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-300 transition group"
          >
            Access Portal <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link to="/data-processing-agreement" className="hover:text-white transition">Data Processing Agreement</Link></li>
          </ul>
        </div>

        {/* Security */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Security</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/security-architecture" className="hover:text-white transition">Security Architecture</Link></li>
            <li><Link to="/disaster-recovery" className="hover:text-white transition">Disaster Recovery</Link></li>
          </ul>
        </div>

        {/* Documentation */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm">Documentation</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/user-manual" className="hover:text-white transition">User Manual</Link></li>
            <li><Link to="/admin-manual" className="hover:text-white transition">Admin Manual</Link></li>
            <li><Link to="/api-documentation" className="hover:text-white transition">API Documentation</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {year} Karnataka Forest Department. All rights reserved.</p>
          <p className="text-slate-600">Built with security, scale, and accountability in mind.</p>
        </div>
      </div>
    </footer>
  );
}
