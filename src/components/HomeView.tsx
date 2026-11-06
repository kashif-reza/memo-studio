import React, { useState, useMemo, useRef } from 'react';
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
  Upload,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { GIVEN_PHOTO_EMOJIS, parseCropUrl } from '../utils/photoEmojiCatalog';
import { GivenPhotoItem } from '../types/emoji';
import { UNICODE_EMOJI_LIBRARY, UnicodeEmojiItem } from '../utils/unicodeEmojiCatalog';
import { PRESET_TRENDING_GIFS } from './GifCreatorStudio';
import { TextToEmojiView } from './TextToEmojiView';
import {
  AURA_EMOTIONS,
  AuraEmotionOrbSvg,
  AuraEmotionSpec,
  Emojisan3DCharacterSvg,
  EmojisanCharacterId,
  renderAuraEmotionToDataUrl,
} from './AuraEmotionAvatars';

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
  customCollectionItems: GivenPhotoItem[];
  onAddCollectionFiles: (files: FileList | File[], customTitle?: string) => void;
  onAddCollectionUrl: (url: string, title: string) => void;
  onDeleteCollectionItem: (id: string) => void;
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
  customCollectionItems,
  onAddCollectionFiles,
  onAddCollectionUrl,
  onDeleteCollectionItem,
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

  // State for Picture 1: Inside-Out Style Blurred Aura Emotion Avatars
  const [selectedAura, setSelectedAura] = useState<AuraEmotionSpec>(AURA_EMOTIONS[4]); // Default 'Joy'
  const [customAuraLabel, setCustomAuraLabel] = useState<string>('');

  // State for Section 4: Drop New GIF & Picture Collection Hub
  const [isDraggingCollection, setIsDraggingCollection] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState<'all' | 'gif' | 'photo'>('all');
  const [customTitleInput, setCustomTitleInput] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showTextConverterModal, setShowTextConverterModal] = useState(false);
  const collectionFileInputRef = useRef<HTMLInputElement | null>(null);

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

    const allTemplates = [...customCollectionItems, ...GIVEN_PHOTO_EMOJIS];
    const memes = allTemplates
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.defaultCaption.toLowerCase().includes(q) ||
          m.shortcode.toLowerCase().includes(q)
      )
      .slice(0, 6);

    return { emojis, memes };
  }, [heroSearch, customCollectionItems]);

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

  // Actions for Aura Emotion Avatars (First Picture)
  const handleUseAuraInMemeMaker = (emotion: AuraEmotionSpec) => {
    const label = customAuraLabel.trim() || emotion.label;
    const dataUrl = renderAuraEmotionToDataUrl(emotion, label);
    if (!dataUrl) return;
    const item: GivenPhotoItem = {
      id: `aura-avatar-${emotion.id}-${Date.now()}`,
      name: `${label} Aura Avatar`,
      shortcode: `:aura_${emotion.id}:`,
      category: 'user-drop',
      vibeTag: `${label} Aura`,
      defaultCaption: label.toUpperCase(),
      photoUrl: dataUrl,
      matchingConfig: {
        ...GIVEN_PHOTO_EMOJIS[0].matchingConfig,
        id: `aura-cfg-${emotion.id}`,
        name: `${label} Aura Avatar`,
        shortcode: `:aura_${emotion.id}:`,
        photoUrl: dataUrl,
        captionText: label.toUpperCase(),
      },
    };
    onOpenTemplateInMemeMaker(item);
    onToast(`Loaded ${label} Aura Avatar into Meme Maker!`, 'success');
  };

  const handleDownloadAuraAvatar = (emotion: AuraEmotionSpec) => {
    const label = customAuraLabel.trim() || emotion.label;
    const dataUrl = renderAuraEmotionToDataUrl(emotion, label);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `memo-aura-${emotion.id}.png`;
    a.click();
    onToast(`Downloaded ${label} Aura Avatar PNG!`, 'success');
  };

  const featuredTools: Array<{
    id: MemoNavView;
    step: string;
    characterId: EmojisanCharacterId;
    characterName: string;
    title: string;
    workSummary: string;
    description: string;
    bullets: string[];
    ctaLabel: string;
    borderColor: string;
    cornerBg: string;
  }> = [
    {
      id: 'emoji-studio',
      step: '01 · Starsan',
      characterId: 'starsan',
      characterName: 'Starsan',
      title: 'Emoji Studio',
      workSummary: 'Emoji Explorer & Sticker Cooker',
      description:
        'Explore categorized Unicode emojis, build multi-emoji combinations, or cook custom animated stickers.',
      bullets: [
        '9 curated emoji categories',
        '1-click clipboard copy',
        'Emoji combination builder',
      ],
      ctaLabel: 'Open Emoji Studio',
      borderColor: '#B85CFF',
      cornerBg: 'rgba(184, 92, 255, 0.12)',
    },
    {
      id: 'gif-studio',
      step: '02 · Ellipsan',
      characterId: 'ellipsan',
      characterName: 'Ellipsan',
      title: 'GIF Studio',
      workSummary: 'Animated Meme & Sequence GIF Maker',
      description:
        'Turn multi-photo sequences, viral memes, or custom headlines into looping animated GIF files.',
      bullets: [
        'Multi-image sequence to GIF',
        'Animated meme motion effects',
        'Kinetic text .GIF export',
      ],
      ctaLabel: 'Open GIF Studio',
      borderColor: '#FF2A7A',
      cornerBg: 'rgba(255, 42, 122, 0.12)',
    },
    {
      id: 'meme-maker',
      step: '03 · Cloudsan',
      characterId: 'cloudsan',
      characterName: 'Cloudsan',
      title: 'Meme Maker',
      workSummary: 'Custom Photo & Template Meme Editor',
      description:
        'Upload your own photos or customize 139+ viral templates with draggable Impact captions.',
      bullets: [
        'Drag & drop photo upload',
        'Multi-layer outlined text',
        'PNG/JPG download & copy',
      ],
      ctaLabel: 'Create a Meme',
      borderColor: '#2BC4F3',
      cornerBg: 'rgba(43, 196, 243, 0.12)',
    },
    {
      id: 'text-to-emoji',
      step: '04 · Conesan',
      characterId: 'conesan',
      characterName: 'Conesan',
      title: 'Text to Emoji',
      workSummary: 'Smart Sentence-to-Emoji Converter',
      description:
        'Automatically enrich plain sentences with contextual, non-overlapping emojis for any mood.',
      bullets: [
        '4 emotional intensity modes',
        'Preserves original wording',
        'Zero emoji/text overlap',
      ],
      ctaLabel: 'Convert Text Now',
      borderColor: '#8EBE2A',
      cornerBg: 'rgba(142, 190, 42, 0.14)',
    },
  ];

  // Combine user-dropped GIF/Photo collection items with curated starter GIF/Photo items
  const displayedCollectionItems = useMemo(() => {
    const combined = [
      ...customCollectionItems,
      ...GIVEN_PHOTO_EMOJIS.slice(0, 8),
    ];
    if (collectionFilter === 'all') return combined;
    return combined.filter((item) => {
      const isGif =
        item.photoUrl.toLowerCase().includes('.gif') ||
        item.photoUrl.startsWith('data:image/gif') ||
        item.vibeTag.toLowerCase().includes('gif');
      return collectionFilter === 'gif' ? isGif : !isGif;
    });
  }, [customCollectionItems, collectionFilter]);

  const handleCollectionDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingCollection(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onAddCollectionFiles(e.dataTransfer.files, customTitleInput.trim() || undefined);
      setCustomTitleInput('');
    }
  };

  const handleAddByUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = customUrlInput.trim();
    if (!trimmedUrl) {
      onToast('Please enter a valid GIF or image URL first.', 'error');
      return;
    }
    const title = customTitleInput.trim() || 'Dropped Community Media';
    onAddCollectionUrl(trimmedUrl, title);
    setCustomUrlInput('');
    setCustomTitleInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO SECTION WITH INSIDE-OUT STYLE ANIMATED AURA EMOTION AVATARS (First Picture) */}
      <section className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 lg:p-12 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Hero Copy + Search + CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF4925]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MEMO Creative Expression Suite · Aura Avatars, Memes & GIFs</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Express Yourself Beyond Words.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Create hilarious memes, animated aura emotion avatars, and looping GIFs. Drop your own collection and share it anywhere.
              </p>
            </div>

            {/* Hero Search Input */}
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search emojis, aura moods, or viral memes (e.g. Joy, Envy, Hera Pheri)..."
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <ImageIcon className="w-4 h-4" />
                Create a Meme
              </button>
              <button
                type="button"
                onClick={() => onNavigate('emoji-studio')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-[#FF4925] transition-all cursor-pointer whitespace-nowrap"
              >
                <Smile className="w-4 h-4 text-[#FF4925]" />
                Explore Emojis
              </button>
              <button
                type="button"
                onClick={() => onNavigate('gif-studio')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-[#FF4925] transition-all cursor-pointer whitespace-nowrap"
              >
                <Film className="w-4 h-4 text-[#E97A11]" />
                Make a GIF
              </button>
            </div>
          </div>

          {/* Right Visual Showcase: 3x3 Inside-Out Animated Blurred Aura Emotion Avatars (First Picture) */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Animated Aura Emotion Avatars
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any soft glowing emotion orb to animate, customize, download, or turn into a meme.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Active: <strong className="text-slate-900 dark:text-white">{selectedAura.label}</strong>
              </span>
            </div>

            {/* 3x3 Grid Matching Reference Picture 1 (Disgust, Ennui, Anger / Anxiety, Joy, Sadness / Fear, Envy, Embarrassing) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 place-items-center bg-white dark:bg-slate-950/60 rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-800/80">
              {AURA_EMOTIONS.map((emotion) => {
                const isSelected = selectedAura.id === emotion.id;
                return (
                  <button
                    key={emotion.id}
                    type="button"
                    onClick={() => setSelectedAura(emotion)}
                    className={`group relative rounded-2xl p-1 sm:p-1.5 transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? 'ring-2 ring-slate-900 dark:ring-white bg-slate-50/80 dark:bg-slate-900 scale-105'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-900/40'
                    }`}
                    title={`${emotion.label} — ${emotion.tagline}`}
                  >
                    <div className={emotion.motionClass}>
                      <AuraEmotionOrbSvg
                        emotion={emotion}
                        size={108}
                        animated
                        customLabel={
                          isSelected && customAuraLabel.trim()
                            ? customAuraLabel.trim()
                            : emotion.label
                        }
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Controls Bar for Selected Aura Emotion Avatar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <input
                type="text"
                value={customAuraLabel}
                onChange={(e) => setCustomAuraLabel(e.target.value)}
                placeholder={`Custom label for ${selectedAura.label} (optional)...`}
                aria-label="Custom Aura Avatar Label"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
              />
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUseAuraInMemeMaker(selectedAura)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#FF4925] dark:hover:bg-[#FF4925] dark:hover:text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  Use as Meme Avatar
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAuraAvatar(selectedAura)}
                  className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#FF4925] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED CREATION TOOLS SECTION (Previous 4-Card Setup with Themed Border Lines & Corner Little Avatars) */}
      <section className="rounded-3xl border-2 border-[#E8B1C4] dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-[#FF004C]">
              4 Specialized Studios · What Each Section Does
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
              style={{ borderColor: tool.borderColor }}
              className="group relative rounded-2xl border-2 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Top Header Row: Clear Work Step Label + Little Avatar in the Corner */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 pt-0.5">
                    <span
                      style={{ color: tool.borderColor }}
                      className="text-xs font-extrabold tracking-tight block"
                    >
                      {tool.step}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {tool.workSummary}
                    </p>
                  </div>

                  {/* Corner Little Avatar Badge */}
                  <div
                    style={{
                      backgroundColor: tool.cornerBg,
                      borderColor: tool.borderColor,
                    }}
                    className="w-13 h-13 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    title={`${tool.characterName} — ${tool.title}`}
                  >
                    <Emojisan3DCharacterSvg characterId={tool.characterId} size={42} />
                  </div>
                </div>

                {/* Clear Description of What Work Is Done Here */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tool.description}
                </p>

                {/* Structured Work Capabilities List */}
                <ul className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {tool.bullets.map((b) => (
                    <li
                      key={b}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: tool.borderColor }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onNavigate(tool.id)}
                style={{ borderColor: tool.borderColor }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold border-2 bg-slate-900 dark:bg-slate-800 text-white hover:bg-[#FF004C] dark:hover:bg-[#FF004C] transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{tool.ctaLabel}</span>
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
            <span className="text-xs font-bold text-[#FF4925]">Community Library</span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Popular Emojis, GIFs & Viral Meme Templates
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPopularTab('trending-memes')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
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
              {[...customCollectionItems, ...GIVEN_PHOTO_EMOJIS].slice(0, 18).map((tpl) => {
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
                Explore All {139 + customCollectionItems.length} Meme Templates{' '}
                <ArrowRight className="w-4 h-4" />
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
                      <span className="text-[11px] font-bold text-[#FF4925]">
                        {gif.animationStyle.toUpperCase()} GIF
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

      {/* 4. DROP NEW COLLECTION OF GIF IMAGES & PICTURES FOR ALL USERS (Section 4) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-[#FF4925]">
              Community Drop Box · GIFs & Pictures
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Drop Your New Collection of GIFs & Pictures
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Upload or drop GIF animations and pictures here so everyone can use them across Meme Maker, GIF Studio, and Emoji Studio.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTextConverterModal((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#FF4925] cursor-pointer self-start sm:self-auto whitespace-nowrap"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#FF4925]" />
            {showTextConverterModal ? 'Hide Text-to-Emoji Tool' : 'Quick Text-to-Emoji Tool'}
          </button>
        </div>

        {/* Two-Column Split: Left Drop Zone & Uploader + Right Shared Collection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sub-Card 1: Interactive Drag-and-Drop GIF & Picture Uploader */}
          <div className="lg:col-span-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Add to Public Collection
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports animated <code className="font-mono">.GIF</code>, <code className="font-mono">.PNG</code>, <code className="font-mono">.JPG</code>, and <code className="font-mono">.WEBP</code> files.
              </p>
            </div>

            {/* Optional Custom Title Before Dropping */}
            <div>
              <label
                htmlFor="collection-item-title"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Collection Title / Caption (Optional)
              </label>
              <input
                id="collection-item-title"
                type="text"
                value={customTitleInput}
                onChange={(e) => setCustomTitleInput(e.target.value)}
                placeholder="e.g. Dancing Cat GIF, Vibe Check Reaction..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
              />
            </div>

            {/* Drag and Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingCollection(true);
              }}
              onDragLeave={() => setIsDraggingCollection(false)}
              onDrop={handleCollectionDrop}
              onClick={() => collectionFileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-7 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                isDraggingCollection
                  ? 'border-[#FF4925] bg-[#FF4925]/10'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:border-[#FF4925]'
              }`}
            >
              <input
                ref={collectionFileInputRef}
                type="file"
                accept="image/gif,image/png,image/jpeg,image/webp"
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddCollectionFiles(e.target.files, customTitleInput.trim() || undefined);
                    setCustomTitleInput('');
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-[#FF4925]/15 text-[#FF4925] flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drop GIF images & pictures here
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  or click to browse multiple files from your device
                </p>
              </div>
              <span className="mt-1 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold">
                Select GIFs / Pictures
              </span>
            </div>

            {/* Or Paste Direct GIF / Image URL */}
            <form onSubmit={handleAddByUrlSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label
                htmlFor="collection-url-input"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Or Add by Direct GIF / Image Link
              </label>
              <div className="flex gap-2">
                <input
                  id="collection-url-input"
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/funny-reaction.gif"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF4925] hover:bg-[#e03d1d] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Sub-Card 2: Live User-Usable GIF & Picture Collection Gallery */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ready-to-Use GIF & Picture Collection ({displayedCollectionItems.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any dropped GIF or picture to customize in Meme Maker or animate in GIF Studio.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {(['all', 'gif', 'photo'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCollectionFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      collectionFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab === 'all' ? 'All Media' : tab === 'gif' ? 'GIFs' : 'Pictures'}
                  </button>
                ))}
              </div>
            </div>

            {displayedCollectionItems.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No items in this filter yet.
                </p>
                <p className="text-xs text-slate-500">
                  Drop a GIF or picture on the left panel to add it immediately!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {displayedCollectionItems.slice(0, 12).map((item) => {
                  const parsed = parseCropUrl(item.photoUrl);
                  const isCustom = item.id.startsWith('dropped-');
                  const isGif =
                    item.photoUrl.toLowerCase().includes('.gif') ||
                    item.photoUrl.startsWith('data:image/gif');

                  return (
                    <div
                      key={item.id}
                      className="group rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between hover:border-[#FF4925] transition-all"
                    >
                      <div className="aspect-square bg-slate-900 relative overflow-hidden">
                        <img
                          src={parsed.baseUrl}
                          alt={item.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/75 text-white">
                          {isGif ? 'GIF' : isCustom ? 'NEW DROP' : 'PHOTO'}
                        </span>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => onDeleteCollectionItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600/90 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Remove from Collection"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="p-2.5 space-y-2">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {item.defaultCaption}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenTemplateInMemeMaker(item)}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-[#FF4925] transition-colors cursor-pointer truncate"
                          >
                            Use Meme
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate('gif-studio')}
                            className="py-1.5 px-2 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer truncate"
                          >
                            Make GIF
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Optional Expandable Text-to-Emoji Drawer */}
        {showTextConverterModal && (
          <div className="pt-4">
            <TextToEmojiView embedded onToast={onToast} />
          </div>
        )}
      </section>
    </div>
  );
};
