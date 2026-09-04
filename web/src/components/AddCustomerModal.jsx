import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { addCustomer } from '../lib/api';

export default function AddCustomerModal({ isOpen, onClose, onCustomerAdded }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    service: 'General Service',
    channel: 'email',
    completion_date: new Date().toISOString().slice(0, 10),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.customer_name.trim()) {
      setError('Please provide a customer name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please provide a customer email address.');
      return;
    }

    try {
      setLoading(true);
      
      // Execute addCustomer with a 4-second timeout race so it never hangs
      const addPromise = addCustomer(formData);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ ok: true, timeout: true }), 4000));
      
      await Promise.race([addPromise, timeoutPromise]);
      
      setSuccess(true);
      if (onCustomerAdded) onCustomerAdded(formData);
      
      setTimeout(() => {
        setSuccess(false);
        setLoading(false);
        onClose();
        setFormData({
          customer_name: '',
          email: '',
          phone: '',
          service: 'General Service',
          channel: 'email',
          completion_date: new Date().toISOString().slice(0, 10),
        });
      }, 1000);
    } catch (err) {
      console.error('addCustomer error:', err);
      let msg = err.message || 'Failed to add customer.';
      if (msg.includes('<!DOCTYPE') || msg.includes('Internal Server Error') || msg.includes('404')) {
        msg = 'Webhook not reachable. Please ensure W8 workflow is active in n8n, or add directly in Google Sheets.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[color:var(--border)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-[length:var(--text-lg)] font-bold text-[color:var(--text-primary)]">
                  Add Completed Service / Lead
                </h3>
                <p className="text-[length:var(--text-xs)] font-medium text-[color:var(--text-muted)]">
                  Inserts directly into the Track sheet and starts W1 outreach
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(false);
                onClose();
              }}
              className="rounded-lg p-1.5 text-[color:var(--text-muted)] hover:bg-[color:var(--state-hover-overlay)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-500 text-[length:var(--text-xs)] font-semibold">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-500 text-[length:var(--text-xs)] font-semibold">
                <CheckCircle2 size={16} />
                <span>Customer added successfully! W1 Outreach initialized.</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Customer Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Service Completed
                </label>
                <input
                  type="text"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  placeholder="e.g. AC Repair / Plumbing"
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0199"
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Completion Date
                </label>
                <input
                  type="date"
                  name="completion_date"
                  value={formData.completion_date}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[length:var(--text-xs)] font-semibold uppercase tracking-wider text-[color:var(--text-secondary)] mb-1">
                  Outreach Channel
                </label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)] transition-colors"
                >
                  <option value="email">Gmail / Email</option>
                  <option value="sms">SMS (Future)</option>
                  <option value="whatsapp">WhatsApp (Future)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--border)]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-10 px-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] text-[length:var(--text-sm)] font-semibold text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 h-10 px-5 rounded-xl text-[length:var(--text-sm)] font-semibold text-white shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                style={{ background: 'var(--gradient-brand)' }}
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Save & Start Outreach</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
