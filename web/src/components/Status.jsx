const toneColor = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
};

const STATUS_TONES = {
  contacted: 'info',
  replied: 'info',
  reminded: 'warning',
  reviewed: 'success',
  resolved: 'success',
  issue: 'danger',
  open: 'warning',
  failed: 'danger',
  needs_info: 'warning',
};

// Gradient-tinted pill badge. Colors come from semantic tokens only.
export default function Status({ label, tone }) {
  const color = toneColor[tone] ?? 'var(--text-muted)';
  return (
    <span
      className="inline-flex items-center gap-2 rounded-[var(--radius-full)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold capitalize"
      style={{
        color,
        background: `color-mix(in srgb, ${color} 13%, transparent)`,
      }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 18%, transparent)` }} />
      {label}
    </span>
  );
}

export { STATUS_TONES };
