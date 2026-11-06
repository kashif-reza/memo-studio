import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Home,
  Smile,
  Film,
  Image as ImageIcon,
  Wand2,
  Heart,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  MessageSquare,
} from 'lucide-react';
import { EmojiConfig, GivenPhotoItem, MoodVibeId, SavedEmoji } from './types/emoji';
import {
  STARTER_PRESETS,
  createHistoryStack,
  formatShortcode,
  pushHistoryState,
  randomizeEmojiConfig,
  validateShortcode,
} from './utils/emojiEngine';
import {
  GIVEN_PHOTO_EMOJIS,
  createDroppedPhotoEmoji,
  mixEmojiConfigs,
  parseCropUrl,
  randomizePhotoCombo,
} from './utils/photoEmojiCatalog';
import { UNICODE_EMOJI_LIBRARY } from './utils/unicodeEmojiCatalog';
import { ExportModal } from './components/ExportModal';
import { ChatSimulatorModal } from './components/ChatSimulatorModal';
import { MinimalistCreatorStudio } from './components/MinimalistCreatorStudio';
import { HomeView, MemoNavView } from './components/HomeView';
import { EmojiStudioView } from './components/EmojiStudioView';
import { GifCreatorStudio } from './components/GifCreatorStudio';
import { MemeMakerStudio } from './components/MemeMakerStudio';
import { TextToEmojiView } from './components/TextToEmojiView';
import { FavoritesView } from './components/FavoritesView';

const STORAGE_KEY = 'mojimotion_saved_pack_v4';
const CUSTOM_PHOTOS_STORAGE_KEY = 'mojimotion_custom_photos_v1';
const THEME_STORAGE_KEY = 'memo_theme_mode_v1';
const FAV_EMOJIS_KEY = 'memo_fav_emojis_v1';
const FAV_COMBOS_KEY = 'memo_fav_combos_v1';
const FAV_GIFS_KEY = 'memo_fav_gifs_v1';
const FAV_TEMPLATES_KEY = 'memo_fav_templates_v1';
const RECENT_EMOJIS_KEY = 'memo_recent_emojis_v1';
const RECENT_TEMPLATES_KEY = 'memo_recent_templates_v1';

interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

function readLocalStringArray(key: string, fallback: string[] = []): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return fallback;
}

