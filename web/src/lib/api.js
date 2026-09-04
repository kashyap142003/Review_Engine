import { USE_MOCK } from './config';
import { getMockSheet, mockResolveIssue } from './mockData';
import { n8nFetchOverview, n8nResolveIssue, n8nSyncReviews, n8nAddCustomer } from './n8nApi';

// ---------------------------------------------------------------------------
// Reactive Event Bus for Live Google Sheet Synchronization
// ---------------------------------------------------------------------------
const syncListeners = new Set();

export function subscribeToSync(listener) {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

export function notifySync(payload = {}) {
  syncListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (err) {
      console.error('Error in sync listener:', err);
    }
  });
}

// ---------------------------------------------------------------------------
// In-Flight Promise & Robust Cache Layer
// ---------------------------------------------------------------------------
let overviewCache = null;
let overviewCacheTs = 0;
let lastFetchCompletedTs = 0;
let inFlightPromise = null;

// Cache TTL: 30 seconds for instant navigation and zero-burst tab switching
const CACHE_TTL_MS = 30_000;
// Minimum cooldown between actual network requests to protect n8n & Google Sheets from rate limits
const MIN_COOLDOWN_MS = 8_000;

export function invalidateCache() {
  overviewCache = null;
  overviewCacheTs = 0;
  lastFetchCompletedTs = 0;
}

export async function fetchOverviewLive(force = false) {
  const now = Date.now();
  
  // 1. Return cached data if fresh (within TTL) and not forced
  if (!force && overviewCache && (now - overviewCacheTs < CACHE_TTL_MS)) {
    return overviewCache;
  }

  // 2. Cooldown guard: even if forced, if a fetch completed recently (< 8s), return cached data
  if (overviewCache && (now - lastFetchCompletedTs < MIN_COOLDOWN_MS)) {
    return overviewCache;
  }

  // 3. Request deduplication: if a request is already in-flight, reuse it
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = n8nFetchOverview()
    .then((data) => {
      overviewCache = data;
      overviewCacheTs = Date.now();
      lastFetchCompletedTs = Date.now();
      inFlightPromise = null;
      return data;
    })
    .catch((err) => {
      inFlightPromise = null;
      // If we have previous cached data, log a warning and return cache gracefully
      if (overviewCache) {
        console.warn('[Review Engine API] Background sync failed, serving cached data:', err.message);
        return overviewCache;
      }
      overviewCacheTs = 0;
      throw err;
    });

  return inFlightPromise;
}

export async function refreshAllData() {
  invalidateCache();
  const data = await fetchOverviewLive(true);
  notifySync({ type: 'manual_refresh' });
  return data;
}

// ---------------------------------------------------------------------------
// Smart Tab-Focus & Background Auto-Revalidation
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  // 1. When switching tabs back from Google Sheets to the dashboard, refresh automatically
  const handleFocusOrVisible = () => {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      // If at least 3 seconds have passed since last fetch and no request is in-flight:
      if (!inFlightPromise && (now - lastFetchCompletedTs >= 3_000)) {
        fetchOverviewLive(true)
          .then(() => {
            notifySync({ type: 'focus_refresh' });
          })
          .catch((err) => {
            console.warn('[Review Engine Focus Sync]', err.message);
          });
      }
    }
  };

  window.addEventListener('focus', handleFocusOrVisible);
  document.addEventListener('visibilitychange', handleFocusOrVisible);

  // 2. Polite background poller: polls every 12s when tab is active so changes reflect live
  setInterval(() => {
    if (!USE_MOCK && document.visibilityState === 'visible') {
      const now = Date.now();
      if (!inFlightPromise && (now - lastFetchCompletedTs >= 10_000)) {
        fetchOverviewLive(true)
          .then(() => {
            notifySync({ type: 'background_refresh' });
          })
          .catch((err) => {
            console.warn('[Review Engine Poller]', err.message);
          });
      }
    }
  }, 12_000);
}

export async function fetchSheet(sheet, force = false) {
  if (USE_MOCK) return getMockSheet(sheet);
  const all = await fetchOverviewLive(force);
  return all[sheet] ?? { rows: [] };
}

export async function resolveIssue(issueId) {
  if (USE_MOCK) return mockResolveIssue(issueId);
  invalidateCache();
  const res = await n8nResolveIssue(issueId);
  notifySync({ type: 'issue_resolved', issueId });
  return res;
}

export async function addCustomer(customerData) {
  if (USE_MOCK) {
    const row = {
      id: `cust_${Date.now()}`,
      customer_name: customerData.customer_name,
      email: customerData.email,
      phone: customerData.phone || '',
      service: customerData.service || 'General Service',
      completion_date: customerData.completion_date || new Date().toISOString().slice(0, 10),
      channel: customerData.channel || 'email',
      status: 'pending',
      review_click_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const mockTrack = getMockSheet('track');
    mockTrack.rows.unshift(row);
    invalidateCache();
    notifySync({ type: 'customer_added', row });
    return { ok: true, row };
  }

  const res = await n8nAddCustomer(customerData);
  invalidateCache();
  await fetchOverviewLive(true);
  notifySync({ type: 'customer_added', customerData });
  return res;
}

// Trigger manual SerpAPI sync and automatically broadcast updates across the app
export async function triggerLiveSync() {
  if (USE_MOCK) {
    invalidateCache();
    notifySync({ type: 'sync_complete' });
    return { ok: true };
  }

  const result = await n8nSyncReviews();
  invalidateCache();
  // Fetch fresh data immediately so subsequent cache hits are instant
  await fetchOverviewLive(true);
  notifySync({ type: 'sync_complete', result });
  return result;
}

export async function fetchOverview() {
  const [track, issues, reviews, activity] = await Promise.all([
    fetchSheet('track'),
    fetchSheet('issues'),
    fetchSheet('reviews'),
    fetchSheet('activity'),
  ]);
  return { track, issues, reviews, activity };
}
