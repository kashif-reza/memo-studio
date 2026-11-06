import React, { useState, useMemo } from 'react';
import {
  Smile,
  Search,
  Copy,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Check,
  Sliders,
  Clock,
  Flame,
  Wand2,
} from 'lucide-react';
import {
  UNICODE_EMOJI_CATEGORIES,
  UNICODE_EMOJI_LIBRARY,
  UnicodeEmojiCategory,
  UnicodeEmojiItem,
  POPULAR_EMOJI_COMBINATIONS,
} from '../utils/unicodeEmojiCatalog';
import { FormattedEmojiText } from './FormattedEmojiText';

interface EmojiStudioViewProps {
  favoriteEmojis: string[];
  recentEmojis: string[];
  favoriteCombinations: string[];
  onToggleFavoriteEmoji: (char: string) => void;
  onRecordEmojiUse: (char: string) => void;
  onToggleFavoriteCombination: (combo: string) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  customStickerStudioNode: React.ReactNode;
}

export const EmojiStudioView: React.FC<EmojiStudioViewProps> = ({
  favoriteEmojis,
  recentEmojis,
  favoriteCombinations,
  onToggleFavoriteEmoji,
  onRecordEmojiUse,
  onToggleFavoriteCombination,
  onToast,
  customStickerStudioNode,
}) => {
  const [studioTab, setStudioTab] = useState<'explorer' | 'custom-cooker'>('explorer');
  const [selectedCategory, setSelectedCategory] = useState<
    UnicodeEmojiCategory | 'All' | 'Popular' | 'Favorites' | 'Recent'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [emojiPreviewSize, setEmojiPreviewSize] = useState(38);
  const [combinationBuffer, setCombinationBuffer] = useState('🔥🚀💯✨');
  const [copiedChar, setCopiedChar] = useState<string | null>(null);

  const filteredEmojis = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return UNICODE_EMOJI_LIBRARY.filter((item) => {
      if (selectedCategory === 'Popular' && !item.popular) return false;
      if (selectedCategory === 'Favorites' && !favoriteEmojis.includes(item.char)) return false;
      if (selectedCategory === 'Recent' && !recentEmojis.includes(item.char)) return false;
      if (
        selectedCategory !== 'All' &&
        selectedCategory !== 'Popular' &&
        selectedCategory !== 'Favorites' &&
        selectedCategory !== 'Recent' &&
        item.category !== selectedCategory
      ) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.emotion.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q)) ||
        item.char.includes(q)
      );
    });
  }, [selectedCategory, searchQuery, favoriteEmojis, recentEmojis]);

  const handleCopyEmoji = async (item: UnicodeEmojiItem | string, label?: string) => {
    const char = typeof item === 'string' ? item : item.char;
    const name = typeof item === 'string' ? label || char : item.name;
    try {
      await navigator.clipboard.writeText(char);
      onRecordEmojiUse(char);
      setCopiedChar(char);
      setTimeout(() => setCopiedChar(null), 1500);
      onToast(`Copied ${char} (${name}) to clipboard!`, 'success');
    } catch {
      onToast('Could not copy to clipboard.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Mode Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4925] mb-1">
            <Smile className="w-3.5 h-3.5" />
            MEMO Emoji Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Explore, Combine & Cook Expressive Emojis
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Copy categorized Unicode emojis in 1 click, craft multi-emoji combos, or animate custom sticker emojis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStudioTab('explorer')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              studioTab === 'explorer'
                ? 'bg-[#FF4925] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Smile className="w-4 h-4" />
            Emoji Explorer & Combiner
          </button>
          <button
            type="button"
            onClick={() => setStudioTab('custom-cooker')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              studioTab === 'custom-cooker'
                ? 'bg-[#FF4925] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Animated Sticker Cooker
          </button>
        </div>
      </div>

      {studioTab === 'custom-cooker' ? (
        <div>{customStickerStudioNode}</div>
      ) : (
        <div className="space-y-6">
          {/* Emoji Combiner Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF4925]" />
                  Emoji Combination Builder
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any "+ Combo" button on an emoji card below or type directly to build expressive sequences.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {POPULAR_EMOJI_COMBINATIONS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setCombinationBuffer(preset.combo)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#FF4925] border border-transparent transition-colors cursor-pointer"
                    title={preset.meaning}
                  >
                    {preset.combo} {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-4 py-3">
                <div className="text-2xl">
                  <FormattedEmojiText text={combinationBuffer || '✨'} />
                </div>
                <input
                  type="text"
                  value={combinationBuffer}
                  onChange={(e) => setCombinationBuffer(e.target.value)}
                  placeholder="Add emojis to combine..."
                  className="bg-transparent text-right text-sm font-mono text-slate-600 dark:text-slate-300 focus:outline-none w-40"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCombinationBuffer('')}
                  className="px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                  title="Clear Combination"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!combinationBuffer.trim()) return;
                    onToggleFavoriteCombination(combinationBuffer);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    favoriteCombinations.includes(combinationBuffer)
                      ? 'border-rose-500 bg-rose-500/10 text-rose-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      favoriteCombinations.includes(combinationBuffer) ? 'fill-current' : ''
                    }`}
                  />
                  Save Combo
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyEmoji(combinationBuffer, 'Emoji Combination')}
                  disabled={!combinationBuffer.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Copy className="w-4 h-4" />
                  Copy Combo
                </button>
              </div>
            </div>
          </div>

          {/* Search, Size Slider & Category Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search emojis by name, keyword, or emotion (e.g. happy, love, fire, coffee)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Sliders className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Preview Size: {emojiPreviewSize}px
                </span>
                <input
                  type="range"
                  min={28}
                  max={64}
                  value={emojiPreviewSize}
                  onChange={(e) => setEmojiPreviewSize(Number(e.target.value))}
                  className="w-28 accent-[#FF4925]"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {(['All', 'Popular', 'Recent', 'Favorites'] as const).map((specialTab) => (
                <button
                  key={specialTab}
                  type="button"
                  onClick={() => setSelectedCategory(specialTab)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === specialTab
                      ? 'bg-[#FF4925] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {specialTab === 'Popular' && <Flame className="w-3.5 h-3.5" />}
                  {specialTab === 'Recent' && <Clock className="w-3.5 h-3.5" />}
                  {specialTab === 'Favorites' && <Heart className="w-3.5 h-3.5" />}
                  {specialTab}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

              {UNICODE_EMOJI_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            {filteredEmojis.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                No emojis match this filter yet. Try clearing your search or exploring another category.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {filteredEmojis.map((item) => {
                  const isFav = favoriteEmojis.includes(item.char);
                  const isCopied = copiedChar === item.char;
                  return (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-[#FF4925] p-3 flex flex-col items-center justify-between gap-2 transition-all"
                    >
                      <div className="w-full flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 capitalize truncate">
                          {item.emotion}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToggleFavoriteEmoji(item.char)}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                          }`}
                          title={isFav ? 'Remove from Favorites' : 'Save to Favorites'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyEmoji(item)}
                        style={{ fontSize: `${emojiPreviewSize}px` }}
                        className="my-1 leading-none select-none transform group-hover:scale-110 transition-transform cursor-pointer"
                        title={`Click to copy ${item.name}`}
                      >
                        <span className="memo-emoji-span">{item.char}</span>
                      </button>

                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 text-center line-clamp-1 w-full">
                        {item.name}
                      </p>

                      <div className="w-full flex items-center gap-1 pt-1">
                        <button
                          type="button"
                          onClick={() => handleCopyEmoji(item)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#FF4925] hover:text-white hover:border-[#FF4925] transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCombinationBuffer((prev) => `${prev}${item.char}`);
                            onToast(`Added ${item.char} to combination builder`, 'info');
                          }}
                          className="p-1.5 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                          title="Add to Combination"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
