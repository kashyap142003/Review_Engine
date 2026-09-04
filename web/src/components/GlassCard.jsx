import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';

// Base glass surface for the aurora design system.
// Default = light card with soft shadow + hover lift.
// `variant="glass"` = frosted translucent panel (sidebar, topbar, hero).
// `glow` = gradient halo ring around the card.
export default function GlassCard({
  children,
  className,
  variant = 'card',
  glow = false,
  hover = true,
  ...rest
}) {
  const reduce = useReducedMotion();

  const base = clsx(
    'relative rounded-[var(--radius-lg)]',
    variant === 'glass' && 'rv-glass',
    variant === 'card' && 'border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-card)]',
    hover && !reduce && 'transition-shadow transition-transform duration-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]',
    className,
  );

  return (
    <motion.div {...rest} className={base}>
      {glow && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[var(--radius-lg)] opacity-70"
          style={{
            background: 'var(--gradient-brand)',
            WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      )}
      {children}
    </motion.div>
  );
}
