import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSheetData } from '../lib/useSheetData';
import { resolveIssue } from '../lib/api';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import Page from '../components/Page';
import PageSkeleton, { ErrorBanner } from '../components/States';
import clsx from 'clsx';

function ResolveButton({ issueId, onResolved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handle() {
    setBusy(true);
    setError('');
    try {
      await resolveIssue(issueId);
      onResolved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-[length:var(--text-xs)] font-medium text-[color:var(--danger)]">{error}</span>}
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-1.5 text-[length:var(--text-xs)] font-semibold text-[color:var(--text-primary)] transition-all duration-[var(--transition-fast)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] disabled:opacity-[var(--state-disabled-opacity)]"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
        {busy ? 'Resolving…' : 'Resolve'}
      </button>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const isHigh = String(severity).toLowerCase() === 'high';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-[var(--radius-full)] px-2.5 py-0.5 text-[length:var(--text-xs)] font-semibold capitalize',
        isHigh ? 'bg-[color:var(--danger-soft)] text-[color:var(--danger)]' : 'bg-[color:var(--warning-soft)] text-[color:var(--warning)]',
      )}
    >
      <AlertCircle size={12} />
      {severity || 'normal'}
    </span>
  );
}

export default function Issues() {
  const { rows, loading, error, reload } = useSheetData('issues');

  const open = useMemo(() => rows.filter((r) => r.status === 'open'), [rows]);
  const resolved = useMemo(() => rows.filter((r) => r.status === 'resolved'), [rows]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  return (
    <Page>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
              Open issues
            </h2>
            <span className="rounded-[var(--radius-full)] bg-[color:var(--danger-soft)] px-2.5 py-0.5 text-[length:var(--text-xs)] font-bold text-[color:var(--danger)]">
              {open.length}
            </span>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'customer_name', label: 'Customer' },
            { key: 'summary', label: 'Summary' },
            { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
            { key: 'created_at', label: 'Reported' },
            {
              key: 'actions',
              label: '',
              render: (row) => <ResolveButton issueId={row.id} onResolved={reload} />,
            },
          ]}
          rows={open}
          emptyMessage="No open issues — great work!"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
            Resolved
          </h2>
          <span className="rounded-[var(--radius-full)] bg-[color:var(--success-soft)] px-2.5 py-0.5 text-[length:var(--text-xs)] font-bold text-[color:var(--success)]">
            {resolved.length}
          </span>
        </div>
        <DataTable
          columns={[
            { key: 'customer_name', label: 'Customer' },
            { key: 'summary', label: 'Summary' },
            { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
            { key: 'resolved_at', label: 'Resolved' },
          ]}
          rows={resolved}
          emptyMessage="No resolved issues yet."
        />
      </section>
    </Page>
  );
}
