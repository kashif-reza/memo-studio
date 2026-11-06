import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  Download,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Type,
  Images,
  Wand2,
  Heart,
  RotateCcw,
} from 'lucide-react';
import { GIVEN_PHOTO_EMOJIS, parseCropUrl } from '../utils/photoEmojiCatalog';
import { encodeGif89a, GifFrameInput } from '../utils/gifEncoder';

export type GifCreationMethod = 'images-to-gif' | 'animated-meme-gif' | 'animated-text-gif';
export type GifAnimationStyle = 'bounce' | 'zoom' | 'shake' | 'slide' | 'pop' | 'fade';

export interface SavedGifItem {
  id: string;
  title: string;
  method: GifCreationMethod;
  animationStyle: GifAnimationStyle;
  topText: string;
  bottomText: string;
  imageUrl?: string;
  bgColor: string;
  textColor: string;
  frameDurationMs: number;
}

export const PRESET_TRENDING_GIFS: SavedGifItem[] = [
  {
    id: 'gif-ruko-zara',
    title: 'Ruko Zara Sabar Karo',
    method: 'animated-meme-gif',
    animationStyle: 'shake',
    topText: 'RUKO ZARA',
    bottomText: 'SABAR KARO',
    imageUrl: GIVEN_PHOTO_EMOJIS[1].photoUrl,
    bgColor: '#0f172a',
    textColor: '#FFBA00',
    frameDurationMs: 90,
  },
  {
    id: 'gif-areyy-ladle',
    title: 'Areyy Ladleee Meow',
    method: 'animated-meme-gif',
    animationStyle: 'bounce',
    topText: 'AREYY LADLEEE',
    bottomText: 'MEOWWW GHOP GHOP',
    imageUrl: GIVEN_PHOTO_EMOJIS[0].photoUrl,
    bgColor: '#0f172a',
    textColor: '#FFFFFF',
    frameDurationMs: 95,
  },
  {
    id: 'gif-hera-pheri',
    title: '25 Din Mein Paisa Double',
    method: 'animated-meme-gif',
    animationStyle: 'zoom',
    topText: '25 DIN MEIN',
    bottomText: 'PAISA DOUBLE',
    imageUrl: GIVEN_PHOTO_EMOJIS[2].photoUrl,
    bgColor: '#0f172a',
    textColor: '#FFBA00',
    frameDurationMs: 100,
  },
  {
    id: 'gif-text-hype',
    title: 'Pure Hype Launch GIF',
    method: 'animated-text-gif',
    animationStyle: 'pop',
    topText: 'LET HIM COOK 🔥',
    bottomText: '100% CERTIFIED VIBE',
    bgColor: '#FF4925',
    textColor: '#FFFFFF',
    frameDurationMs: 90,
  },
];

interface SequenceFrame {
  id: string;
  src: string;
  label: string;
}

