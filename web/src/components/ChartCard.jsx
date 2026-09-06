import GlassCard from './GlassCard';

export default function ChartCard({ title, subtitle, children, actions, className }) {
  return (
    <GlassCard hover={false} className={className}>
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
        <div className="min-w-0">
          <h2 className="rv-display text-[15.5px] font-bold text-[color:var(--text-primary)]">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[12.5px] font-medium text-[color:var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="px-6 pb-5 pt-1">{children}</div>
    </GlassCard>
  );
}
