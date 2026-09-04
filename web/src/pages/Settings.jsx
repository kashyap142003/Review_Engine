import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Activity, Info, Sun, Moon, CheckCircle2, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import Page from '../components/Page';

const productName = import.meta.env.VITE_PRODUCT_NAME || 'Review Engine';

const FIELD_LABELS = {
  sheet_id: 'Google Sheet ID',
  gbp_review_url: 'Google review URL',
  reminder_days: 'Reminder delay (days)',
};

function SettingField({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">{label}</p>
        <p className="mt-0.5 break-all text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">{value}</p>
      </div>
      <span className="whitespace-nowrap rounded-[var(--radius-full)] bg-[color:var(--surface-muted)] px-2.5 py-1 text-[length:var(--text-xs)] font-semibold text-[color:var(--text-muted)]">
        Read-only
      </span>
    </div>
  );
}

export default function Settings() {
  const [theme, setTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('review-engine-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  return (
    <Page>
      <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2">
        <GlassCard hover={false} className="p-[var(--space-6)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
              <Sliders size={20} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
                Appearance & Theme
              </h2>
              <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">
                Switch between light and dark mode. Light is active by default.
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={20} className="text-[color:var(--accent)]" /> : <Sun size={20} className="text-[color:var(--warning)]" />}
              <div>
                <p className="text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
                  {theme === 'dark' ? 'Dark theme' : 'Light theme (default)'}
                </p>
                <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">
                  {theme === 'dark' ? 'Aurora dark palette active' : 'Aurora light palette active'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)] transition-all duration-[var(--transition-fast)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            >
              Toggle theme
            </button>
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-[var(--space-6)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
              <ShieldCheck size={20} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
                Configuration
              </h2>
              <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">
                Managed in Google Sheets and n8n workflows.
              </p>
            </div>
          </div>
          <div className="mt-4 divide-y divide-[color:var(--border)]">
            <SettingField label={FIELD_LABELS.sheet_id} value="Configured in the sheets-proxy function" />
            <SettingField label={FIELD_LABELS.gbp_review_url} value="Configured in the review-redirect function" />
            <SettingField label={FIELD_LABELS.reminder_days} value="Configured in the W3 reminder workflow" />
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-[var(--space-6)] desktop:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--success-soft)] text-[color:var(--success)]">
              <Activity size={20} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
                Automation status
              </h2>
              <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">
                Operational health of the n8n workflows and server proxies.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-3 tablet:grid-cols-2">
            {[
              'W1 — Follow-up & review invite (Sheets trigger)',
              'W2 — Reply & issue detection (Gmail trigger + AI)',
              'W3 — No-click reminder (daily)',
              'W4 — Google Business Profile review intake (daily)',
              'W5 — Review-link click logging (webhook)',
              'Proxy — Sheets read + issue resolve (Edge Function)',
              'Redirect — /r/:id click redirect (Edge Function)',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
                <CheckCircle2 size={18} className="shrink-0 text-[color:var(--success)]" />
                <span className="min-w-0 flex-1 truncate text-[length:var(--text-xs)] font-semibold text-[color:var(--text-primary)]">{item}</span>
                <span className="rounded-[var(--radius-full)] bg-[color:var(--success-soft)] px-2 py-0.5 text-[length:var(--text-xs)] font-bold text-[color:var(--success)]">
                  Active
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover={false} className="p-[var(--space-6)] desktop:col-span-2">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
              <Info size={20} strokeWidth={2.2} />
            </span>
            <div>
              <h2 className="rv-display text-[length:var(--text-base)] font-bold text-[color:var(--text-primary)]">
                About {productName}
              </h2>
              <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">
                Automated customer follow-up & Google review management for local businesses.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-1 text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">
            <p>Single-tenant · email channel active · WhatsApp channel reserved</p>
            <p>Source of record: Google Sheets · Auth & proxy: Supabase</p>
          </div>
        </GlassCard>
      </div>
    </Page>
  );
}