interface GifCreatorStudioProps {
  favoriteGifIds: string[];
  onToggleFavoriteGif: (id: string) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const GifCreatorStudio: React.FC<GifCreatorStudioProps> = ({
  favoriteGifIds,
  onToggleFavoriteGif,
  onToast,
}) => {
  const [method, setMethod] = useState<GifCreationMethod>('animated-meme-gif');
  const [isPlaying, setIsPlaying] = useState(true);
  const [frameDurationMs, setFrameDurationMs] = useState(110);
  const [loopGif, setLoopGif] = useState(true);
  const [isEncoding, setIsEncoding] = useState(false);

  // Method 1: Images to GIF frames
  const [sequenceFrames, setSequenceFrames] = useState<SequenceFrame[]>(() => [
    { id: 'f-1', src: GIVEN_PHOTO_EMOJIS[0].photoUrl, label: GIVEN_PHOTO_EMOJIS[0].name },
    { id: 'f-2', src: GIVEN_PHOTO_EMOJIS[1].photoUrl, label: GIVEN_PHOTO_EMOJIS[1].name },
    { id: 'f-3', src: GIVEN_PHOTO_EMOJIS[2].photoUrl, label: GIVEN_PHOTO_EMOJIS[2].name },
    { id: 'f-4', src: GIVEN_PHOTO_EMOJIS[6].photoUrl, label: GIVEN_PHOTO_EMOJIS[6].name },
  ]);
  const [sequenceCaption, setSequenceCaption] = useState('MEMO REACTION REEL');

  // Method 2: Image to Animated Meme GIF
  const [memeImageSrc, setMemeImageSrc] = useState(GIVEN_PHOTO_EMOJIS[1].photoUrl);
  const [memeTopText, setMemeTopText] = useState('RUKO ZARA');
  const [memeBottomText, setMemeBottomText] = useState('SABAR KARO 🔥');
  const [animationStyle, setAnimationStyle] = useState<GifAnimationStyle>('bounce');

  // Method 3: Animated Text GIF
  const [textGifMain, setTextGifMain] = useState('EXPRESS YOURSELF ✨');
  const [textGifSub, setTextGifSub] = useState('BEYOND WORDS 🚀');
  const [textGifBgColor, setTextGifBgColor] = useState('#FF4925');
  const [textGifTextColor, setTextGifTextColor] = useState('#FFFFFF');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const singleFileInputRef = useRef<HTMLInputElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [stepIndex, setStepIndex] = useState(0);

  const totalSteps = method === 'images-to-gif' ? Math.max(1, sequenceFrames.length) : 12;

  // Preload any referenced images into imageCacheRef
  useEffect(() => {
    const urls = new Set<string>();
    sequenceFrames.forEach((f) => urls.add(parseCropUrl(f.src).baseUrl));
    urls.add(parseCropUrl(memeImageSrc).baseUrl);

    urls.forEach((url) => {
      if (!imageCacheRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageCacheRef.current.set(url, img);
        };
        img.src = url;
      }
    });
  }, [sequenceFrames, memeImageSrc]);

  // Draw a specific normalized frame (0..totalSteps-1) onto a target 2D context
  const drawGifFrame = useCallback(
    (ctx: CanvasRenderingContext2D, W: number, H: number, frameIdx: number, count: number) => {
      const t = count > 1 ? frameIdx / count : 0; // 0..1
      const angle = t * Math.PI * 2;

      ctx.clearRect(0, 0, W, H);

      const drawImageCoverOrCrop = (rawUrl: string, dx = 0, dy = 0, scaleMult = 1) => {
        const parsed = parseCropUrl(rawUrl);
        const img = imageCacheRef.current.get(parsed.baseUrl);
        if (!img || !img.complete || img.naturalWidth === 0) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, W, H);
          return;
        }
        ctx.save();
        ctx.translate(W / 2 + dx, H / 2 + dy);
        ctx.scale(scaleMult, scaleMult);
        if (parsed.crop) {
          const { x, y, w, h } = parsed.crop;
          ctx.drawImage(img, x, y, w, h, -W / 2, -H / 2, W, H);
        } else {
          const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
          const dw = img.naturalWidth * s;
          const dh = img.naturalHeight * s;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        }
        ctx.restore();
      };

