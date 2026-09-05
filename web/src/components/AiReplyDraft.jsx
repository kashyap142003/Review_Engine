import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, ExternalLink, RefreshCw, ChevronUp, MessageSquare } from 'lucide-react';

const TONES = [
  { id: 'warm', label: 'Warm & Friendly' },
  { id: 'professional', label: 'Professional' },
  { id: 'short', label: 'Short & Punchy' },
];

function generateReply(review, tone = 'warm') {
  const author = (review.author || 'there').trim();
  const rating = Number(review.rating) || 5;
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

export default function AiReplyDraft({ review }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState('warm');
  const [copied, setCopied] = useState(false);
  const [customText, setCustomText] = useState('');

  // Initial generated draft
  const draftText = useMemo(() => {
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
    setCustomText(''); // reset custom edits when switching tone
  }

  return (
    <div className="mt-4 border-t border-[color:var(--border)] pt-3.5">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1.5 text-[12px] font-semibold text-[#A78BFA] transition-all hover:bg-[#8B5CF6]/20 active:scale-95"
        >
          <Sparkles size={13} className="text-[#A78BFA]" />
          <span>{isOpen ? 'Close AI Draft' : 'Ask AI to draft reply'}</span>
        </button>

        {review.url && (
          <a
            href={review.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[color:var(--accent)] hover:underline"
          >
            <span>View on Google</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pt-3"
          >
            <div className="rounded-xl border border-[#8B5CF6]/25 bg-[#17152B]/90 p-3.5 shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-[#8B5CF6]/20">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#A78BFA] uppercase tracking-wider">
                  <Sparkles size={12} />
                  <span>AI Suggested Reply</span>
                </div>

                {/* Tone Selector Pills */}
                <div className="flex items-center gap-1">
                  {TONES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleToneChange(t.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                        selectedTone === t.id && customText === ''
                          ? 'bg-[#8B5CF6] text-white shadow-sm'
                          : 'text-[#94A0B8] hover:text-white bg-[#8B5CF6]/10'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Response Preview */}
              <div className="mt-2.5">
                <textarea
                  value={activeText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-[#8B5CF6]/20 bg-[#0F0E1C] p-2.5 text-[12px] leading-relaxed text-[#E2E8F0] outline-none transition-colors focus:border-[#8B5CF6] resize-none"
                  placeholder="Draft your reply..."
                />
              </div>

              {/* Action Toolbar */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <p className="text-[10.5px] text-[#64748B]">
                  Click to copy & paste directly on Google Maps
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] px-3 py-1.5 text-[11.5px] font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-95"
                  >
                    {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Reply'}</span>
                  </button>

                  {review.url && (
                    <a
                      href={review.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/20 px-3 py-1.5 text-[11.5px] font-bold text-[#A78BFA] hover:bg-[#8B5CF6]/30 transition-all"
                    >
                      <span>Open Google</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