export default function App() {
  const [activeView, setActiveView] = useState<MemoNavView>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedMemeTemplate, setSelectedMemeTemplate] = useState<GivenPhotoItem | null>(null);

  // Theme state (Light / Dark)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore storage errors
    }
  }, [isDark]);

  // Toast Notification System
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      setToast({ id: Date.now(), message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Persistent Favorites & Recently Used State
  const [favoriteEmojis, setFavoriteEmojis] = useState<string[]>(() =>
    readLocalStringArray(FAV_EMOJIS_KEY, ['😂', '❤️', '🔥', '🚀'])
  );
  const [favoriteCombinations, setFavoriteCombinations] = useState<string[]>(() =>
    readLocalStringArray(FAV_COMBOS_KEY, ['🔥🚀💯✨', '❤️🥰😘💖'])
  );
  const [favoriteGifIds, setFavoriteGifIds] = useState<string[]>(() =>
    readLocalStringArray(FAV_GIFS_KEY, ['gif-ruko-zara'])
  );
  const [favoriteTemplateIds, setFavoriteTemplateIds] = useState<string[]>(() =>
    readLocalStringArray(FAV_TEMPLATES_KEY, [
      GIVEN_PHOTO_EMOJIS[0].id,
      GIVEN_PHOTO_EMOJIS[1].id,
      GIVEN_PHOTO_EMOJIS[2].id,
    ])
  );
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() =>
    readLocalStringArray(RECENT_EMOJIS_KEY, ['😊', '😂', '🌞', '☕', '🎉'])
  );
  const [recentTemplateIds, setRecentTemplateIds] = useState<string[]>(() =>
    readLocalStringArray(RECENT_TEMPLATES_KEY, [
      GIVEN_PHOTO_EMOJIS[0].id,
      GIVEN_PHOTO_EMOJIS[1].id,
    ])
  );

  useEffect(() => {
    try {
      localStorage.setItem(FAV_EMOJIS_KEY, JSON.stringify(favoriteEmojis));
    } catch {
      // ignore
    }
  }, [favoriteEmojis]);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_COMBOS_KEY, JSON.stringify(favoriteCombinations));
    } catch {
      // ignore
    }
  }, [favoriteCombinations]);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_GIFS_KEY, JSON.stringify(favoriteGifIds));
    } catch {
      // ignore
    }
  }, [favoriteGifIds]);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_TEMPLATES_KEY, JSON.stringify(favoriteTemplateIds));
    } catch {
      // ignore
    }
  }, [favoriteTemplateIds]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_EMOJIS_KEY, JSON.stringify(recentEmojis));
    } catch {
      // ignore
    }
  }, [recentEmojis]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_TEMPLATES_KEY, JSON.stringify(recentTemplateIds));
    } catch {
      // ignore
    }
  }, [recentTemplateIds]);

  const handleToggleFavoriteEmoji = useCallback(
    (char: string) => {
      setFavoriteEmojis((prev) => {
        const exists = prev.includes(char);
        showToast(
          exists ? `Removed ${char} from Favorites` : `Saved ${char} to Favorites!`,
          exists ? 'info' : 'success'
        );
        return exists ? prev.filter((c) => c !== char) : [char, ...prev];
      });
    },
    [showToast]
  );

  const handleToggleFavoriteCombination = useCallback(
    (combo: string) => {
      setFavoriteCombinations((prev) => {
        const exists = prev.includes(combo);
        showToast(
          exists ? 'Removed combination from Favorites' : `Saved ${combo} to Favorites!`,
          exists ? 'info' : 'success'
        );
        return exists ? prev.filter((c) => c !== combo) : [combo, ...prev];
      });
    },
    [showToast]
  );

  const handleToggleFavoriteGif = useCallback(
    (id: string) => {
      setFavoriteGifIds((prev) => {
        const exists = prev.includes(id);
        showToast(
          exists ? 'Removed GIF from Favorites' : 'Saved GIF to Favorites!',
          exists ? 'info' : 'success'
        );
        return exists ? prev.filter((g) => g !== id) : [id, ...prev];
      });
    },
    [showToast]
  );

  const handleToggleFavoriteTemplate = useCallback(
    (id: string) => {
      setFavoriteTemplateIds((prev) => {
        const exists = prev.includes(id);
        showToast(
          exists ? 'Removed template from Favorites' : 'Saved meme template to Favorites!',
          exists ? 'info' : 'success'
        );
        return exists ? prev.filter((t) => t !== id) : [id, ...prev];
      });
    },
    [showToast]
  );

  const handleRecordEmojiUse = useCallback((char: string) => {
    setRecentEmojis((prev) => [char, ...prev.filter((c) => c !== char)].slice(0, 18));
  }, []);

  const handleRecordRecentTemplate = useCallback((id: string) => {
    setRecentTemplateIds((prev) => [id, ...prev.filter((t) => t !== id)].slice(0, 12));
  }, []);

  const handleOpenTemplateInMemeMaker = useCallback(
    (template: GivenPhotoItem) => {
      setSelectedMemeTemplate(template);
      handleRecordRecentTemplate(template.id);
      setActiveView('meme-maker');
      setGlobalSearchOpen(false);
    },
    [handleRecordRecentTemplate]
  );

  // Custom Animated Sticker Cooker State (for Emoji Studio Tab 2 + Chat Sandbox + Export Modal)
  const [selectedMood] = useState<MoodVibeId>('all');
  const [customPhotos, setCustomPhotos] = useState<GivenPhotoItem[]>(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_PHOTOS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_PHOTOS_STORAGE_KEY, JSON.stringify(customPhotos));
    } catch {
      // ignore
    }
  }, [customPhotos]);

  const allPhotoEmojis = useMemo(
    () => [...customPhotos, ...GIVEN_PHOTO_EMOJIS],
    [customPhotos]
  );

  const [history, setHistory] = useState(() =>
    createHistoryStack<EmojiConfig>(GIVEN_PHOTO_EMOJIS[0].matchingConfig)
  );
  const config = history.present;
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [shortcodeDraft, setShortcodeDraft] = useState<string>(config.shortcode);
  const [shortcodeError, setShortcodeError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isChatSimOpen, setIsChatSimOpen] = useState<boolean>(false);

  const [savedPack, setSavedPack] = useState<SavedEmoji[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { config: GIVEN_PHOTO_EMOJIS[0].matchingConfig, createdAt: '2026-11-04', usageCount: 32 },
      { config: GIVEN_PHOTO_EMOJIS[1].matchingConfig, createdAt: '2026-11-04', usageCount: 28 },
      { config: GIVEN_PHOTO_EMOJIS[2].matchingConfig, createdAt: '2026-11-04', usageCount: 21 },
      { config: STARTER_PRESETS[0], createdAt: '2026-11-04', usageCount: 11 },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPack));
    } catch {
      // ignore
    }
  }, [savedPack]);

  useEffect(() => {
    setShortcodeDraft(config.shortcode);
    setShortcodeError(null);
  }, [config.shortcode]);

  const handleUpdateConfig = useCallback((updater: (prev: EmojiConfig) => EmojiConfig) => {
    setHistory((prevStack) => {
      const nextConfig = updater(prevStack.present);
      return pushHistoryState(prevStack, nextConfig);
    });
  }, []);

  const handleRandomPhotoCombo = (moodOverride?: MoodVibeId) => {
    const activeMood = moodOverride ?? selectedMood;
    const { config: comboCfg } = randomizePhotoCombo(undefined, allPhotoEmojis, activeMood);
    setHistory((prev) => pushHistoryState(prev, comboCfg));
    showToast('Generated random 2-photo emoji mashup!', 'info');
  };

  const handleRandomVectorRig = () => {
    const randomCfg = randomizeEmojiConfig();
    setHistory((prev) => pushHistoryState(prev, randomCfg));
    showToast('Randomized animated vector emoji!', 'info');
  };

  const handleSelectPreset = (preset: EmojiConfig) => {
    const cloned: EmojiConfig = {
      ...preset,
      fineTune: { ...preset.fineTune },
      layerMotion: { ...preset.layerMotion },
    };
    setHistory((prev) => pushHistoryState(prev, cloned));
  };

  const handleMixWithStage = (item: GivenPhotoItem) => {
    const mixed = mixEmojiConfigs(config, item.matchingConfig, 'duo-collab');
    setHistory((prev) => pushHistoryState(prev, mixed));
    showToast(`Mixed stage with ${item.name}!`, 'success');
  };

  const handleAddUserPhotos = (files: FileList | File[], customTitle?: string) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (list.length === 0) return;

    list.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
          const baseItem = createDroppedPhotoEmoji(
            reader.result,
            customTitle ? `${customTitle}${list.length > 1 ? ` #${idx + 1}` : ''}` : file.name,
            selectedMood === 'all' ? 'rizz' : selectedMood,
            idx + 1
          );
          const item: GivenPhotoItem = {
            ...baseItem,
            vibeTag: isGif ? 'GIF Drop' : baseItem.vibeTag,
            defaultCaption: customTitle
              ? customTitle.toUpperCase().slice(0, 18)
              : baseItem.defaultCaption,
          };
          setCustomPhotos((prev) => [item, ...prev]);
          if (idx === 0) {
            setHistory((prev) => pushHistoryState(prev, item.matchingConfig));
          }
        }
      };
      reader.readAsDataURL(file);
    });
    showToast(`Added ${list.length} item(s) to the shared GIF & Picture collection!`, 'success');
  };

  const handleAddCollectionUrl = (url: string, title: string) => {
    const isGif = url.toLowerCase().includes('.gif') || url.startsWith('data:image/gif');
    const baseItem = createDroppedPhotoEmoji(url, title, 'rizz', 1);
    const item: GivenPhotoItem = {
      ...baseItem,
      name: title,
      vibeTag: isGif ? 'GIF Drop' : 'Photo Drop',
      defaultCaption: title.toUpperCase().slice(0, 18),
    };
    setCustomPhotos((prev) => [item, ...prev]);
    showToast(`Added "${title}" to the shared GIF & Picture collection!`, 'success');
  };

  const handleDeleteCollectionItem = (id: string) => {
    setCustomPhotos((prev) => prev.filter((item) => item.id !== id));
    showToast('Removed item from collection.', 'info');
  };

  const handleShortcodeInput = (val: string) => {
    setShortcodeDraft(val);
    const check = validateShortcode(val);
    if (!check.valid) {
      setShortcodeError(check.error || 'Invalid shortcode');
    } else {
      setShortcodeError(null);
      const formatted = formatShortcode(val);
      setHistory((prev) => ({
        ...prev,
        present: {
          ...prev.present,
          shortcode: formatted,
        },
      }));
    }
  };

  const handleSaveToPack = () => {
    const check = validateShortcode(shortcodeDraft);
    if (!check.valid) {
      setShortcodeError(check.error || 'Enter a valid shortcode before saving.');
      return;
    }
    const formattedCode = formatShortcode(shortcodeDraft);
    const snapshotConfig: EmojiConfig = {
      ...config,
      id: `custom-${Date.now()}`,
      shortcode: formattedCode,
    };
    setSavedPack((prev) => [
      {
        config: snapshotConfig,
        createdAt: new Date().toISOString().slice(0, 10),
        usageCount: 1,
      },
      ...prev.filter((item) => item.config.shortcode !== formattedCode),
    ]);
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 1800);
    showToast(`Saved ${formattedCode} to your emoji pack!`, 'success');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedPack((prev) => prev.filter((item) => item.config.id !== id));
    showToast('Removed sticker from saved pack.', 'info');
  };

  const handleCopyShortcode = (shortcode: string, id: string) => {
    navigator.clipboard?.writeText(shortcode);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
    showToast(`Copied ${shortcode} to clipboard!`, 'success');
  };

  const navItems: Array<{
    id: MemoNavView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { id: 'emoji-studio', label: 'Emoji Studio', icon: <Smile className="w-4 h-4" /> },
    { id: 'gif-studio', label: 'GIF Studio', icon: <Film className="w-4 h-4" /> },
    { id: 'meme-maker', label: 'Meme Maker', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'text-to-emoji', label: 'Text to Emoji', icon: <Wand2 className="w-4 h-4" /> },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="w-4 h-4" />,
      badge:
        favoriteEmojis.length +
        favoriteCombinations.length +
        favoriteGifIds.length +
        favoriteTemplateIds.length,
    },
  ];

  const modalSearchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) {
      return {
        emojis: UNICODE_EMOJI_LIBRARY.filter((e) => e.popular).slice(0, 10),
        memes: GIVEN_PHOTO_EMOJIS.slice(0, 8),
      };
    }
    return {
      emojis: UNICODE_EMOJI_LIBRARY.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.emotion.toLowerCase().includes(q) ||
          e.keywords.some((k) => k.toLowerCase().includes(q)) ||
          e.char.includes(q)
      ).slice(0, 12),
      memes: GIVEN_PHOTO_EMOJIS.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.defaultCaption.toLowerCase().includes(q) ||
          m.shortcode.toLowerCase().includes(q)
      ).slice(0, 8),
    };
  }, [globalSearchQuery]);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* CLEAN MODERN NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#E8B1C4]/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#d899b0] dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveView('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 font-display text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white shrink-0 group"
          >
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-06_at_4.41.22_PM_bdbc8d81.jpeg"
              alt="MEMO Logo"
              className="w-9 h-9 rounded-full object-cover bg-white shadow-xs group-hover:scale-105 transition-transform"
            />
            <span>
              <span className="text-[#FF004C]">MEMO</span>{' '}
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hidden sm:inline-block">
                Studio
              </span>
            </span>
          </a>

          {/* Primary Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-white/85 dark:bg-slate-800/90 border border-white/60 dark:border-slate-700 shadow-2xs"
          >
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FF004C] text-white shadow-xs'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-extrabold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Actions: Search, Chat Sandbox, Theme Toggle & Mobile Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setGlobalSearchOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-800 border border-white/70 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer"
              title="Search Emojis, Memes & GIFs"
            >
              <Search className="w-3.5 h-3.5 text-[#FF004C]" />
              <span className="hidden sm:inline">Search</span>
            </button>

            <button
              type="button"
              onClick={() => setIsChatSimOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/90 dark:bg-slate-800 border border-white/70 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer"
              title="Test in Expressive Chat Sandbox"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#FF4925]" />
              <span className="hidden md:inline">Chat Test</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDark((d) => !d)}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl bg-white/90 dark:bg-slate-800 border border-white/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-[#FF4925] transition-colors cursor-pointer"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2 rounded-xl bg-white/90 dark:bg-slate-800 border border-white/70 dark:border-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Compact Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-white/40 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#FF004C] text-white'
                      : 'bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* GLOBAL TOAST NOTIFICATION BANNER */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200 text-xs font-bold animate-in fade-in slide-in-from-bottom-2"
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 dark:text-sky-600 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 dark:text-rose-600 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 w-full">
        {activeView === 'home' && (
          <HomeView
            onNavigate={setActiveView}
            onOpenTemplateInMemeMaker={handleOpenTemplateInMemeMaker}
            customCollectionItems={customPhotos}
            onAddCollectionFiles={handleAddUserPhotos}
            onAddCollectionUrl={handleAddCollectionUrl}
            onDeleteCollectionItem={handleDeleteCollectionItem}
            favoriteEmojis={favoriteEmojis}
            favoriteTemplateIds={favoriteTemplateIds}
            favoriteGifIds={favoriteGifIds}
            recentEmojis={recentEmojis}
            onToggleFavoriteEmoji={handleToggleFavoriteEmoji}
            onToggleFavoriteTemplate={handleToggleFavoriteTemplate}
            onToggleFavoriteGif={handleToggleFavoriteGif}
            onRecordEmojiUse={handleRecordEmojiUse}
            onToast={showToast}
          />
        )}

        {activeView === 'emoji-studio' && (
          <EmojiStudioView
            favoriteEmojis={favoriteEmojis}
            recentEmojis={recentEmojis}
            favoriteCombinations={favoriteCombinations}
            onToggleFavoriteEmoji={handleToggleFavoriteEmoji}
            onRecordEmojiUse={handleRecordEmojiUse}
            onToggleFavoriteCombination={handleToggleFavoriteCombination}
            onToast={showToast}
            customStickerStudioNode={
              <MinimalistCreatorStudio
                config={config}
                allPhotoEmojis={allPhotoEmojis}
                savedPack={savedPack}
                isPlaying={isPlaying}
                shortcodeDraft={shortcodeDraft}
                shortcodeError={shortcodeError}
                saveFeedback={saveFeedback}
                copiedId={copiedId}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onShortcodeChange={handleShortcodeInput}
                onUpdateConfig={handleUpdateConfig}
                onSelectPreset={handleSelectPreset}
                onMixWithStage={handleMixWithStage}
                onRandomPhotoCombo={() => handleRandomPhotoCombo()}
                onRandomVectorRig={handleRandomVectorRig}
                onSaveToPack={handleSaveToPack}
                onDeleteSaved={handleDeleteSaved}
                onCopyShortcode={handleCopyShortcode}
                onOpenExport={() => setIsExportOpen(true)}
                onOpenChatSim={() => setIsChatSimOpen(true)}
                onAddPhotos={handleAddUserPhotos}
              />
            }
          />
        )}

        {activeView === 'gif-studio' && (
          <GifCreatorStudio
            favoriteGifIds={favoriteGifIds}
            onToggleFavoriteGif={handleToggleFavoriteGif}
            onToast={showToast}
          />
        )}

        {activeView === 'meme-maker' && (
          <MemeMakerStudio
            initialTemplate={selectedMemeTemplate}
            favoriteTemplateIds={favoriteTemplateIds}
            onToggleFavoriteTemplate={handleToggleFavoriteTemplate}
            onRecordRecentTemplate={handleRecordRecentTemplate}
            onToast={showToast}
          />
        )}

        {activeView === 'text-to-emoji' && (
          <TextToEmojiView
            onToast={showToast}
            onRecordRecentEmoji={handleRecordEmojiUse}
          />
        )}

        {activeView === 'favorites' && (
          <FavoritesView
            favoriteEmojis={favoriteEmojis}
            favoriteCombinations={favoriteCombinations}
            favoriteGifIds={favoriteGifIds}
            favoriteTemplateIds={favoriteTemplateIds}
            recentEmojis={recentEmojis}
            recentTemplateIds={recentTemplateIds}
            onToggleFavoriteEmoji={handleToggleFavoriteEmoji}
            onToggleFavoriteCombination={handleToggleFavoriteCombination}
            onToggleFavoriteGif={handleToggleFavoriteGif}
            onToggleFavoriteTemplate={handleToggleFavoriteTemplate}
            onOpenTemplateInMemeMaker={handleOpenTemplateInMemeMaker}
            onNavigate={setActiveView}
            onToast={showToast}
          />
        )}
      </main>

      {/* CLEAN FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-11-06_at_4.41.22_PM_bdbc8d81.jpeg"
              alt="MEMO"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span>MEMO — Meme, GIF & Emoji Creation Studio</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className="hover:text-[#FF4925] transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* GLOBAL QUICK SEARCH MODAL */}
      {globalSearchOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 pt-16"
          onClick={() => setGlobalSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Search className="w-5 h-5 text-[#FF4925]" />
              <input
                type="text"
                autoFocus
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search emojis, emotions, or meme templates..."
                className="flex-1 bg-transparent text-sm font-semibold text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setGlobalSearchOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Emojis (Click to Copy)
                </p>
                <div className="flex flex-wrap gap-2">
                  {modalSearchResults.emojis.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(e.char);
                        handleRecordEmojiUse(e.char);
                        showToast(`Copied ${e.char} (${e.name})!`, 'success');
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-[#FF4925] text-xs font-semibold cursor-pointer"
                    >
                      <span className="text-lg memo-emoji-span">{e.char}</span>
                      <span>{e.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Meme Templates (Click to Open in Meme Maker)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {modalSearchResults.memes.map((m) => {
                    const parsed = parseCropUrl(m.photoUrl);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleOpenTemplateInMemeMaker(m)}
                        className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:border-[#FF4925] text-left p-2 space-y-1.5 cursor-pointer"
                      >
                        <img
                          src={parsed.baseUrl}
                          alt={m.name}
                          className="w-full aspect-square rounded-lg object-cover"
                        />
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {m.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Custom Sticker Export & Chat Sandbox */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
      />

      <ChatSimulatorModal
        isOpen={isChatSimOpen}
        onClose={() => setIsChatSimOpen(false)}
        currentConfig={config}
        savedPack={savedPack}
      />
    </div>
  );
}
