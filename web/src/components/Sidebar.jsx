import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Star, 
  Settings, 
  Search, 
  Sparkles, 
  ChevronDown,
  LogOut,
  ShieldCheck,
  Building2
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../lib/AuthContext';
import { useSheetData } from '../lib/useSheetData';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/issues', label: 'Issues', icon: AlertTriangle, badgeType: 'issues' },
  { to: '/reviews', label: 'Google Reviews', icon: Star, badgeType: 'reviews' },
];

function useIsDesktop() {
  const query = '(min-width: 768px)';
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return isDesktop;
}

export default function Sidebar({ productName = 'ReviewEngine', open, onClose }) {
  const isDesktop = useIsDesktop();
  const showDrawer = !isDesktop && open;
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real-time badge data
  const { rows: issues } = useSheetData('issues');
  const { rows: reviews } = useSheetData('reviews');
  const openIssuesCount = issues?.filter(i => i.status === 'open')?.length || 0;
  const reviewsCount = reviews?.length || 0;

  useEffect(() => {
    if (!showDrawer) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showDrawer, onClose]);

  return (
    <>
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            key="scrim"
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isDesktop || open ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 340, damping: 36 }}
        className="fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width)] flex-col bg-[#11131C] text-white border-r border-[#1F2333] shadow-2xl"
        aria-label="Primary navigation"
      >
        {/* Brand Header */}
        <div className="flex flex-col gap-3 px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] shadow-[0_0_20px_rgba(16,185,129,0.35)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="white"/>
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[16px] font-bold tracking-tight text-white font-display">
                  {productName}
                </span>
              </div>
              <span className="inline-block text-[11px] font-medium text-[#10B981] tracking-wide">
                Review Management System
              </span>
            </div>
          </div>

          {/* Workspace Pill Dropdown */}
          <div className="mt-2 flex items-center justify-between rounded-xl bg-[#1A1E2D] border border-[#262C42] px-3 py-2 text-[12px] text-[#A2A9BD] hover:border-[#374061] transition-colors cursor-pointer group">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#10B981]/15 text-[#10B981]">
                <Building2 size={13} strokeWidth={2.4} />
              </span>
              <div className="truncate">
                <p className="text-[10px] uppercase font-semibold tracking-wider text-[#636C87]">Workspace</p>
                <p className="text-[12px] font-medium text-white truncate">Main Showroom</p>
              </div>
            </div>
            <ChevronDown size={14} className="text-[#636C87] group-hover:text-white transition-colors shrink-0" />
          </div>

          {/* Quick Search */}
          <div className="relative mt-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#636C87]" />
            <input
              type="text"
              placeholder="Search for..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-[#24293E] bg-[#161926] pl-9 pr-12 text-[12.5px] text-white placeholder-[#636C87] outline-none transition-all focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-[#202538] px-1.5 py-0.5 text-[10px] font-semibold text-[#8C95AF]">
              ⌘F
            </span>
          </div>
        </div>

        {/* Navigation Category */}
        <div className="px-5 pt-2 pb-1">
          <p className="text-[11px] font-bold tracking-wider text-[#5A637E] uppercase">
            Navigation
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 px-3 py-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              aria-label={item.label}
              className={({ isActive }) =>
                clsx(
                  'group relative flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150',
                  isActive 
                    ? 'sidebar-nav-active' 
                    : 'text-[#8D96B0] hover:bg-[#1A1E2D] hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <item.icon 
                      size={18} 
                      className={clsx(
                        "shrink-0 transition-colors", 
                        isActive ? "text-[#10B981]" : "text-[#636C87] group-hover:text-white"
                      )} 
                      strokeWidth={2.2} 
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5">
                    {item.badgeType === 'issues' && openIssuesCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10.5px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                        {openIssuesCount}
                      </span>
                    )}
                    {item.badgeType === 'reviews' && reviewsCount > 0 && (
                      <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#10B981]/20 border border-[#10B981]/40 px-1.5 text-[10.5px] font-bold text-[#34D399]">
                        {reviewsCount}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-dot"
                        className="h-1.5 w-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                  </div>
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-4 px-2">
            <p className="text-[11px] font-bold tracking-wider text-[#5A637E] uppercase">
              System
            </p>
          </div>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'group relative flex min-h-[44px] items-center justify-between rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-all duration-150',
                isActive ? 'sidebar-nav-active' : 'text-[#8D96B0] hover:bg-[#1A1E2D] hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Settings size={18} className={clsx("shrink-0", isActive ? "text-[#10B981]" : "text-[#636C87] group-hover:text-white")} strokeWidth={2.2} />
                  <span>Settings</span>
                </div>
                <span className="rounded bg-[#1F2436] px-1.5 py-0.5 text-[10px] font-semibold text-[#10B981]">
                  Live
                </span>
              </>
            )}
          </NavLink>
        </nav>

        {/* User Account Card at Bottom */}
        <div className="p-4 border-t border-[#1F2333]">
          <div className="flex items-center justify-between rounded-xl bg-[#171A27] border border-[#24293D] p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#10B981] text-white text-[13px] font-bold shadow-md">
                <span>{user?.email?.charAt(0)?.toUpperCase() || 'A'}</span>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-[#171A27]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-semibold text-white">
                  {user?.email ? user.email.split('@')[0] : 'Admin User'}
                </p>
                <p className="truncate text-[10.5px] text-[#717B99] font-medium">
                  Store Owner #2026
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6C7694] hover:bg-[#252B42] hover:text-[#EF4444] transition-colors"
            >
              <LogOut size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
