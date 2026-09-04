import GlassCard from './GlassCard';

export default function ChartCard({ title, subtitle, children, actions, className }) {
  return (
    <GlassCard hover={false} className={className}>
      <div className="flex items-start justify-between gap-4 px-[var(--space-6)] pt-[var(--space-6)]">
        <div className="min-w-0">
          <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="px-[var(--space-6)] pb-[var(--space-6)] pt-[var(--space-6)]">{children}</div>
    </GlassCard>
  );
}
