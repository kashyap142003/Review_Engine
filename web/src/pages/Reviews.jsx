import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, LayoutGrid, Table as TableIcon, Sparkles, ExternalLink } from 'lucide-react';
import { useSheetData } from '../lib/useSheetData';
import StatCard from '../components/StatCard';
import GlassCard from '../components/GlassCard';
import DataTable from '../components/DataTable';
import AiReplyDraft from '../components/AiReplyDraft';
import AiReplyModal from '../components/AiReplyModal';
import Page from '../components/Page';
import PageSkeleton, { ErrorBanner } from '../components/States';
import { staggerContainer, staggerItem } from '../lib/motion';

function StarRating({ rating, size = 16 }) {
  const value = Number(rating) || 0;
  return (
    <span aria-label={`${value} out of 5 stars`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-[color:var(--warning)] text-[color:var(--warning)]' : 'text-[color:var(--border)]'}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const { rows, loading, error, reload } = useSheetData('reviews');
  const [view, setView] = useState('cards');
  const [selectedReviewForAi, setSelectedReviewForAi] = useState(null);

  const stats = useMemo(() => {
    const ratings = rows.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n) && n > 0);
    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
    const recent = [...rows].sort((a, b) => String(b.captured_at).localeCompare(String(a.captured_at)));
    return { count: rows.length, avg, recent };
  }, [rows]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  return (
    <Page>
      {/* Live Background Worker Status Banner */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4 tablet:flex-row tablet:items-center tablet:justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[length:var(--text-sm)] font-bold text-[color:var(--text-primary)]">
                Status: 🟢 Live Review Monitoring Active
              </span>
            </div>
            <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">
              Background worker automatically scrapes Google Maps & filters new reviews. Read time: Instant (0s).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[length:var(--text-xs)] font-semibold text-[color:var(--text-secondary)] bg-[color:var(--bg)] px-3 py-1.5 rounded-xl border border-[color:var(--border)]">
          <span>Auto-Poller:</span>
          <span className="text-[color:var(--accent)] font-bold">Every 30 mins</span>
        </div>
      </div>

      <section aria-label="Review summary" className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
        <StatCard label="Total reviews captured" value={stats.count} change="from Google Business Profile" icon={Star} tone="warning" />
        <StatCard label="Average star rating" value={stats.avg} change="out of 5.0 rating scale" icon={MessageSquareQuote} tone="success" />
      </section>

      <div className="flex items-center justify-between">
        <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">Reviews feed</h2>
        <div className="flex rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] p-1">
          <button
            type="button"
            aria-label="Cards view"
            onClick={() => setView('cards')}
            className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
              view === 'cards' ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            aria-label="Table view"
            onClick={() => setView('table')}
            className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
              view === 'table' ? 'bg-[color:var(--accent-soft)] text-[color:var(--accent)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'
            }`}
          >
            <TableIcon size={16} />
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3"
        >
          {stats.recent.map((review) => (
            <motion.div key={review.id} variants={staggerItem}>
              <GlassCard hover className="flex h-full flex-col justify-between p-[var(--space-6)]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-full)] text-[length:var(--text-xs)] font-bold text-[color:var(--accent-fg)] shadow-[var(--glow-accent)]"
                        style={{ background: 'var(--gradient-brand)' }}
                      >
                        {String(review.author || '?').charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[color:var(--text-primary)]">{review.author || 'Anonymous'}</p>
                        <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">
                          {review.captured_at ? new Date(review.captured_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <StarRating rating={review.rating} />
                    {review.sentiment && (
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                        review.sentiment === 'negative' || Number(review.rating) <= 3
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        {review.sentiment || 'Positive'}
                      </span>
                    )}
                  </div>
                  {review.text && (
                    <p className="mt-3 text-[length:var(--text-sm)] leading-relaxed text-[color:var(--text-secondary)]">
                      "{review.text}"
                    </p>
                  )}
                </div>

                {/* AI Reply Draft Assistant & Google Link */}
                <AiReplyDraft review={review} />
              </GlassCard>
            </motion.div>
          ))}
          {!stats.recent.length && (
            <div className="col-span-full py-12 text-center text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
              No reviews captured yet.
            </div>
          )}
        </motion.div>
      ) : (
        <DataTable
          columns={[
            { key: 'author', label: 'Author' },
            { key: 'rating', label: 'Rating', render: (row) => <StarRating rating={row.rating} /> },
            { key: 'text', label: 'Review' },
            { key: 'captured_at', label: 'Captured' },
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
              ) 
            },
          ]}
          rows={stats.recent}
          emptyMessage="No reviews yet."
        />
      )}

      {/* AI Reply Modal Dialog */}
      <AiReplyModal
        review={selectedReviewForAi}
        isOpen={!!selectedReviewForAi}
        onClose={() => setSelectedReviewForAi(null)}
      />
    </Page>
  );
}
