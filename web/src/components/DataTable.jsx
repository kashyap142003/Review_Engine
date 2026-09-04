import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import Status, { STATUS_TONES } from './Status';
import GlassCard from './GlassCard';
import { staggerContainer, staggerItem } from '../lib/motion';

function Cell({ value }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-[color:var(--text-muted)]">—</span>;
  }
  return String(value);
}

export default function DataTable({ columns, rows, emptyMessage }) {
  if (!rows.length) {
    return (
      <GlassCard hover={false} className="flex flex-col items-center justify-center gap-3 p-[var(--space-12)] text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
          <Inbox size={22} />
        </span>
        <p className="max-w-sm text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
          {emptyMessage}
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard hover={false} className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-left text-[length:var(--text-sm)]">
          <thead>
            <tr className="border-b border-[color:var(--border)] bg-[color:var(--surface-muted)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-3.5 text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody initial="hidden" animate="show" variants={staggerContainer(0.05)}>
            {rows.map((row, i) => (
              <motion.tr
                key={row.id || i}
                variants={staggerItem}
                className="border-b border-[color:var(--border)] transition-colors duration-[var(--transition-fast)] last:border-b-0 hover:bg-[color:var(--state-hover-overlay)]"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-3.5 font-medium text-[color:var(--text-primary)]">
                    {col.render ? (
                      col.render(row)
                    ) : col.key === 'status' ? (
                      <Status label={row[col.key]} tone={STATUS_TONES[row[col.key]]} />
                    ) : (
                      <Cell value={row[col.key]} />
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </GlassCard>
  );
}
