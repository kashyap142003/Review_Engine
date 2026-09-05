import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Send, 
  MousePointerClick, 
  Star, 
  AlertTriangle, 
  MessageSquare, 
  BellRing, 
  RefreshCw, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  HeartHandshake
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useSheetData } from '../lib/useSheetData';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import GlassCard from '../components/GlassCard';
import CompetitorBenchmark from '../components/CompetitorBenchmark';
import Page from '../components/Page';
import PageSkeleton, { ErrorBanner } from '../components/States';
import AnimatedNumber from '../components/AnimatedNumber';
import { staggerContainer, staggerItem, fadeIn } from '../lib/motion';

function buildMetrics(track, reviews, issues) {
  // Service completed / Customers in pipeline
  const totalCustomers = track.length;
  
  // Replied to initial outreach email
  const replied = track.filter((r) => r.status === 'replied' || r.status === 'issue' || r.status === 'reviewed').length;
  
  // Google review invites delivered
  const invited = track.filter((r) => !!r.review_sent_at || r.status === 'reviewed' || r.status === 'invited').length;
  
  // Total Clicks on Google Review Link
  const clicks = track.reduce((sum, r) => sum + (Number(r.review_click_count) || 0), 0);
  
  // Google Reviews captured
  const newReviews = reviews.length;
  
  // Average Rating
  let totalRating = 0;
  let validRatings = 0;
  for (const r of reviews) {
    if (r.rating) {
      totalRating += Number(r.rating);
      validRatings++;
    }
  }
  const avgRating = validRatings > 0 ? (totalRating / validRatings).toFixed(1) : '5.0';
  
  // Conversational Reply Rate (Email response velocity)
  const replyRate = totalCustomers > 0 ? ((replied / totalCustomers) * 100).toFixed(1) : '0';
  
  // Review Conversion from invite (Calculated from tracked pipeline customers who were invited and completed a review)
  const completedFromPipeline = track.filter(r => r.status === 'reviewed').length;
  const reviewConversion = invited > 0 
    ? Math.min(100, Math.round((completedFromPipeline / invited) * 100))
    : (newReviews > 0 ? 100 : 0);
  
  // Issues caught and resolved privately
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const openIssues = issues.filter(i => i.status === 'open').length;

  return { 
    totalCustomers, 
    replied, 
    invited, 
    clicks, 
    newReviews, 
    avgRating, 
    replyRate, 
    reviewConversion,
    resolvedIssues,
    openIssues
  };
}

function buildGrowth(reviews) {
  const buckets = {};
  for (const review of reviews) {
    const d = new Date(review.captured_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = d.toISOString().slice(0, 10);
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), reviews: count }));
}

function buildRatingDistribution(reviews) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const rating = Math.round(Number(review.rating));
    if (rating >= 1 && rating <= 5) counts[rating] += 1;
  }
  return Object.entries(counts).map(([rating, count]) => ({ rating: Number(rating), count }));
}

const RATING_COLORS = {
  1: '#EF4444',
  2: '#F97316',
  3: '#F59E0B',
  4: '#3B82F6',
  5: '#10B981',
};

