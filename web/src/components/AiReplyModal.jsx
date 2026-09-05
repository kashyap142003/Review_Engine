import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, ExternalLink, X, Star } from 'lucide-react';

const TONES = [
  { id: 'warm', label: 'Warm & Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'short', label: 'Short & Punchy' },
];

function generateReply(review, tone = 'warm') {
  const author = (review?.author || 'there').trim();
  const rating = Number(review?.rating) || 5;
  const isPositive = rating >= 4;

  if (isPositive) {
    if (tone === 'warm') {
      return `Hi ${author}, thank you so much for the fantastic ${rating}-star review! Our team is dedicated to providing top-quality service, and hearing that you had such a wonderful experience truly makes our day. We look forward to serving you again whenever you need us!`;
    }
    if (tone === 'professional') {
      return `Thank you for taking the time to leave this positive feedback, ${author}. We hold our customer service to the highest standard, and we are pleased to know our team met your expectations. Thank you for choosing us!`;
    }
    return `Thanks so much for the ${rating}-star review, ${author}! We really appreciate your support and look forward to helping you again next time.`;
  } else {
    if (tone === 'warm') {
      return `Dear ${author}, thank you for bringing this to our attention. We always aim to provide exceptional service, and we sincerely apologize that your experience did not meet expectations. We take this feedback seriously and would appreciate the opportunity to make things right. Please reach out to our management directly so we can assist you.`;
    }
    if (tone === 'professional') {
      return `Thank you for your feedback, ${author}. We hold our operations to high standards and regret to hear that your experience fell short. We would welcome the chance to address your specific concerns directly. Please contact our office so we can look into this matter immediately.`;
    }
    return `Hi ${author}, we are very sorry to hear about your experience. Customer satisfaction is our top priority. Please contact our team directly at your earliest convenience so we can work together to resolve this.`;
  }
}

export default function AiReplyModal({ review, isOpen, onClose }) {
  const [selectedTone, setSelectedTone] = useState('warm');
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');

  const draftText = useMemo(() => {
    if (!review) return '';
    return generateReply(review, selectedTone);
  }, [review, selectedTone]);

  const activeText = customText !== '' ? customText : draftText;

  function handleCopy() {
    navigator.clipboard.writeText(activeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleToneChange(toneId) {
    setSelectedTone(toneId);
    setCustomText('');
  }

  if (!isOpen || !review) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-xl rounded-2xl border border-[#2A2640] bg-[#131122] p-6 text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2640] pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8B5CF6]/20 text-[#A78BFA] border border-[#8B5CF6]/30">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="font-bold text-[15px] text-white">
                  AI Review Reply Assistant
                </h3>
                <p className="text-[12px] text-[#94A0B8]">
                  Draft a tailored response in the owner's voice and paste on Google Maps
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#1E1C30] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Original Review Quote Box */}
          <div className="mt-4 rounded-xl border border-[#2A2640] bg-[#0C0A17] p-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white">
                  {review.author || 'Anonymous'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star size={10} className="fill-amber-400" />
                  {review.rating || 5} Stars
                </span>
              </div>
              <span className="text-[11px] text-[#64748B]">
                {review.captured_at ? new Date(review.captured_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
              </span>
            </div>
            <p className="mt-2 text-[12px] italic text-[#94A0B8] leading-relaxed line-clamp-3">
              "{review.text || 'No review text provided.'}"
            </p>
          </div>

          {/* Tone Selector */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#94A0B8]">
              Select Tone Preset:
            </span>
            <div className="flex items-center gap-1.5">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToneChange(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    selectedTone === t.id && customText === ''
                      ? 'bg-[#8B5CF6] text-white shadow-md'
                      : 'border border-[#2A2640] bg-[#1E1C30] text-[#94A0B8] hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="mt-3">
            <textarea
              value={activeText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-[#2A2640] bg-[#0C0A17] p-3 text-[12.5px] leading-relaxed text-[#E2E8F0] outline-none transition-colors focus:border-[#8B5CF6] resize-none"
              placeholder="Drafting response..."
            />
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-4 flex items-center justify-between border-t border-[#2A2640] pt-4">
            <p className="text-[11px] text-[#64748B]">
              1. Copy reply &rarr; 2. Open Google Maps &rarr; 3. Paste
            </p>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-4 py-2 text-[12.5px] font-bold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Reply'}</span>
              </button>

              <a
                href={review.url || 'https://maps.google.com'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/40 bg-[#8B5CF6]/20 px-3.5 py-2 text-[12.5px] font-semibold text-[#A78BFA] hover:bg-[#8B5CF6]/30 transition-all"
              >
                <span>View on Google</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
