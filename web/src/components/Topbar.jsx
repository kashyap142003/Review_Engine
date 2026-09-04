import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronDown, Bell, CheckCircle2, Radio, RefreshCw } from 'lucide-react';
import { EASE } from '../lib/motion';

export default function Topbar({ title, subtitle, actions, onRefresh, refreshing }) {
  const [range, setRange] = useState('30');

  return (
    <header className="sticky top-0 z-20 flex h-[var(--topbar-height)] items-center justify-between gap-4 px-4 tablet:px-8 py-5 border-b border-[color:var(--border)]/60 bg-[color:var(--bg)]/80 backdrop-blur-md">
      <motion.div
        key={title}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="min-w-0"
      >
        <h1 className="rv-display truncate text-[length:var(--text-2xl)] tablet:text-[length:var(--text-3xl)] font-bold leading-tight text-[color:var(--text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
            {subtitle}
          </p>
        )}
      </motion.div>

      <div className="flex items-center gap-3">
        {/* Interactive Live Sync Status Indicator Badge */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Click to reload latest Google Sheets data"
          className="hidden desktop:flex items-center gap-2 rounded-full border border-[#10B981]/25 bg-[#10B981]/10 px-3.5 py-1.5 text-[12px] font-semibold text-[#059669] transition-all hover:bg-[#10B981]/20 hover:border-[#10B981]/40 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span>{refreshing ? 'Updating Sheet...' : 'Google Sheets Live'}</span>
          <RefreshCw size={12} className={refreshing ? 'animate-spin ml-0.5' : 'ml-0.5 opacity-60'} />
        </button>

        {/* Date Range Selector */}
        <label className="sr-only" htmlFor="date-range">
          Date range
        </label>
        <div className="relative hidden tablet:block">
          <CalendarDays
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
          />
          <select
            id="date-range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] pl-9 pr-9 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] shadow-sm outline-none transition-all hover:border-[color:var(--border-strong)] focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)]"
          >
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
          />
        </div>

        {/* Notifications Icon Button */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative hidden tablet:flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] shadow-sm transition-colors hover:bg-[color:var(--state-hover-overlay)] hover:text-[color:var(--text-primary)]"
        >
          <Bell size={17} strokeWidth={2} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#EF4444]" />
        </button>

        {actions}
      </div>
    </header>
  );
}
