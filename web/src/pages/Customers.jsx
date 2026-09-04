import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, UserPlus } from 'lucide-react';
import { useSheetData } from '../lib/useSheetData';
import DataTable from '../components/DataTable';
import Page from '../components/Page';
import PageSkeleton, { ErrorBanner } from '../components/States';
import AddCustomerModal from '../components/AddCustomerModal';
import clsx from 'clsx';

const STATUS_FILTERS = ['all', 'pending', 'contacted', 'replied', 'issue', 'reminded', 'reviewed', 'failed'];

export default function Customers() {
  const { rows, loading, error, reload } = useSheetData('track');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (status === 'all' ? true : r.status === status))
      .filter((r) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          String(r.customer_name || '').toLowerCase().includes(q) ||
          String(r.email || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  }, [rows, status, search]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  return (
    <Page>
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-start tablet:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-[color:var(--text-muted)]" />
            <span className="text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
              Filter by status
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2"
          >
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={clsx(
                  'rounded-[var(--radius-full)] px-3.5 py-1.5 text-[length:var(--text-xs)] font-semibold capitalize transition-all duration-[var(--transition-fast)]',
                  status === s
                    ? 'text-[color:var(--accent-fg)] shadow-[var(--glow-accent)]'
                    : 'border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-primary)]',
                )}
                style={status === s ? { background: 'var(--gradient-brand)' } : undefined}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative">
            <span className="sr-only">Search customers</span>
            <Search
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
            />
            <input
              id="search-customers"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or email"
              className="h-11 w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] pl-10 pr-4 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] transition-colors duration-[var(--transition-fast)] focus:border-[color:var(--accent)] tablet:w-64"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 h-11 px-4 rounded-xl text-[length:var(--text-sm)] font-semibold text-white shadow-lg transition-transform active:scale-95 shrink-0"
            style={{ background: 'var(--gradient-brand)' }}
          >
            <UserPlus size={16} />
            <span className="hidden tablet:inline">Add Completed Service</span>
            <span className="tablet:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
        <span>{filtered.length} customer{filtered.length === 1 ? '' : 's'}</span>
      </div>

      <DataTable
        columns={[
          {
            key: 'customer_name',
            label: 'Customer',
            render: (row) => (
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[length:var(--text-xs)] font-bold text-[color:var(--accent-fg)]"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  {String(row.customer_name || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[color:var(--text-primary)]">{row.customer_name || '—'}</p>
                  <p className="truncate text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">{row.email || ''}</p>
                </div>
              </div>
            ),
          },
          { key: 'service', label: 'Service' },
          { key: 'channel', label: 'Channel' },
          { key: 'status', label: 'Status' },
          { key: 'completion_date', label: 'Service date' },
          { key: 'review_click_count', label: 'Clicks' },
        ]}
        rows={filtered}
        emptyMessage="No customers match this filter. Add a row to the Track sheet to start follow-ups."
      />

      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCustomerAdded={() => reload()}
      />
    </Page>
  );
}