const EVENT_META = {
  email_sent:      { icon: Send,             tone: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', label: 'Outreach Email Sent' },
  click:           { icon: MousePointerClick, tone: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Google Review Link Clicked' },
  reply_received:  { icon: MessageSquare,     tone: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Customer Feedback Received' },
  issue_flagged:   { icon: AlertTriangle,     tone: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)',  label: 'Private Issue Flagged' },
  review_captured: { icon: Star,              tone: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', label: 'Google Review Captured' },
  reminder_sent:   { icon: BellRing,          tone: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', label: 'Review Reminder Sent' },
  gbp_sync:        { icon: RefreshCw,         tone: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Google Maps Sync' },
};

const timeFormat = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

function chartTooltipStyle() {
  return {
    background: '#12141D',
    border: '1px solid #24293D',
    borderRadius: '12px',
    boxShadow: '0 16px 32px rgba(0,0,0,0.3)',
    fontSize: 13,
    fontWeight: 500,
    color: '#ffffff',
  };
}

export default function Overview() {
  const trackState = useSheetData('track');
  const issueState = useSheetData('issues');
  const reviewState = useSheetData('reviews');
  const activityState = useSheetData('activity');
  const competitorState = useSheetData('competitors');

  const loading = trackState.loading || reviewState.loading;
  const error = trackState.error || issueState.error || reviewState.error || activityState.error;

  const metrics = useMemo(
    () => buildMetrics(trackState.rows, reviewState.rows, issueState.rows),
    [trackState.rows, reviewState.rows, issueState.rows],
  );
  
  const growth = useMemo(() => buildGrowth(reviewState.rows), [reviewState.rows]);
  const distribution = useMemo(() => buildRatingDistribution(reviewState.rows), [reviewState.rows]);
  
  const recentActivity = useMemo(() => {
    return [...activityState.rows]
      .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
      .slice(0, 7);
  }, [activityState.rows]);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorBanner message={error} onRetry={trackState.reload} />;

  return (
    <Page>
      {/* Top Stat Grid with Dark Hero Card */}
      <motion.section
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="show"
        aria-label="Key metrics"
        className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-4"
      >
        {/* Dark Hero Featured Card (Inspired by Reference Dashboard) */}
        <motion.div 
          variants={staggerItem}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#131622] via-[#0F111B] to-[#0A0C14] p-5 text-white border border-[#21263B] shadow-xl flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#34D399] tracking-wide border border-[#10B981]/30">
                <Sparkles size={12} /> Google Review Health
              </span>
              <p className="mt-2 text-[13px] font-medium text-[#94A0B8]">Average Rating</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="rv-display text-[32px] font-bold text-white tracking-tight">
                  {metrics.avgRating}
                </span>
                <span className="text-[14px] font-semibold text-[#64748B]">/ 5.0</span>
              </div>
            </div>

            {/* Glowing Mini Sparkline Bars */}
            <div className="flex items-end gap-1 h-12 pt-2">
              <span className="w-1.5 h-4 rounded-full bg-[#10B981]/40" />
              <span className="w-1.5 h-6 rounded-full bg-[#10B981]/60" />
              <span className="w-1.5 h-8 rounded-full bg-[#10B981]/80" />
              <span className="w-1.5 h-11 rounded-full bg-[#10B981] shadow-[0_0_12px_#10B981]" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-[#1E2336] pt-3 text-[12px]">
            <span className="text-[#10B981] font-semibold flex items-center gap-1">
              <TrendingUp size={13} /> {metrics.newReviews} Google Reviews
            </span>
            <span className="text-[#64748B]">Live GBP Sync</span>
          </div>
        </motion.div>

        {/* Reply Rate Card */}
        <motion.div variants={staggerItem}>
          <StatCard 
            label="Conversational Reply Rate" 
            value={metrics.replyRate} 
            format={(v) => `${Math.round(v)}%`} 
            change={`${metrics.replied} of ${metrics.totalCustomers} replied`} 
            icon={MessageSquare} 
            tone="info" 
            tag="Email Engine"
          />
        </motion.div>

        {/* Private Issues Resolved Card */}
        <motion.div variants={staggerItem}>
          <StatCard 
            label="Private Issues Caught" 
            value={metrics.openIssues} 
            change={metrics.openIssues === 0 ? "All issues resolved" : `${metrics.openIssues} needs resolution`} 
            icon={AlertTriangle} 
            tone={metrics.openIssues > 0 ? "danger" : "success"}
            variant={metrics.openIssues > 0 ? "warning" : "default"}
            tag={metrics.openIssues === 0 ? "Zero Escaped" : "Needs Action"}
          />
        </motion.div>

        {/* Review Conversion Card */}
        <motion.div variants={staggerItem}>
          <StatCard 
            label="Review Conversion" 
            value={metrics.reviewConversion} 
            format={(v) => `${Math.round(v)}%`} 
            change={`${metrics.newReviews} reviews captured`} 
            icon={Star} 
            tone="success" 
            tag="Google GBP"
          />
        </motion.div>
      </motion.section>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-3">
        {/* Growth Chart */}
        <motion.div variants={fadeIn} initial="hidden" animate="show" className="desktop:col-span-2">
          <ChartCard 
            title="Google Review Velocity" 
            subtitle="New verified reviews captured over time via automated follow-up"
          >
            <div className="h-72 w-full pt-2">
              {growth.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="emeraldGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                        <stop offset="60%" stopColor="#10B981" stopOpacity={0.08} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                      dy={8} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                      allowDecimals={false} 
                    />
                    <Tooltip contentStyle={chartTooltipStyle()} cursor={{ stroke: '#10B981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="reviews"
                      name="New Reviews"
                      stroke="#10B981"
                      strokeWidth={3}
                      fill="url(#emeraldGrowth)"
                      activeDot={{ r: 6, fill: '#10B981', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[13.5px] font-medium text-[#64748B]">
                  No reviews recorded yet — reviews will populate automatically once synced.
                </div>
              )}
            </div>
          </ChartCard>
        </motion.div>

        {/* Rating Distribution Mix */}
        <motion.div variants={fadeIn} initial="hidden" animate="show">
          <ChartCard title="Rating Mix" subtitle="Distribution of star ratings on Google">
            <div className="h-72 w-full pt-2">
              {distribution.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                    <XAxis 
                      dataKey="rating" 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(v) => `${v} ★`}
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }} 
                      dy={8} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} 
                      allowDecimals={false} 
                    />
                    <Tooltip contentStyle={chartTooltipStyle()} cursor={{ fill: 'rgba(16, 185, 129, 0.05)', radius: 6 }} />
                    <Bar dataKey="count" name="Reviews" radius={[8, 8, 8, 8]} maxBarSize={38}>
                      {distribution.map((d) => (
                        <Cell key={d.rating} fill={RATING_COLORS[d.rating] ?? '#64748B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-[13.5px] font-medium text-[#64748B]">
                  No ratings data yet.
                </div>
              )}
            </div>
          </ChartCard>
        </motion.div>
      </div>

      {/* Competitor Benchmark & Local Intelligence */}
      <motion.div variants={fadeIn} initial="hidden" animate="show">
        <CompetitorBenchmark 
          competitors={competitorState.rows} 
          clientReviewsCount={metrics.newReviews}
          clientRating={Number(metrics.avgRating)}
        />
      </motion.div>

      {/* Real-time Activity Feed */}
      <GlassCard hover={false} className="p-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="flex items-center justify-between pb-4 border-b border-[color:var(--border)]">
          <div>
            <h2 className="rv-display text-[16px] font-bold text-[color:var(--text-primary)]">
              Real-time Automation Feed
            </h2>
            <p className="text-[12.5px] text-[color:var(--text-secondary)]">
              Live events captured across email outreach, sentiment triage, and Google sync
            </p>
          </div>
          <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-[11.5px] font-semibold text-[#059669] border border-[#10B981]/25">
            {recentActivity.length} Events Logged
          </span>
        </div>

        <motion.ul
          variants={staggerContainer(0.05)}
          initial="hidden"
          animate="show"
          className="mt-4 space-y-2"
        >
          {recentActivity.map((event) => {
            const meta = EVENT_META[event.event] ?? { 
              icon: Star, 
              tone: '#64748B', 
              bg: 'rgba(100, 116, 139, 0.1)',
              label: 'Automation Event' 
            };
            const Icon = meta.icon;
            return (
              <motion.li
                key={`${event.id}-${event.ts}`}
                variants={staggerItem}
                className="flex items-center gap-4 rounded-xl p-3 transition-all duration-150 hover:bg-[color:var(--state-hover-overlay)]"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: meta.bg, color: meta.tone }}
                >
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13.5px] font-medium text-[color:var(--text-primary)]">
                      {event.detail}
                    </p>
                    <span className="shrink-0 text-[11px] font-medium text-[color:var(--text-muted)]">
                      {event.ts ? timeFormat.format(new Date(event.ts)) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-[11.5px] font-medium text-[color:var(--text-secondary)]">
                    {meta.label}
                  </p>
                </div>
              </motion.li>
            );
          })}

          {!recentActivity.length && (
            <li className="py-8 text-center text-[13.5px] font-medium text-[color:var(--text-secondary)]">
              No automation activity recorded yet. Run a sync or add customers to see live events.
            </li>
          )}
        </motion.ul>
      </GlassCard>
    </Page>
  );
}
