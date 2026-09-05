import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  ShieldAlert,
  X
} from 'lucide-react';
import { useSheetData } from '../lib/useSheetData';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { rows: issues } = useSheetData('issues');
  const { rows: reviews } = useSheetData('reviews');
  const { rows: track } = useSheetData('track');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate dynamic notification items from live Google Sheets data
  const notifications = useMemo(() => {
    const list = [];

    // 1. Open Issues needing immediate owner intervention (Urgent)
    issues
      .filter((i) => i.status === 'open')
      .forEach((i) => {
        list.push({
          id: `issue-${i.id}`,
          type: 'urgent_issue',
          priority: 'urgent',
          title: `Action Required: Complaint from ${i.customer_name || 'Customer'}`,
          description: i.summary || 'Customer flagged a service problem in email outreach.',
          time: i.created_at ? new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending action',
          link: '/issues',
          actionText: 'Resolve in Issues',
          icon: AlertTriangle,
          color: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.12)',
        });
      });

    // 2. Negative / 1-Star Google Reviews on Google Maps
    reviews
      .filter((r) => Number(r.rating) <= 2)
      .slice(0, 3)
      .forEach((r) => {
        list.push({
          id: `bad-review-${r.id}`,
          type: 'bad_review',
          priority: 'warning',
          title: `⚠️ ${r.rating}★ Review from ${r.author || 'Anonymous'} on Google`,
          description: r.text ? `"${r.text.slice(0, 85)}${r.text.length > 85 ? '...' : ''}"` : 'Negative review left on Google Business Profile.',
          time: r.captured_at ? new Date(r.captured_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recent',
          link: '/reviews',
          actionText: 'View on Google',
          externalUrl: r.url,
          icon: ShieldAlert,
          color: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.12)',
        });
      });

    // 3. Customers who replied with feedback
    track
      .filter((t) => t.status === 'replied' && t.reply_text)
      .slice(0, 2)
      .forEach((t) => {
        list.push({
          id: `reply-${t.id}`,
          type: 'reply',
          priority: 'info',
          title: `💬 Feedback Reply from ${t.customer_name}`,
          description: `"${t.reply_text.slice(0, 75)}${t.reply_text.length > 75 ? '...' : ''}"`,
          time: t.feedback_reply_at ? new Date(t.feedback_reply_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          link: '/customers',
          actionText: 'View in Pipeline',
          icon: MessageSquare,
          color: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.12)',
        });
      });

    // 4. Fresh 5-Star Reviews
    reviews
      .filter((r) => Number(r.rating) === 5)
      .slice(0, 2)
      .forEach((r) => {
        list.push({
          id: `5star-${r.id}`,
          type: '5star_review',
          priority: 'success',
          title: `⭐ New 5-Star Google Review by ${r.author || 'Customer'}!`,
          description: r.text ? `"${r.text.slice(0, 80)}..."` : '5-star rating captured via automated follow-up.',
          time: r.captured_at ? new Date(r.captured_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Verified',
          link: '/reviews',
          actionText: 'View Reviews',
          icon: Star,
          color: '#10B981',
          bg: 'rgba(16, 185, 129, 0.12)',
        });
      });

    return list;
  }, [issues, reviews, track]);

  const urgentCount = notifications.filter((n) => n.priority === 'urgent' || n.priority === 'warning').length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button with Dynamic Badge */}
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] shadow-sm transition-all hover:bg-[color:var(--state-hover-overlay)] hover:text-[color:var(--text-primary)] active:scale-95"
      >
        <Bell size={17} strokeWidth={2} />
        {urgentCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EF4444] px-1 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {urgentCount}
          </span>
        ) : notifications.length > 0 ? (
          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[#10B981]" />
        ) : null}
      </button>

      {/* Popover Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-80 tablet:w-96 rounded-2xl border border-[#21263B] bg-[#12141D]/95 p-4 text-white shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#21263B] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[14px]">Live System Alerts</span>
                {urgentCount > 0 && (
                  <span className="rounded-full bg-[#EF4444]/20 px-2 py-0.5 text-[11px] font-bold text-[#EF4444] border border-[#EF4444]/30">
                    {urgentCount} Urgent
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#64748B] hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Notification List */}
            <div className="mt-3 max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`group relative rounded-xl border p-3 transition-all hover:bg-[#1A1D2B] ${
                        item.priority === 'urgent'
                          ? 'border-[#EF4444]/40 bg-[#EF4444]/5'
                          : item.priority === 'warning'
                          ? 'border-[#F59E0B]/40 bg-[#F59E0B]/5'
                          : 'border-[#21263B] bg-[#151824]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5"
                          style={{ background: item.bg, color: item.color }}
                        >
                          <Icon size={16} strokeWidth={2.4} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[12.5px] font-semibold text-white truncate">
                              {item.title}
                            </p>
                            <span className="shrink-0 text-[10px] text-[#64748B]">
                              {item.time}
                            </span>
                          </div>

                          <p className="mt-1 text-[11.5px] leading-relaxed text-[#94A0B8] line-clamp-2">
                            {item.description}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between">
                            {item.externalUrl ? (
                              <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B] hover:underline"
                              >
                                View on Google Maps <ExternalLink size={11} />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  navigate(item.link);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981] hover:underline"
                              >
                                {item.actionText} <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-[12.5px] text-[#64748B]">
                  <CheckCircle2 size={24} className="mx-auto text-[#10B981] mb-2 opacity-80" />
                  All clear! No pending issues or alerts right now.
                </div>
              )}
            </div>

            {/* Footer Quick Action */}
            <div className="mt-3 border-t border-[#21263B] pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/issues');
                }}
                className="text-[11.5px] font-semibold text-[#94A0B8] hover:text-[#10B981] transition-colors"
              >
                Go to Issue Management &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
