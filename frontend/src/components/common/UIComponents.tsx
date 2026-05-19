import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/* ─── Spinner ─────────────────────────────────── */
export function Spinner() {
  return (
    <div className="flex items-center justify-center p-10">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-forest-500 border-r-morning-500 animate-spin" />
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="relative w-14 h-14 mx-auto">
          <div className="absolute inset-0 rounded-full border-[3px] border-slate-100" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-forest-500 border-r-morning-500 animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-medium animate-pulse">Loading…</p>
      </div>
    </div>
  );
}

/* ─── Error Message ───────────────────────────── */
export function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center shadow-sm">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-700 font-medium mb-1">Something went wrong</p>
      <p className="text-red-500 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition btn-press"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

/* ─── Empty State ─────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
        {icon ?? (
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-5 max-w-xs mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-600 text-white text-sm font-medium hover:bg-forest-700 transition btn-press shadow-sm shadow-forest-600/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/* ─── Card ────────────────────────────────────── */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/60 p-6 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Badge ───────────────────────────────────── */
export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const styles: Record<string, string> = {
    default: 'bg-slate-100 text-slate-600 ring-slate-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    info: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        variant === 'success' ? 'bg-emerald-500' :
        variant === 'warning' ? 'bg-amber-500' :
        variant === 'danger' ? 'bg-red-500' :
        variant === 'info' ? 'bg-indigo-500' :
        'bg-slate-400'
      }`} />
      {children}
    </span>
  );
}

/* ─── Stat Card ───────────────────────────────── */
export function StatCard({
  label,
  value,
  variant = 'default',
  icon,
  trend,
  trendValue,
}: {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}) {
  const topBorder: Record<string, string> = {
    default: 'before:bg-gradient-to-r before:from-morning-400 before:to-morning-600',
    success: 'before:bg-gradient-to-r before:from-forest-400 before:to-forest-600',
    warning: 'before:bg-gradient-to-r before:from-amber-400 before:to-orange-500',
    danger: 'before:bg-gradient-to-r before:from-red-400 before:to-rose-500',
    info: 'before:bg-gradient-to-r before:from-indigo-400 before:to-blue-500',
  };
  const valueColor: Record<string, string> = {
    default: 'text-slate-900',
    success: 'text-forest-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    info: 'text-indigo-700',
  };
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-forest-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div className={`relative bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden card-hover
      before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] ${topBorder[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            {icon}
          </div>
        )}
      </div>
      <p className={`text-3xl font-bold font-mono tracking-tight ${valueColor[variant]}`}>{value}</p>
      {(trend || trendValue) && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trendColor}`}>
          {trend && <TrendIcon className="w-3.5 h-3.5" />}
          {trendValue && <span>{trendValue}</span>}
        </div>
      )}
    </div>
  );
}

/* ─── Section Header ──────────────────────────── */
export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-forest-400 to-morning-500 inline-block" />
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ─── Progress Bar ────────────────────────────── */
export function ProgressBar({ value, max = 100, color = 'forest' }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          color === 'forest' ? 'bg-gradient-to-r from-forest-400 to-forest-600' :
          color === 'morning' ? 'bg-gradient-to-r from-morning-400 to-morning-600' :
          color === 'warning' ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
          color === 'danger' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
          'bg-gradient-to-r from-forest-400 to-morning-500'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
