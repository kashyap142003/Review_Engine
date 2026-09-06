import { TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import GlassCard from './GlassCard';
import AnimatedNumber from './AnimatedNumber';

const TONES = {
  accent: { bg: 'rgba(16, 185, 129, 0.12)', fg: '#10B981' },
  success: { bg: 'rgba(16, 185, 129, 0.12)', fg: '#10B981' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', fg: '#F59E0B' },
  danger: { bg: 'rgba(239, 68, 68, 0.12)', fg: '#EF4444' },
  info: { bg: 'rgba(59, 130, 246, 0.12)', fg: '#3B82F6' },
};

export default function StatCard({ label, value, change, icon: Icon, tone = 'accent', format, variant = 'default', tag }) {
  const t = TONES[tone] ?? TONES.accent;
  const isWarning = variant === 'warning';
  const numeric = Number(value);
  const canAnimate = Number.isFinite(numeric);

  return (
    <GlassCard 
      hover 
      className={clsx(
        "group h-full flex flex-col justify-between p-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] transition-all duration-200 hover:shadow-lg hover:border-[#10B981]/40", 
        isWarning && "border-l-4 border-l-[#EF4444]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[color:var(--text-secondary)] truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <div className="rv-display text-[28px] font-bold tracking-tight text-[color:var(--text-primary)]">
              {canAnimate ? <AnimatedNumber value={numeric} format={format} /> : value}
            </div>
            {tag && (
              <span className="inline-block rounded-full bg-[color:var(--surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
                {tag}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
            style={{ background: t.bg, color: t.fg }}
          >
            <Icon size={19} strokeWidth={2.2} />
          </span>
        )}
      </div>
      {change && (
        <div className="mt-3.5 flex items-center gap-1.5">
          <span 
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ background: t.bg, color: t.fg }}
          >
            <TrendingUp size={11} strokeWidth={2.4} />
            {change}
          </span>
        </div>
      )}
    </GlassCard>
  );
}
