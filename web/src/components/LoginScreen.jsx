import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { EASE } from '../lib/motion';

const productName = import.meta.env.VITE_PRODUCT_NAME || 'Review Engine';

function AuroraLoginBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <span
        className="rv-aurora-blob left-[-10%] top-[-12%] h-[50vw] w-[50vw]"
        style={{ background: 'color-mix(in srgb, var(--aurora-a) 40%, transparent)', animation: 'rv-aurora-drift 26s ease-in-out infinite' }}
      />
      <span
        className="rv-aurora-blob right-[-12%] top-[6%] h-[42vw] w-[42vw]"
        style={{ background: 'color-mix(in srgb, var(--aurora-c) 34%, transparent)', animation: 'rv-aurora-drift 32s ease-in-out infinite reverse' }}
      />
      <span
        className="rv-aurora-blob bottom-[-16%] left-[30%] h-[46vw] w-[46vw]"
        style={{ background: 'color-mix(in srgb, var(--aurora-d) 30%, transparent)', animation: 'rv-aurora-drift 38s ease-in-out infinite', animationDelay: '-10s' }}
      />
    </div>
  );
}

export default function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError('Sign-in failed. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--bg)] p-4">
      <AuroraLoginBackdrop />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="rv-glass w-full max-w-md rounded-[var(--radius-xl)] p-[var(--space-8)] shadow-[var(--shadow-pop)]"
      >
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.1 }}
            className="rv-display flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] text-[length:var(--text-2xl)] font-bold text-[color:var(--accent-fg)] shadow-[var(--glow-accent)]"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {productName.charAt(0)}
          </motion.span>
          <h1 className="rv-display mt-4 text-[length:var(--text-3xl)] font-bold text-[color:var(--text-primary)]">
            {productName}
          </h1>
          <p className="mt-1.5 text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
            Sign in to your customer follow-up dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
              Email
            </label>
            <div className="relative mt-1.5">
              <Mail
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] pl-10 pr-4 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none transition-all duration-[var(--transition-fast)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:shadow-[var(--glow-accent)]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
              />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] pl-10 pr-4 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none transition-all duration-[var(--transition-fast)] placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)] focus:shadow-[var(--glow-accent)]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quick-fill" className="block text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
              Quick Fill (Demo)
            </label>
            <div className="relative mt-1.5">
              <select
                id="quick-fill"
                onChange={(e) => {
                  if (e.target.value === 'admin') {
                    setEmail('admin@example.com');
                    setPassword(import.meta.env.VITE_N8N_API_TOKEN || 'demo123');
                  }
                  e.target.value = '';
                }}
                className="h-12 w-full appearance-none rounded-[var(--radius-md)] border border-[color:var(--border)] bg-[color:var(--surface)] pl-4 pr-10 text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none transition-all duration-[var(--transition-fast)] focus:border-[color:var(--accent)] focus:shadow-[var(--glow-accent)]"
              >
                <option value="">-- Select to auto-fill --</option>
                <option value="admin">Admin (admin@example.com)</option>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[color:var(--text-muted)]"></div>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-[var(--radius-md)] bg-[color:var(--danger-soft)] px-3 py-2 text-[length:var(--text-sm)] font-medium text-[color:var(--danger)]"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? undefined : { y: -2 }}
            whileTap={submitting ? undefined : { scale: 0.98 }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-semibold text-[color:var(--accent-fg)] shadow-[var(--glow-accent)] transition-shadow disabled:opacity-[var(--state-disabled-opacity)]"
            style={{ background: 'var(--gradient-brand)' }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
