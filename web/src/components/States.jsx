import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';
import { EASE } from '../lib/motion';

export default function PageSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex flex-col gap-6"
      role="status"
      aria-label="Loading"
    >
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rv-skeleton h-[128px] rounded-[var(--radius-lg)]" />
        ))}
      </div>
      <div className="rv-skeleton h-64 rounded-[var(--radius-lg)]" />
      <div className="rv-skeleton h-72 rounded-[var(--radius-lg)]" />
    </motion.div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <GlassCard hover={false} className="rv-error-banner flex items-start gap-4 p-[var(--space-6)]" style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, transparent)' }}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]">
          <AlertTriangle size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[length:var(--text-sm)] font-semibold text-[color:var(--danger)]">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 py-2 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] transition-colors duration-[var(--transition-fast)] hover:bg-[color:var(--state-hover-overlay)]"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function EmptyStateBlock() {
  return (
    <div className="p-[var(--space-6)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
      No records yet.
    </div>
  );
}
