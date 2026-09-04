import { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Loader2, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { USE_MOCK } from './lib/config';
import { triggerLiveSync, refreshAllData } from './lib/api';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import PageSkeleton from './components/States';
import AddCustomerModal from './components/AddCustomerModal';
import Overview from './pages/Overview';
import Customers from './pages/Customers';
import Issues from './pages/Issues';
import Reviews from './pages/Reviews';
import Settings from './pages/Settings';

const ROUTE_META = {
  '/': { title: 'Overview', subtitle: 'Follow-up pipeline & Google Review intelligence' },
  '/customers': { title: 'Customers', subtitle: 'Automated conversational outreach pipeline' },
  '/issues': { title: 'Issues', subtitle: 'Private feedback triage & manager resolution' },
  '/reviews': { title: 'Google Reviews', subtitle: 'Live GBP reviews scraped & sentiment tracked' },
  '/settings': { title: 'Settings', subtitle: 'Automation configuration & health' },
};

function MockBanner() {
  if (!USE_MOCK) return null;
  return (
    <div className="flex items-center justify-center gap-2 border-b border-[color:var(--border)] bg-[#10B981]/10 px-4 py-2 text-center text-[length:var(--text-sm)] font-medium text-[#059669] backdrop-blur">
      <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
      Demo Simulation Mode — Testing live without Google Sheets backend.
    </div>
  );
}

const productName = import.meta.env.VITE_PRODUCT_NAME || 'Review Engine';

function Shell() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [toast, setToast] = useState(null);

  if (loading) return <PageSkeleton />;
  if (!user) return <LoginScreen />;

  const meta = ROUTE_META[location.pathname] ?? ROUTE_META['/'];

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await refreshAllData();
      setToast({ type: 'success', message: 'Sheet data refreshed successfully!' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Refresh failed', err);
      setToast({ type: 'error', message: 'Failed to refresh data from Google Sheets' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      await triggerLiveSync();
      setToast({ type: 'success', message: 'Background Sync Started: Apify is scraping Google Maps in the background. New reviews will appear automatically!' });
      setTimeout(() => setToast(null), 5000);
    } catch (err) {
      console.error('Sync failed', err);
      setToast({ type: 'error', message: 'Sync request failed. Ensure n8n /sync-reviews webhook is active.' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[color:var(--bg)] font-sans antialiased">
      <Sidebar productName={productName} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col tablet:pl-[var(--sidebar-width)]">
        <MockBanner />
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed top-5 right-6 z-50 flex items-center gap-3 rounded-2xl border border-[#10B981]/30 bg-[#12141D] px-4 py-3 text-white shadow-2xl backdrop-blur-md"
            >
              {toast.type === 'success' ? (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EF4444]/20 text-[#EF4444]">
                  <AlertCircle size={16} strokeWidth={2.5} />
                </div>
              )}
              <span className="text-[13px] font-medium">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          actions={
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setAddCustomerOpen(true)}
                className="relative hidden tablet:flex h-10 items-center justify-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3.5 text-[13.5px] font-semibold text-[color:var(--text-primary)] shadow-sm transition-all hover:bg-[color:var(--state-hover-overlay)] hover:border-[color:var(--border-strong)] active:scale-[0.98]"
              >
                <UserPlus size={15} strokeWidth={2.2} className="text-[color:var(--accent)]" />
                <span>Add Customer</span>
              </button>

              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="relative flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-4 text-[13.5px] font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
              >
                {syncing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} strokeWidth={2.2} />
                )}
                <span className="hidden tablet:inline">{syncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-secondary)] transition-colors hover:bg-[color:var(--state-hover-overlay)] tablet:hidden"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          }
        />

        <main className="flex-1 p-4 tablet:p-8 max-w-[1600px] w-full mx-auto">
          <div className="mx-auto flex max-w-full flex-col gap-6">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Overview />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/issues" element={<Issues />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
        </main>

        <AddCustomerModal
          isOpen={addCustomerOpen}
          onClose={() => setAddCustomerOpen(false)}
          onCustomerAdded={() => {
            setToast({ type: 'success', message: 'Customer added! W1 outreach initiated.' });
            setTimeout(() => setToast(null), 4000);
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
