import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Star, 
  ExternalLink, 
  ShieldAlert, 
  MessageSquare,
  Filter,
  Sparkles
} from 'lucide-react';
import { useSheetData } from '../lib/useSheetData';
import { resolveIssue } from '../lib/api';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import AiReplyModal from '../components/AiReplyModal';
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
        className="inline-flex items-center gap-1.5 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-1.5 text-[12px] font-semibold text-[#10B981] transition-all hover:bg-[#10B981]/20 active:scale-95 disabled:opacity-50"
      >
        {busy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
        {busy ? 'Resolving…' : 'Mark Resolved'}
      </button>
    </div>
  );
}

function SeverityBadge({ severity }) {
  const isHigh = String(severity).toLowerCase() === 'high';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        isHigh ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
      )}
    >
      <AlertCircle size={12} />
      {severity || 'normal'}
    </span>
  );
}

function SourceBadge({ source }) {
  const isGoogle = source === 'google';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        isGoogle ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      )}
    >
      {isGoogle ? <Star size={11} className="fill-amber-400" /> : <MessageSquare size={11} />}
      {isGoogle ? 'Google Maps' : 'Private Email'}
    </span>
  );
}

export default function Issues() {
  const { rows: issueRows, loading: issuesLoading, error: issuesError, reload: reloadIssues } = useSheetData('issues');
  const { rows: reviewRows, loading: reviewsLoading, error: reviewsError, reload: reloadReviews } = useSheetData('reviews');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'private' | 'google'
  const [selectedReviewForAi, setSelectedReviewForAi] = useState(null);

  const loading = issuesLoading || reviewsLoading;
  const error = issuesError || reviewsError;

  // 1. Private email complaints
  const openPrivate = useMemo(() => issueRows.filter((r) => r.status === 'open'), [issueRows]);
  const resolvedPrivate = useMemo(() => issueRows.filter((r) => r.status === 'resolved'), [issueRows]);

  // 2. Public Google Maps Negative Reviews (1★ and 2★)
  const googleNegative = useMemo(() => {
    return reviewRows
      .filter((r) => Number(r.rating) <= 2)
      .sort((a, b) => String(b.captured_at).localeCompare(String(a.captured_at)));
  }, [reviewRows]);

  const totalOpenActionCount = openPrivate.length + googleNegative.length;

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={() => { reloadIssues(); reloadReviews(); }} />;

  return (
    <Page>
      {/* Top Banner Alert Summary */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 shadow-sm tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <ShieldAlert size={22} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-[color:var(--text-primary)]">
                Reputation Triage Center
              </h2>
              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-500 border border-red-500/20">
                {totalOpenActionCount} Needs Action
              </span>
            </div>
            <p className="text-[12.5px] font-medium text-[color:var(--text-muted)]">
              Unified inbox for private complaints intercepted via email outreach AND public low-star Google Maps reviews.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
              filterType === 'all'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md'
                : 'border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text-secondary)] hover:text-white'
            )}
          >
            All Issues ({totalOpenActionCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('private')}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
              filterType === 'private'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md'
                : 'border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text-secondary)] hover:text-white'
            )}
          >
            Private Email ({openPrivate.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('google')}
            className={clsx(
              'px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all',
              filterType === 'google'
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-md'
                : 'border border-[color:var(--border)] bg-[color:var(--bg)] text-[color:var(--text-secondary)] hover:text-white'
            )}
          >
            Google Maps 1-2★ ({googleNegative.length})
          </button>
        </div>
      </div>

      {/* SECTION 1: Public Negative Google Reviews */}
      {(filterType === 'all' || filterType === 'google') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Star size={15} className="fill-amber-500" />
              </span>
              <div>
                <h3 className="rv-display text-[15px] font-bold text-[color:var(--text-primary)]">
                  Public Google Maps Negative Reviews (1★ & 2★)
                </h3>
                <p className="text-[12px] text-[color:var(--text-muted)]">
                  Public reviews requiring business owner response on Google Business Profile
                </p>
              </div>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11.5px] font-bold text-amber-500 border border-amber-500/20">
              {googleNegative.length} Public Reviews
            </span>
          </div>

          <DataTable
            columns={[
              {
                key: 'author',
                label: 'Reviewer',
                render: (row) => (
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">
                      {String(row.author || '?').charAt(0).toUpperCase()}
                    </span>
                    <span className="font-semibold text-[color:var(--text-primary)] truncate max-w-[150px]">
                      {row.author || 'Anonymous'}
                    </span>
                  </div>
                ),
              },
              {
                key: 'rating',
                label: 'Rating',
                render: (row) => (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                    <Star size={11} className="fill-red-500" />
                    {row.rating} Star{Number(row.rating) === 1 ? '' : 's'}
                  </span>
                ),
              },
              {
                key: 'text',
                label: 'Review Text',
                render: (row) => (
                  <p className="text-[12.5px] text-[color:var(--text-secondary)] line-clamp-2 max-w-md">
                    "{row.text || 'No review text provided.'}"
                  </p>
                ),
              },
              {
                key: 'captured_at',
                label: 'Posted',
                render: (row) => (
                  <span className="text-[12px] text-[color:var(--text-muted)] whitespace-nowrap">
                    {row.captured_at ? new Date(row.captured_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedReviewForAi(row)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1.5 text-[12px] font-semibold text-[#A78BFA] transition-all hover:bg-[#8B5CF6]/20 active:scale-95"
                    >
                      <Sparkles size={13} className="text-[#A78BFA]" />
                      <span>Draft Reply</span>
                    </button>

                    {row.url && (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[12px] font-semibold text-amber-400 hover:bg-amber-500/20 transition-all"
                      >
                        <span>Google</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ),
              },
            ]}
            rows={googleNegative}
            emptyMessage="No negative reviews on Google Maps — exceptional rating health!"
          />
        </section>
      )}

      {/* SECTION 2: Private Email Complaints */}
      {(filterType === 'all' || filterType === 'private') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <MessageSquare size={15} />
              </span>
              <div>
                <h3 className="rv-display text-[15px] font-bold text-[color:var(--text-primary)]">
                  Private Intercepted Complaints (Email Outreach)
                </h3>
                <p className="text-[12px] text-[color:var(--text-muted)]">
                  Caught privately before customer went to Google. Mark resolved to send follow-up review invite.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11.5px] font-bold text-red-500 border border-red-500/20">
              {openPrivate.length} Open
            </span>
          </div>

          <DataTable
            columns={[
              {
                key: 'customer_name',
                label: 'Customer',
                render: (row) => (
                  <div className="min-w-0">
                    <p className="font-semibold text-[color:var(--text-primary)] truncate">{row.customer_name || '—'}</p>
                    <p className="text-[11px] text-[color:var(--text-muted)] truncate">{row.customer_email || ''}</p>
                  </div>
                ),
              },
              { key: 'summary', label: 'Complaint Summary' },
              { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
              { key: 'created_at', label: 'Reported' },
              {
                key: 'actions',
                label: 'Action',
                render: (row) => <ResolveButton issueId={row.id} onResolved={reloadIssues} />,
              },
            ]}
            rows={openPrivate}
            emptyMessage="No open private complaints — all customer feedback resolved!"
          />
        </section>
      )}

      {/* SECTION 3: Resolved Complaints History */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 pb-1 border-b border-[color:var(--border)]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-[#10B981]">
            <CheckCircle2 size={16} />
          </span>
          <h3 className="rv-display text-[15px] font-bold text-[color:var(--text-primary)]">
            Resolved Issues History
          </h3>
          <span className="rounded-full bg-[#10B981]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#10B981] border border-[#10B981]/20">
            {resolvedPrivate.length} Resolved
          </span>
        </div>

        <DataTable
          columns={[
            { key: 'customer_name', label: 'Customer' },
            { key: 'summary', label: 'Summary' },
            { key: 'severity', label: 'Severity', render: (row) => <SeverityBadge severity={row.severity} /> },
            { key: 'resolved_at', label: 'Resolved Date' },
          ]}
          rows={resolvedPrivate}
          emptyMessage="No resolved issues yet."
        />
      </section>

      {/* AI Reply Modal Dialog */}
      <AiReplyModal
        review={selectedReviewForAi}
        isOpen={!!selectedReviewForAi}
        onClose={() => setSelectedReviewForAi(null)}
      />
    </Page>
  );
}