      const drawOutlinedCaption = (text: string, x: number, y: number, fontSize: number, fill = '#FFFFFF') => {
        if (!text.trim()) return;
        ctx.save();
        ctx.font = `900 ${fontSize}px Impact, "Bricolage Grotesque", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.strokeText(text, x, y);
        ctx.fillStyle = fill;
        ctx.fillText(text, x, y);
        ctx.restore();
      };

      if (method === 'images-to-gif') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        const activeFrame = sequenceFrames[frameIdx % Math.max(1, sequenceFrames.length)];
        if (activeFrame) {
          drawImageCoverOrCrop(activeFrame.src, 0, 0, 1);
        }
        if (sequenceCaption.trim()) {
          drawOutlinedCaption(sequenceCaption.toUpperCase(), W / 2, H - 36, 26, '#FFFFFF');
        }
        // Frame badge indicator
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(12, 12, 74, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`FRAME ${frameIdx + 1}/${ count}`, 20, 24);
        return;
      }

      // Compute kinematic offsets for animationStyle
      let offsetX = 0;
      let offsetY = 0;
      let scale = 1;
      let alpha = 1;

      if (animationStyle === 'bounce') {
        offsetY = Math.sin(angle) * 16;
        scale = 1.04 + Math.abs(Math.sin(angle)) * 0.04;
      } else if (animationStyle === 'zoom') {
        scale = 1 + (Math.sin(angle) + 1) * 0.12;
      } else if (animationStyle === 'shake') {
        offsetX = Math.sin(angle * 2) * 14;
        offsetY = Math.cos(angle * 3) * 8;
        scale = 1.06;
      } else if (animationStyle === 'slide') {
        offsetX = Math.sin(angle) * 26;
        scale = 1.08;
      } else if (animationStyle === 'pop') {
        scale = frameIdx % 2 === 0 ? 1.08 : 0.96;
      } else if (animationStyle === 'fade') {
        alpha = 0.45 + (Math.sin(angle) + 1) * 0.275;
      }

      if (method === 'animated-meme-gif') {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.globalAlpha = alpha;
        drawImageCoverOrCrop(memeImageSrc, offsetX, offsetY, scale);
        ctx.restore();

        const textBounceY = Math.sin(angle) * 6;
        drawOutlinedCaption(memeTopText.toUpperCase(), W / 2, 42 + textBounceY, 30, '#FFFFFF');
        drawOutlinedCaption(memeBottomText.toUpperCase(), W / 2, H - 42 - textBounceY, 30, '#FFBA00');
        return;
      }

      // Method 3: Animated Text GIF
      ctx.fillStyle = textGifBgColor;
      ctx.fillRect(0, 0, W, H);

      // Decorative kinetic rings
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.16)';
      ctx.lineWidth = 3;
      const ringRadius = 90 + Math.sin(angle) * 28;
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(W / 2 + offsetX, H / 2 + offsetY);
      ctx.scale(scale, scale);
      ctx.globalAlpha = alpha;
      drawOutlinedCaption(textGifMain, 0, -24, 32, textGifTextColor);
      drawOutlinedCaption(textGifSub, 0, 28, 24, '#FFBA00');
      ctx.restore();
    },
    [
      method,
      sequenceFrames,
      sequenceCaption,
      animationStyle,
      memeImageSrc,
      memeTopText,
      memeBottomText,
      textGifBgColor,
      textGifTextColor,
      textGifMain,
      textGifSub,
    ]
  );

  // Animation loop for live preview canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGifFrame(ctx, canvas.width, canvas.height, stepIndex % totalSteps, totalSteps);

    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % totalSteps);
    }, Math.max(40, frameDurationMs));

    return () => window.clearInterval(timer);
  }, [drawGifFrame, stepIndex, totalSteps, isPlaying, frameDurationMs]);

  // Multi-image upload handler for Method 1
  const handleMultiImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSequenceFrames((prev) => [
            ...prev,
            {
              id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              src: reader.result as string,
              label: file.name.replace(/\.[^.]+$/, ''),
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    onToast(`Added ${files.length} image frame(s) to your GIF sequence!`, 'success');
  };

  // Single image upload handler for Method 2
  const handleSingleImageUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMemeImageSrc(reader.result);
        onToast(`Uploaded "${file.name}" for Animated Meme GIF!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const moveFrame = (index: number, direction: -1 | 1) => {
    setSequenceFrames((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(target, 0, item);
      return copy;
    });
  };

  const removeFrame = (id: string) => {
    if (sequenceFrames.length <= 1) {
      onToast('Keep at least 1 frame in your sequence.', 'info');
      return;
    }
    setSequenceFrames((prev) => prev.filter((f) => f.id !== id));
  };

  // Export real binary .gif file using encodeGif89a
  const handleExportGif = async () => {
    setIsEncoding(true);
    try {
      const offscreen = document.createElement('canvas');
      offscreen.width = 360;
      offscreen.height = 360;
      const ctx = offscreen.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      const framesToEncode: GifFrameInput[] = [];
      const count = method === 'images-to-gif' ? Math.max(1, sequenceFrames.length) : 12;

      for (let i = 0; i < count; i++) {
        drawGifFrame(ctx, offscreen.width, offscreen.height, i, count);
        const imgData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        framesToEncode.push({
          width: offscreen.width,
          height: offscreen.height,
          data: imgData.data,
          delayMs: frameDurationMs,
        });
      }

      const gifBytes = encodeGif89a(framesToEncode, frameDurationMs, loopGif);
      const blob = new Blob([new Uint8Array(gifBytes)], { type: 'image/gif' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memo-${method}-${Date.now()}.gif`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      onToast('Exported & downloaded animated .GIF!', 'success');
    } catch {
      onToast('Failed to encode GIF. Please try again.', 'error');
    } finally {
      setIsEncoding(false);
    }
  };

  const loadPresetGif = (preset: SavedGifItem) => {
    setMethod(preset.method);
    setAnimationStyle(preset.animationStyle);
    setFrameDurationMs(preset.frameDurationMs);
    if (preset.method === 'animated-meme-gif') {
      if (preset.imageUrl) setMemeImageSrc(preset.imageUrl);
      setMemeTopText(preset.topText);
      setMemeBottomText(preset.bottomText);
    } else if (preset.method === 'animated-text-gif') {
      setTextGifMain(preset.topText);
      setTextGifSub(preset.bottomText);
      setTextGifBgColor(preset.bgColor);
      setTextGifTextColor(preset.textColor);
    }
    onToast(`Loaded GIF preset: "${preset.title}"`, 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4925] mb-1">
            <Film className="w-3.5 h-3.5" />
            MEMO GIF Creator Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Create Animated GIFs in Seconds
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Combine multiple photos, animate any meme image, or design kinetic text GIFs with real .GIF export.
          </p>
        </div>

        {/* 3 Creation Method Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMethod('images-to-gif')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              method === 'images-to-gif'
                ? 'bg-[#FF4925] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Images className="w-4 h-4" />
            1. Images to GIF
          </button>
          <button
            type="button"
            onClick={() => setMethod('animated-meme-gif')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              method === 'animated-meme-gif'
                ? 'bg-[#FF4925] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            2. Animated Meme GIF
          </button>
          <button
            type="button"
            onClick={() => setMethod('animated-text-gif')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              method === 'animated-text-gif'
                ? 'bg-[#FF4925] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Type className="w-4 h-4" />
            3. Animated Text GIF
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Live Animated GIF Canvas Preview */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live GIF Preview ({totalSteps} Frames)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => setStepIndex(0)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                title="Restart Loop"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="aspect-square w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="w-full h-full object-contain block"
            />
          </div>

          {/* Timing & Export Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                <span>Frame Duration / Speed</span>
                <span>{frameDurationMs} ms / frame</span>
              </div>
              <input
                type="range"
                min={50}
                max={450}
                step={10}
                value={frameDurationMs}
                onChange={(e) => setFrameDurationMs(Number(e.target.value))}
                className="w-full accent-[#FF4925]"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loopGif}
                  onChange={(e) => setLoopGif(e.target.checked)}
                  className="rounded accent-[#FF4925]"
                />
                Infinite Loop (GIF89a Netscape 2.0)
              </label>

              <button
                type="button"
                onClick={handleExportGif}
                disabled={isEncoding}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {isEncoding ? 'Encoding GIF...' : 'Export & Download .GIF'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Method-Specific Controls */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          {method === 'images-to-gif' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Method 1: Multi-Image Sequence to GIF
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload multiple photos or click templates below to build your frame-by-frame GIF.
                  </p>
                </div>
                <input
                  ref={multiFileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleMultiImageUpload(e.target.files)}
                />
                <button
                  type="button"
                  onClick={() => multiFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Pictures
                </button>
              </div>

              {/* Sequence Frame Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sequenceFrames.map((frame, idx) => {
                  const parsed = parseCropUrl(frame.src);
                  return (
                    <div
                      key={frame.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2 space-y-2"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-900 relative">
                        <img
                          src={parsed.baseUrl}
                          alt={frame.label}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => moveFrame(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move Earlier"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 truncate">
                          {frame.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => moveFrame(idx, 1)}
                          disabled={idx === sequenceFrames.length - 1}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move Later"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFrame(frame.id)}
                          className="p-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 cursor-pointer"
                          title="Remove Frame"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Optional Overlay Caption
                </label>
                <input
                  type="text"
                  value={sequenceCaption}
                  onChange={(e) => setSequenceCaption(e.target.value)}
                  placeholder="Optional caption across frames..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Quick Add from Library */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Quick-Add Frame from Meme Library
                </p>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {GIVEN_PHOTO_EMOJIS.slice(0, 14).map((item) => {
                    const parsed = parseCropUrl(item.photoUrl);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setSequenceFrames((prev) => [
                            ...prev,
                            {
                              id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                              src: item.photoUrl,
                              label: item.name,
                            },
                          ])
                        }
                        className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 hover:border-[#FF4925] transition-colors cursor-pointer"
                        title={`Add ${item.name} frame`}
                      >
                        <img src={parsed.baseUrl} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {method === 'animated-meme-gif' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Method 2: Image to Animated Meme GIF
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload a picture or pick a meme template, add captions, and apply kinetic motion.
                  </p>
                </div>
                <input
                  ref={singleFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleSingleImageUpload(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => singleFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Picture
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Top Meme Caption
                  </label>
                  <input
                    type="text"
                    value={memeTopText}
                    onChange={(e) => setMemeTopText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Bottom Meme Caption
                  </label>
                  <input
                    type="text"
                    value={memeBottomText}
                    onChange={(e) => setMemeBottomText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Animation Effect Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Animation Effect
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['bounce', 'zoom', 'shake', 'slide', 'pop', 'fade'] as GifAnimationStyle[]).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setAnimationStyle(style)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-colors cursor-pointer ${
                          animationStyle === style
                            ? 'border-[#FF4925] bg-[#FF4925] text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Template Picker Strip */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Or Choose a Viral Template
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-44 overflow-y-auto pr-1">
                  {GIVEN_PHOTO_EMOJIS.slice(0, 24).map((item) => {
                    const parsed = parseCropUrl(item.photoUrl);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setMemeImageSrc(item.photoUrl);
                          setMemeBottomText(item.defaultCaption);
                        }}
                        className={`aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          memeImageSrc === item.photoUrl
                            ? 'border-[#FF4925] ring-2 ring-[#FF4925]/30'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                        title={item.name}
                      >
                        <img src={parsed.baseUrl} alt={item.name} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {method === 'animated-text-gif' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Method 3: Animated Text GIF
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter custom headline and subtext, choose an animation preset, and customize colors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Primary Headline
                  </label>
                  <input
                    type="text"
                    value={textGifMain}
                    onChange={(e) => setTextGifMain(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Secondary Line
                  </label>
                  <input
                    type="text"
                    value={textGifSub}
                    onChange={(e) => setTextGifSub(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Animation Style
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['fade', 'bounce', 'slide', 'zoom', 'pop', 'shake'] as GifAnimationStyle[]).map(
                    (style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setAnimationStyle(style)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold capitalize border transition-colors cursor-pointer ${
                          animationStyle === style
                            ? 'border-[#FF4925] bg-[#FF4925] text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {style}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textGifBgColor}
                      onChange={(e) => setTextGifBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {textGifBgColor}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Headline Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textGifTextColor}
                      onChange={(e) => setTextGifTextColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                      {textGifTextColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popular & Trending Animated GIF Presets */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF4925]" />
              Trending GIF Presets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Load any preset into the live GIF studio or save it to your Favorites.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_TRENDING_GIFS.map((gif) => {
            const isFav = favoriteGifIds.includes(gif.id);
            return (
              <div
                key={gif.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-[#FF4925]/10 text-[#FF4925]">
                      {gif.animationStyle} GIF
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleFavoriteGif(gif.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-rose-500 bg-rose-500/10'
                          : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title="Save GIF to Favorites"
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
                  onClick={() => loadPresetGif(gif)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 text-white hover:bg-[#FF4925] transition-colors cursor-pointer"
                >
                  Load in GIF Studio
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
