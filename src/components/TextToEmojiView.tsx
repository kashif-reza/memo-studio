import React, { useState, useMemo } from 'react';
import {
  Wand2,
  Copy,
  RefreshCw,
  Trash2,
  Sparkles,
  Check,
  MessageSquareHeart,
  Sliders,
} from 'lucide-react';
import {
  CONVERTER_SAMPLE_PROMPTS,
  EmojiIntensityMode,
  READABILITY_TEST_EXAMPLES,
  convertTextToEmoji,
} from '../utils/textToEmojiEngine';
import { FormattedEmojiText } from './FormattedEmojiText';

interface TextToEmojiViewProps {
  embedded?: boolean;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  onRecordRecentEmoji?: (emoji: string) => void;
}

const INTENSITY_MODES: Array<{
  id: EmojiIntensityMode;
  label: string;
  desc: string;
  badge: string;
}> = [
  { id: 'subtle', label: 'Subtle', desc: 'Minimal, clean accents', badge: '1–2 Emojis' },
  { id: 'balanced', label: 'Balanced', desc: 'Natural & expressive', badge: 'Recommended' },
  { id: 'expressive', label: 'Expressive', desc: 'Rich emotional energy', badge: 'Vibrant' },
  { id: 'funny', label: 'Funny', desc: 'Playful meme energy', badge: 'Playful' },
];

export const TextToEmojiView: React.FC<TextToEmojiViewProps> = ({
  embedded = false,
  onToast,
}) => {
  const [inputText, setInputText] = useState(
    'I am happy today because I passed my exam. I love coffee and rainy days!'
  );
  const [intensity, setIntensity] = useState<EmojiIntensityMode>('balanced');
  const [variationSeed, setVariationSeed] = useState(0);
  const [copiedResult, setCopiedResult] = useState(false);
  const [previewFontSize, setPreviewFontSize] = useState(18);

  const convertedOutput = useMemo(
    () => convertTextToEmoji(inputText, intensity, variationSeed),
    [inputText, intensity, variationSeed]
  );

  const handleCopyOutput = async (textToCopy: string, label = 'Converted message') => {
    if (!textToCopy.trim()) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 1800);
      onToast(`${label} copied to clipboard!`, 'success');
    } catch {
      onToast('Clipboard access failed.', 'error');
    }
  };

  return (
    <div className={embedded ? 'space-y-6' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'}>
      {!embedded && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4925] mb-1">
            <Wand2 className="w-3.5 h-3.5" />
            MEMO Intelligent Text-to-Emoji Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Enrich Any Message with Contextual Emojis
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Preserves your original words and places meaningful, non-overlapping emojis at natural emotional beats.
          </p>
        </div>
      )}

      {/* Main Converter Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF4925]" />
              Text to Emoji Converter
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choose an intensity mode and click Regenerate to cycle fresh emoji combinations.
            </p>
          </div>

          {/* Sample Prompt Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Try sample:</span>
            {CONVERTER_SAMPLE_PROMPTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => {
                  setInputText(sample.text);
                  setVariationSeed(0);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#FF4925]/10 hover:text-[#FF4925] transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {INTENSITY_MODES.map((mode) => {
            const active = intensity === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setIntensity(mode.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'border-[#FF4925] bg-[#FF4925]/5 dark:bg-[#FF4925]/10 ring-1 ring-[#FF4925]'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span
                    className={`text-xs font-bold ${
                      active ? 'text-[#FF4925]' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {mode.label}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {mode.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{mode.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Input & Output Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="memo-text-to-emoji-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Original Text Input
              </label>
              <button
                type="button"
                onClick={() => setInputText('')}
                disabled={!inputText}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-500 disabled:opacity-40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
            <textarea
              id="memo-text-to-emoji-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a sentence, status update, or message..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 p-4 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925] resize-none"
            />
          </div>

          {/* Output Preview Box with Guaranteed Non-Overlapping Formatting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF4925]">
                Emoji-Enhanced Output Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVariationSeed((s) => s + 1);
                    onToast('Regenerated fresh contextual emojis!', 'info');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#FF4925] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>

            <div
              style={{ fontSize: `${previewFontSize}px` }}
              className="min-h-[112px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/90 p-4 text-slate-900 dark:text-slate-100 flex items-center"
            >
              {convertedOutput ? (
                <FormattedEmojiText text={convertedOutput} />
              ) : (
                <span className="text-sm text-slate-400 italic">
                  Type a message on the left to generate contextual emojis...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Preview Text Size: {previewFontSize}px
            </span>
            <input
              type="range"
              min={14}
              max={26}
              value={previewFontSize}
              onChange={(e) => setPreviewFontSize(Number(e.target.value))}
              className="w-28 accent-[#FF4925]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setVariationSeed((s) => s + 1)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Emojis
            </button>

            <button
              type="button"
              onClick={() => handleCopyOutput(convertedOutput, 'Emoji-enhanced text')}
              disabled={!convertedOutput}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-40"
            >
              {copiedResult ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedResult ? 'Copied Result!' : 'Copy Result'}
            </button>
          </div>
        </div>
      </div>

      {/* Non-Overlapping Emoji & Message Readability Showcase (Phase 4 Verification) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-[#FF4925]" />
              Expressive Message Readability Showcase (Non-Overlapping Layout)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Consecutive and mixed Unicode emojis render with balanced inline spacing and vertical alignment across all screen sizes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {READABILITY_TEST_EXAMPLES.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {item.label}
                </span>
                <p
                  style={{ fontSize: `${previewFontSize}px` }}
                  className="text-slate-900 dark:text-slate-100 font-medium"
                >
                  <FormattedEmojiText text={item.text} />
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyOutput(item.text, `"${item.label}"`)}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#FF4925] hover:text-[#FF4925] shrink-0 transition-colors cursor-pointer"
                title="Copy message"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
