import React from 'react';
import {
  Heart,
  Smile,
  Film,
  Image as ImageIcon,
  Copy,
  Sparkles,
  Trash2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { GIVEN_PHOTO_EMOJIS, parseCropUrl } from '../utils/photoEmojiCatalog';
import { GivenPhotoItem } from '../types/emoji';
import { PRESET_TRENDING_GIFS } from './GifCreatorStudio';
import { FormattedEmojiText } from './FormattedEmojiText';

interface FavoritesViewProps {
  favoriteEmojis: string[];
  favoriteCombinations: string[];
  favoriteGifIds: string[];
  favoriteTemplateIds: string[];
  recentEmojis: string[];
  recentTemplateIds: string[];
  onToggleFavoriteEmoji: (char: string) => void;
  onToggleFavoriteCombination: (combo: string) => void;
  onToggleFavoriteGif: (id: string) => void;
  onToggleFavoriteTemplate: (id: string) => void;
  onOpenTemplateInMemeMaker: (template: GivenPhotoItem) => void;
  onNavigate: (view: 'home' | 'emoji-studio' | 'gif-studio' | 'meme-maker' | 'text-to-emoji' | 'favorites') => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteEmojis,
  favoriteCombinations,
  favoriteGifIds,
  favoriteTemplateIds,
  recentEmojis,
  recentTemplateIds,
  onToggleFavoriteEmoji,
  onToggleFavoriteCombination,
  onToggleFavoriteGif,
  onToggleFavoriteTemplate,
  onOpenTemplateInMemeMaker,
  onNavigate,
  onToast,
}) => {
  const totalFavorites =
    favoriteEmojis.length +
    favoriteCombinations.length +
    favoriteGifIds.length +
    favoriteTemplateIds.length;

  const favoriteTemplates = GIVEN_PHOTO_EMOJIS.filter((t) => favoriteTemplateIds.includes(t.id));
  const favoriteGifs = PRESET_TRENDING_GIFS.filter((g) => favoriteGifIds.includes(g.id));
  const recentTemplates = GIVEN_PHOTO_EMOJIS.filter((t) => recentTemplateIds.includes(t.id));

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast(`Copied ${label} to clipboard!`, 'success');
    } catch {
      onToast('Clipboard access failed.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500 mb-1">
            <Heart className="w-3.5 h-3.5 fill-current" />
            MEMO Personal Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Favorites & Recently Used
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Your saved emojis, combinations, animated GIFs, and viral meme templates in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
            {totalFavorites} Saved Item{totalFavorites === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {totalFavorites === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              No favorites yet. Start exploring and save your favorite expressions.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click the heart icon on any emoji, combination, GIF preset, or meme template to build your personal toolkit.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('emoji-studio')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF4925] text-white hover:bg-[#e03d1d] transition-colors cursor-pointer"
            >
              <Smile className="w-4 h-4" />
              Explore Emojis
            </button>
            <button
              type="button"
              onClick={() => onNavigate('meme-maker')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <ImageIcon className="w-4 h-4" />
              Browse Meme Templates
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Favorite Emojis & Combinations */}
          {(favoriteEmojis.length > 0 || favoriteCombinations.length > 0) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#FF4925]" />
                Saved Emojis & Combinations
              </h2>

              <div className="flex flex-wrap gap-3">
                {favoriteEmojis.map((char) => (
                  <div
                    key={char}
                    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <span className="text-2xl memo-emoji-span">{char}</span>
                    <button
                      type="button"
                      onClick={() => copyText(char, char)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#FF4925] cursor-pointer"
                      title="Copy emoji"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteEmoji(char)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove favorite"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {favoriteCombinations.map((combo) => (
                  <div
                    key={combo}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-xl border border-[#FF4925]/30 bg-[#FF4925]/5"
                  >
                    <span className="text-xl">
                      <FormattedEmojiText text={combo} />
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(combo, 'Emoji combination')}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-[#FF4925] cursor-pointer"
                      title="Copy combo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteCombination(combo)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Remove combo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Meme Templates */}
          {favoriteTemplates.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#FF4925]" />
                Saved Meme Templates ({favoriteTemplates.length})
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {favoriteTemplates.map((tpl) => {
                  const parsed = parseCropUrl(tpl.photoUrl);
                  return (
                    <div
                      key={tpl.id}
                      className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between"
                    >
                      <div className="aspect-square bg-slate-900 relative">
                        <img
                          src={parsed.baseUrl}
                          alt={tpl.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => onToggleFavoriteTemplate(tpl.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-500 text-white cursor-pointer"
                          title="Remove from Favorites"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {tpl.name}
                        </p>
                        <button
                          type="button"
                          onClick={() => onOpenTemplateInMemeMaker(tpl)}
                          className="w-full py-1.5 rounded-lg text-[11px] font-bold bg-[#FF4925] text-white hover:bg-[#e03d1d] transition-colors cursor-pointer"
                        >
                          Open in Meme Maker
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorite GIFs */}
          {favoriteGifs.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-[#FF4925]" />
                Saved Animated GIFs ({favoriteGifs.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {favoriteGifs.map((gif) => (
                  <div
                    key={gif.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#FF4925]">
                        {gif.animationStyle} GIF
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {gif.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {gif.topText} — {gif.bottomText}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate('gif-studio')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-[#FF4925] transition-colors cursor-pointer"
                      >
                        Open GIF Studio
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteGif(gif.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recently Used Activity Strip */}
      {(recentEmojis.length > 0 || recentTemplates.length > 0) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Recently Used Expressions
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('emoji-studio')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FF4925] hover:underline cursor-pointer"
            >
              Open Studio <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {recentEmojis.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => copyText(char, char)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-[#FF4925] text-xl cursor-pointer"
                title={`Click to copy ${char}`}
              >
                <span className="memo-emoji-span">{char}</span>
              </button>
            ))}

            {recentTemplates.slice(0, 6).map((tpl) => {
              const parsed = parseCropUrl(tpl.photoUrl);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onOpenTemplateInMemeMaker(tpl)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-[#FF4925] cursor-pointer"
                >
                  <img
                    src={parsed.baseUrl}
                    alt={tpl.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {tpl.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
