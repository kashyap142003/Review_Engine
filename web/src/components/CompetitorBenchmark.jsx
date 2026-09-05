import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  ExternalLink, 
  Crown, 
  Target, 
  ShieldCheck,
  Award,
  Flame
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import GlassCard from './GlassCard';

function chartTooltipStyle() {
  return {
    background: '#12141D',
    border: '1px solid #24293D',
    borderRadius: '12px',
    boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
    fontSize: 12.5,
    fontWeight: 500,
    color: '#ffffff',
  };
}

export default function CompetitorBenchmark({ competitors = [], clientReviewsCount = 68, clientRating = 5.0 }) {
  // Sort competitors by ranking priority: Rating first, then review count
  const sorted = useMemo(() => {
    // If no competitors from backend yet, use default baseline
    const list = competitors.length > 0 ? [...competitors] : [
      { id: '1', business_name: 'Main Showroom', is_client: true, rating: clientRating || 5.0, review_count: clientReviewsCount || 68, weekly_growth: 6, maps_url: 'https://maps.google.com' },
      { id: '2', business_name: 'Apex Climate Solutions', is_client: false, rating: 4.7, review_count: 82, weekly_growth: 2, maps_url: 'https://maps.google.com' },
      { id: '3', business_name: 'Metro Heating & Air', is_client: false, rating: 4.5, review_count: 54, weekly_growth: 1, maps_url: 'https://maps.google.com' },
      { id: '4', business_name: 'Reliable Home Pros', is_client: false, rating: 4.3, review_count: 41, weekly_growth: 1, maps_url: 'https://maps.google.com' },
    ];

    return list.map(item => ({
      ...item,
      is_client: String(item.is_client).toUpperCase() === 'TRUE' || item.is_client === true,
      rating: Number(item.rating) || 0,
      review_count: Number(item.review_count) || 0,
      weekly_growth: Number(item.weekly_growth) || 1
    })).sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.review_count - a.review_count;
    });
  }, [competitors, clientReviewsCount, clientRating]);

  // Find client position and leader
  const clientRank = sorted.findIndex((c) => c.is_client) + 1;
  const leader = sorted[0];
  const clientObj = sorted.find((c) => c.is_client) || sorted[0];

  // Calculate review gap to #1
  const isLeader = clientRank === 1;
  const reviewGapToLeader = Math.max(0, (leader?.review_count || 0) - (clientObj?.review_count || 0));

  // Data formatted for chart
  const chartData = useMemo(() => {
    return sorted.map((c) => ({
      name: c.is_client ? `${c.business_name} (You)` : c.business_name,
      rating: c.rating,
      reviews: c.review_count,
      is_client: c.is_client,
    }));
  }, [sorted]);

  return (
    <GlassCard hover={false} className="p-6 rounded-2xl border border-[#21263B] bg-[#12141D]/90 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between pb-5 border-b border-[#21263B]">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 text-[#10B981] border border-[#10B981]/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <Trophy size={22} strokeWidth={2.2} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="rv-display text-[16px] font-bold text-white">
                Competitor Intelligence Benchmark
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#10B981]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#34D399] border border-[#10B981]/30">
                <Crown size={11} /> Rank #{clientRank || 1} in Local Market
              </span>
            </div>
            <p className="text-[12.5px] text-[#94A0B8]">
              Weekly Google Maps score tracking vs. top local competitors in your service area.
            </p>
          </div>
        </div>

        {/* Dynamic Gap Callout Box */}
        <div className="rounded-xl border border-[#24293D] bg-[#0E1017] px-4 py-2.5">
          <div className="flex items-center gap-2">
            {isLeader ? (
              <>
                <Award size={16} className="text-[#10B981]" />
                <p className="text-[12px] font-semibold text-[#10B981]">
                  👑 Market Leader! Highest rated business in your area.
                </p>
              </>
            ) : (
              <>
                <Target size={16} className="text-[#F59E0B]" />
                <p className="text-[12px] font-semibold text-[#F59E0B]">
                  🎯 Gap to #1: {reviewGapToLeader} more reviews to claim #1 rank.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Leaderboard */}
      <div className="mt-6 grid grid-cols-1 gap-6 desktop:grid-cols-12">
        {/* Left: Rating Comparison Bar Chart */}
        <div className="desktop:col-span-5 flex flex-col justify-between rounded-xl border border-[#21263B] bg-[#0E1017]/80 p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                Star Rating Comparison
              </span>
              <span className="text-[11px] font-medium text-[#64748B]">Google Maps Scale (1-5★)</span>
            </div>
            <p className="mt-1 text-[11.5px] text-[#94A0B8]">
              Client maintains a premium reputation score compared to market average.
            </p>
          </div>

          <div className="h-56 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#21263B" strokeDasharray="3 3" horizontal={false} opacity={0.5} />
                <XAxis type="number" domain={[3.5, 5.0]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#94A0B8', fontSize: 11.5, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle()} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="rating" name="Rating" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.is_client ? '#10B981' : '#334155'}
                      stroke={entry.is_client ? '#34D399' : 'none'}
                      strokeWidth={entry.is_client ? 1.5 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Detailed Competitor Leaderboard */}
        <div className="desktop:col-span-7 flex flex-col justify-between rounded-xl border border-[#21263B] bg-[#0E1017]/80 p-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-white flex items-center gap-1.5">
                <Flame size={14} className="text-[#10B981]" />
                Local Market Leaderboard & Velocity
              </span>
              <span className="text-[11px] font-medium text-[#10B981]">Updated Weekly</span>
            </div>
            <p className="mt-1 text-[11.5px] text-[#94A0B8]">
              Automated review invitations give you higher growth velocity than local rivals.
            </p>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-[#21263B] text-[11px] font-semibold uppercase text-[#64748B]">
                  <th className="py-2 px-2">Rank</th>
                  <th className="py-2 px-3">Business</th>
                  <th className="py-2 px-3">Rating</th>
                  <th className="py-2 px-3">Total Reviews</th>
                  <th className="py-2 px-3">Velocity</th>
                  <th className="py-2 px-2 text-right">Maps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2030]">
                {sorted.map((comp, idx) => {
                  const rank = idx + 1;
                  return (
                    <tr 
                      key={comp.id} 
                      className={`transition-colors ${
                        comp.is_client 
                          ? 'bg-[#10B981]/10 font-semibold text-white' 
                          : 'hover:bg-[#161925] text-[#94A0B8]'
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-2.5 px-2">
                        {rank === 1 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-[11px] font-bold text-amber-400">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 text-[11px] font-bold text-slate-300">
                            2
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/20 text-[11px] font-bold text-[#64748B]">
                            {rank}
                          </span>
                        )}
                      </td>

                      {/* Business Name */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={comp.is_client ? 'text-white font-bold' : 'text-[#CBD5E1]'}>
                            {comp.business_name}
                          </span>
                          {comp.is_client && (
                            <span className="rounded-full bg-[#10B981] px-2 py-0.2 text-[10px] font-extrabold text-[#0B0F19]">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Star Rating */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 font-bold text-white">
                          <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                          {comp.rating.toFixed(1)}
                        </span>
                      </td>

                      {/* Review Count */}
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {comp.review_count}
                      </td>

                      {/* Weekly Growth Velocity */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold ${
                          comp.is_client ? 'text-[#10B981]' : 'text-[#64748B]'
                        }`}>
                          <TrendingUp size={11} /> +{comp.weekly_growth}/mo
                        </span>
                      </td>

                      {/* Maps link */}
                      <td className="py-2.5 px-2 text-right">
                        <a
                          href={comp.maps_url || 'https://maps.google.com'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center h-6 w-6 rounded-lg text-[#64748B] hover:text-white hover:bg-[#21263B] transition-colors"
                          title="View on Google Maps"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
