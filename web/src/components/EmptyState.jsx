import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';
import { EASE } from '../lib/motion';

export default function EmptyState({ title, message, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <GlassCard
        hover={false}
        className="flex flex-col items-center justify-center border-dashed p-[var(--space-16)] text-center"
      >
        <span
          className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-full)] text-[color:var(--accent-fg)] shadow-[var(--glow-accent)]"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <Sparkles size={24} strokeWidth={2.2} />
        </span>
        <h3 className="rv-display mt-5 text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">{title}</h3>
        {message && (
          <p className="mt-2 max-w-sm text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
            {message}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </GlassCard>
    </motion.div>
  );
}
