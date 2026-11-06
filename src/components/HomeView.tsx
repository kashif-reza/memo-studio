import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Smile,
  Film,
  Image as ImageIcon,
  Wand2,
  ArrowRight,
  Copy,
  Heart,
  Flame,
  Clock,
  Check,
} from 'lucide-react';
import { GIVEN_PHOTO_EMOJIS, parseCropUrl } from '../utils/photoEmojiCatalog';
import { GivenPhotoItem } from '../types/emoji';
import { UNICODE_EMOJI_LIBRARY, UnicodeEmojiItem } from '../utils/unicodeEmojiCatalog';
import { PRESET_TRENDING_GIFS } from './GifCreatorStudio';
import { TextToEmojiView } from './TextToEmojiView';
import { FormattedEmojiText } from './FormattedEmojiText';

export type MemoNavView =
  | 'home'
  | 'emoji-studio'
  | 'gif-studio'
  | 'meme-maker'
  | 'text-to-emoji'
  | 'favorites';

interface HomeViewProps {
  onNavigate: (view: MemoNavView) => void;
  onOpenTemplateInMemeMaker: (template: GivenPhotoItem) => void;
  favoriteEmojis: string[];
  favoriteTemplateIds: string[];
  favoriteGifIds: string[];
  recentEmojis: string[];
  onToggleFavoriteEmoji: (char: string) => void;
  onToggleFavoriteTemplate: (id: string) => void;
  onToggleFavoriteGif: (id: string) => void;
  onRecordEmojiUse: (char: string) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenTemplateInMemeMaker,
  favoriteEmojis,
  favoriteTemplateIds,
  favoriteGifIds,
  recentEmojis,
  onToggleFavoriteEmoji,
  onToggleFavoriteTemplate,
  onToggleFavoriteGif,
  onRecordEmojiUse,
  onToast,
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [popularTab, setPopularTab] = useState<
    'trending-memes' | 'trending-emojis' | 'popular-gifs' | 'recent' | 'favorites'
  >('trending-memes');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Instant search across Emojis, Meme Templates, and GIFs from Hero Search input
  const quickSearchResults = useMemo(() => {
    const q = heroSearch.trim().toLowerCase();
    if (!q) return null;
    const emojis = UNICODE_EMOJI_LIBRARY.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.emotion.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q)) ||
        e.char.includes(q)
    ).slice(0, 8);

    const memes = GIVEN_PHOTO_EMOJIS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.defaultCaption.toLowerCase().includes(q) ||
        m.shortcode.toLowerCase().includes(q)
    ).slice(0, 6);

    return { emojis, memes };
  }, [heroSearch]);

  const handleCopyEmoji = async (item: UnicodeEmojiItem | string) => {
    const char = typeof item === 'string' ? item : item.char;
    const name = typeof item === 'string' ? item : item.name;
    try {
      await navigator.clipboard.writeText(char);
      onRecordEmojiUse(char);
      setCopiedId(char);
      setTimeout(() => setCopiedId(null), 1500);
      onToast(`Copied ${char} (${name}) to clipboard!`, 'success');
    } catch {
      onToast('Clipboard access failed.', 'error');
    }
  };

  const featuredTools: Array<{
    id: MemoNavView;
    badge: string;
    title: string;
    description: string;
    bullets: string[];
    ctaLabel: string;
    accentColor: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'emoji-studio',
      badge: 'Tool A',
      title: 'Emoji Studio',
      description: 'Explore categorized Unicode emojis, build combinations, or cook custom animated stickers.',
      bullets: ['9 curated emoji categories', '1-click clipboard copy', 'Emoji combination builder'],
      ctaLabel: 'Open Emoji Studio',
      accentColor: '#FF4925',
      icon: <Smile className="w-5 h-5 text-[#FF4925]" />,
    },
    {
      id: 'gif-studio',
      badge: 'Tool B',
      title: 'GIF Studio',
      description: 'Turn multi-photo sequences, viral memes, or custom headlines into looping animated GIFs.',
      bullets: ['Multi-image sequence to GIF', 'Animated meme effects', 'Kinetic text GIF export'],
      ctaLabel: 'Open GIF Studio',
      accentColor: '#FFBA00',
      icon: <Film className="w-5 h-5 text-[#E97A11]" />,
    },
    {
      id: 'meme-maker',
      badge: 'Tool C',
      title: 'Meme Maker',
      description: 'Upload your own photos or customize 139 viral templates with draggable Impact captions.',
      bullets: ['Drag & drop photo upload', 'Multi-layer outlined text', 'PNG/JPG download & copy'],
      ctaLabel: 'Create a Meme',
      accentColor: '#8EBE2A',
      icon: <ImageIcon className="w-5 h-5 text-[#8EBE2A]" />,
    },
    {
      id: 'text-to-emoji',
      badge: 'Tool D',
      title: 'Text to Emoji',
      description: 'Automatically enrich plain sentences with contextual, non-overlapping emojis.',
      bullets: ['4 emotional intensity modes', 'Preserves original wording', 'Zero emoji/text overlap'],
      ctaLabel: 'Convert Text Now',
      accentColor: '#67AEEE',
      icon: <Wand2 className="w-5 h-5 text-[#67AEEE]" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO SECTION */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Hero Copy + Search + CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FF4925]/10 text-[#FF4925] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              MEMO Creative Expression Suite
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                Express Yourself Beyond Words.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Create hilarious memes, expressive emojis, and animated GIFs. Customize your creativity and share it anywhere.
              </p>
            </div>

            {/* Hero Search Input */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search emojis, viral memes, or reactions (e.g. Hera Pheri, happy, coffee, Doge)..."
                className="w-full pl-12 pr-24 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925] shadow-xs"
              />
              {heroSearch && (
                <button
                  type="button"
                  onClick={() => setHeroSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Clear
                </button>
              )}

              {/* Live Search Results Dropdown */}
              {quickSearchResults && (
                <div className="mt-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xl space-y-4">
                  {quickSearchResults.emojis.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Matching Emojis (Click to Copy)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {quickSearchResults.emojis.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => handleCopyEmoji(e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-[#FF4925]/10 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <span className="text-lg memo-emoji-span">{e.char}</span>
                            <span>{e.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickSearchResults.memes.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Matching Meme Templates (Click to Edit)
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {quickSearchResults.memes.map((m) => {
                          const parsed = parseCropUrl(m.photoUrl);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => onOpenTemplateInMemeMaker(m)}
                              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#FF4925] text-left cursor-pointer"
                            >
                              <img
                                src={parsed.baseUrl}
                                alt={m.name}
                                className="w-10 h-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {m.name}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">{m.defaultCaption}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {quickSearchResults.emojis.length === 0 && quickSearchResults.memes.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No exact match for “{heroSearch}”. Try searching “happy”, “cat”, or “Ruko Zara”.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('meme-maker')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                Create a Meme
              </button>
              <button
                type="button"
                onClick={() => onNavigate('emoji-studio')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-[#FF4925] transition-all cursor-pointer"
              >
                <Smile className="w-4 h-4 text-[#FF4925]" />
                Explore Emojis
              </button>
              <button
                type="button"
                onClick={() => onNavigate('gif-studio')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#FF4925] transition-all cursor-pointer"
              >
                <Film className="w-4 h-4 text-[#E97A11]" />
                Make a GIF
              </button>
            </div>
          </div>

          {/* Right Visual Showcase: Memes, GIFs, and Emojis */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            {/* Showcase Card 1: Featured Viral Meme */}
            <button
              type="button"
              onClick={() => onOpenTemplateInMemeMaker(GIVEN_PHOTO_EMOJIS[0])}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-square text-left shadow-sm cursor-pointer"
            >
              <img
                src={GIVEN_PHOTO_EMOJIS[0].photoUrl}
                alt={GIVEN_PHOTO_EMOJIS[0].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3.5">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FF4925] text-white mb-1">
                  Meme Studio
                </span>
                <p className="text-xs font-extrabold text-white truncate">
                  {GIVEN_PHOTO_EMOJIS[0].name.toUpperCase()}
                </p>
              </div>
            </button>

            {/* Showcase Card 2: Expressive Non-Overlapping Emojis */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  Instant Copy
                </span>
                <Smile className="w-4 h-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-3 gap-2 my-2">
                {['😂', '😍', '🥳', '🔥', '🚀', '💯'].map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleCopyEmoji(char)}
                    className="aspect-square rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-2xl hover:scale-105 hover:border-[#FF4925] transition-all cursor-pointer"
                    title={`Copy ${char}`}
                  >
                    <span className="memo-emoji-span">{char}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                1-click copy with zero text overlap
              </p>
            </div>

            {/* Showcase Card 3: Text-to-Emoji Preview */}
            <button
              type="button"
              onClick={() => onNavigate('text-to-emoji')}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 p-4 flex flex-col justify-between text-left hover:border-[#FF4925] transition-colors cursor-pointer"
            >
              <span className="inline-block w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/15 text-sky-600 dark:text-sky-400">
                Text to Emoji
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white my-2">
                <FormattedEmojiText text="Good morning 🌞☕ Hope you have a wonderful day! ✨" />
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4925]">
                Try Converter <ArrowRight className="w-3 h-3" />
              </span>
            </button>

            {/* Showcase Card 4: Animated Meme GIF */}
            <button
              type="button"
              onClick={() => onNavigate('gif-studio')}
              className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-square text-left shadow-sm cursor-pointer"
            >
              <img
                src={GIVEN_PHOTO_EMOJIS[1].photoUrl}
                alt={GIVEN_PHOTO_EMOJIS[1].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-3.5">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500 text-slate-950 mb-1">
                  Animated .GIF
                </span>
                <p className="text-xs font-extrabold text-white truncate">
                  {GIVEN_PHOTO_EMOJIS[1].name.toUpperCase()}
                </p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATION TOOLS SECTION (4 Cards) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4925]">
              4 Specialized Studios
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Featured Creation Tools
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pick a studio to start designing, converting, or exporting in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredTools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-[#FF4925] transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {tool.icon}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{tool.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-1">
                  {tool.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: tool.accentColor }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(tool.id)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:bg-[#FF4925] dark:hover:bg-[#FF4925] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {tool.ctaLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR EMOJIS, GIFS & MEME TEMPLATES SECTION */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4925]">
              Community Library
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Popular Emojis, GIFs & Viral Meme Templates
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPopularTab('trending-memes')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                popularTab === 'trending-memes'
                  ? 'bg-[#FF4925] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Popular Meme Templates
            </button>
            <button
              type="button"
              onClick={() => setPopularTab('trending-emojis')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                popularTab === 'trending-emojis'
                  ? 'bg-[#FF4925] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              Trending Emojis
            </button>
            <button
              type="button"
              onClick={() => setPopularTab('popular-gifs')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                popularTab === 'popular-gifs'
                  ? 'bg-[#FF4925] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Popular GIFs
            </button>
            <button
              type="button"
              onClick={() => setPopularTab('recent')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                popularTab === 'recent'
                  ? 'bg-[#FF4925] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Recently Used
            </button>
            <button
              type="button"
              onClick={() => setPopularTab('favorites')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                popularTab === 'favorites'
                  ? 'bg-[#FF4925] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              Favorites
            </button>
          </div>
        </div>

        {/* Tab 1: Popular Meme Templates */}
        {popularTab === 'trending-memes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {GIVEN_PHOTO_EMOJIS.slice(0, 18).map((tpl) => {
                const parsed = parseCropUrl(tpl.photoUrl);
                const isFav = favoriteTemplateIds.includes(tpl.id);
                return (
                  <div
                    key={tpl.id}
                    className="group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between hover:border-[#FF4925] transition-all"
                  >
                    <div className="aspect-square bg-slate-900 relative overflow-hidden">
                      <img
                        src={parsed.baseUrl}
                        alt={tpl.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteTemplate(tpl.id)}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-xs transition-colors cursor-pointer ${
                          isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-900/60 text-white/80 hover:text-white'
                        }`}
                        title="Save to Favorites"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <div className="p-2.5 space-y-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tpl.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {tpl.defaultCaption}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenTemplateInMemeMaker(tpl)}
                        className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-[#FF4925] transition-colors cursor-pointer"
                      >
                        Customize Meme
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => onNavigate('meme-maker')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-[#FF4925] hover:text-white transition-colors cursor-pointer"
              >
                Explore All 139 Meme Templates <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Trending Emojis */}
        {popularTab === 'trending-emojis' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {UNICODE_EMOJI_LIBRARY.filter((e) => e.popular)
              .slice(0, 24)
              .map((item) => {
                const isFav = favoriteEmojis.includes(item.char);
                const isCopied = copiedId === item.char;
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 flex flex-col items-center justify-between gap-2 hover:border-[#FF4925] transition-colors"
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400 capitalize">
                        {item.emotion}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteEmoji(item.char)}
                        className={`p-1 rounded cursor-pointer ${
                          isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyEmoji(item)}
                      className="text-4xl my-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <span className="memo-emoji-span">{item.char}</span>
                    </button>
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate w-full text-center">
                      {item.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleCopyEmoji(item)}
                      className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#FF4925] hover:text-white transition-colors inline-flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                );
              })}
          </div>
        )}

        {/* Tab 3: Popular GIFs */}
        {popularTab === 'popular-gifs' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_TRENDING_GIFS.map((gif) => {
              const isFav = favoriteGifIds.includes(gif.id);
              return (
                <div
                  key={gif.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#FF4925]/10 text-[#FF4925]">
                        {gif.animationStyle} GIF
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteGif(gif.id)}
                        className={`p-1 rounded cursor-pointer ${
                          isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{gif.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      “{gif.topText} — {gif.bottomText}”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('gif-studio')}
                    className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-[#FF4925] transition-colors cursor-pointer"
                  >
                    Customize & Export .GIF
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Recently Used */}
        {popularTab === 'recent' && (
          <div className="py-4">
            {recentEmojis.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
                No recently used emojis yet. Copy any emoji above to see it here!
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {recentEmojis.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleCopyEmoji(char)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-2xl hover:border-[#FF4925] cursor-pointer"
                  >
                    <span className="memo-emoji-span">{char}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Favorites Quick View */}
        {popularTab === 'favorites' && (
          <div className="py-4">
            {favoriteEmojis.length === 0 && favoriteTemplateIds.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No favorites yet. Start exploring and save your favorite expressions.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('favorites')}
                  className="text-xs font-bold text-[#FF4925] hover:underline cursor-pointer"
                >
                  Open Favorites Library →
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {favoriteEmojis.map((char) => (
                  <button
                    key={char}
                    type="button"
                    onClick={() => handleCopyEmoji(char)}
                    className="px-3.5 py-2 rounded-xl border border-rose-500/30 bg-rose-500/5 text-2xl cursor-pointer"
                  >
                    <span className="memo-emoji-span">{char}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => onNavigate('favorites')}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white cursor-pointer"
                >
                  View All Saved Favorites →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. EMBEDDED INTELLIGENT TEXT-TO-EMOJI CONVERTER & READABILITY STUDIO */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF4925]">
              Instant Message Enhancer
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Text to Emoji & Readability Studio
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('text-to-emoji')}
            className="text-xs font-bold text-[#FF4925] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            Open Full Converter <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <TextToEmojiView embedded onToast={onToast} />
      </section>
    </div>
  );
};
