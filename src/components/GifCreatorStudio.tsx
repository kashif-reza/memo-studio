import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
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
  Copy,
  Check,
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
  const [copiedFrame, setCopiedFrame] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Method 1: Images to GIF frames
  const [sequenceFrames, setSequenceFrames] = useState<SequenceFrame[]>(() => [
    { id: 'f-1', src: GIVEN_PHOTO_EMOJIS[0].photoUrl, label: GIVEN_PHOTO_EMOJIS[0].name },
    { id: 'f-2', src: GIVEN_PHOTO_EMOJIS[1].photoUrl, label: GIVEN_PHOTO_EMOJIS[1].name },
    { id: 'f-3', src: GIVEN_PHOTO_EMOJIS[2].photoUrl, label: GIVEN_PHOTO_EMOJIS[2].name },
    { id: 'f-4', src: GIVEN_PHOTO_EMOJIS[6].photoUrl, label: GIVEN_PHOTO_EMOJIS[6].name },
  ]);
  const [sequenceTopText, setSequenceTopText] = useState('WAIT FOR IT...');
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
        if (sequenceTopText.trim()) {
          drawOutlinedCaption(sequenceTopText.toUpperCase(), W / 2, 42, 26, '#FFFFFF');
        }
        if (sequenceCaption.trim()) {
          drawOutlinedCaption(sequenceCaption.toUpperCase(), W / 2, H - 36, 26, '#FFBA00');
        }
        // Frame badge indicator
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(12, 12, 74, 24);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`FRAME ${frameIdx + 1}/${count}`, 20, 24);
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
      sequenceTopText,
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

  // Copy active GIF canvas frame to clipboard
  const handleCopyFrameToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined') {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          } catch {
            await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
          }
        } else {
          await navigator.clipboard?.writeText(canvas.toDataURL('image/png'));
        }
        setCopiedFrame(true);
        setTimeout(() => setCopiedFrame(false), 1800);
        onToast('Copied GIF preview frame to clipboard!', 'success');
      }, 'image/png');
    } catch {
      setCopiedFrame(true);
      setTimeout(() => setCopiedFrame(false), 1800);
      onToast('Copied GIF preview frame to clipboard!', 'success');
    }
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
    <div className="w-full min-h-screen bg-[#F9F9F9] text-slate-900">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 space-y-8">
        {/* Header matching MinimalistCreatorStudio & NftCollectionsShowcase */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-wider uppercase">
              <span className="text-[#FF4925]">GIF CREATOR</span>{' '}
              <span className="text-slate-900">STUDIO</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Upload or drag & drop pictures, add top & bottom meme text overlays, and export or copy animated GIFs.
            </p>
          </div>

          {/* 3 Creation Method Switcher Tabs */}
          <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMethod('images-to-gif')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                method === 'images-to-gif'
                  ? 'bg-[#FF4925] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9F9F9]'
              }`}
            >
              <Images className="w-4 h-4" />
              1. Images to GIF
            </button>
            <button
              type="button"
              onClick={() => setMethod('animated-meme-gif')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                method === 'animated-meme-gif'
                  ? 'bg-[#FF4925] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9F9F9]'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              2. Animated Meme GIF
            </button>
            <button
              type="button"
              onClick={() => setMethod('animated-text-gif')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                method === 'animated-text-gif'
                  ? 'bg-[#FF4925] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F9F9F9]'
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
          <div className="lg:col-span-5 bg-white border-2 border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-wider uppercase text-[#FF4925]">
                  LIVE GIF PREVIEW ({totalSteps} FRAMES)
                </div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  {method === 'images-to-gif'
                    ? 'Multi-Image Sequence'
                    : method === 'animated-meme-gif'
                    ? 'Animated Meme Overlay'
                    : 'Kinetic Text Loop'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F9F9F9] hover:bg-[#FFBA00]/25 border border-slate-200 text-slate-900 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#FF4925]" /> : <Play className="w-3.5 h-3.5 text-[#8EBE2A]" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  onClick={() => setStepIndex(0)}
                  className="p-1.5 rounded-lg bg-[#F9F9F9] border border-slate-200 text-slate-700 hover:bg-[#FFBA00]/25 cursor-pointer"
                  title="Restart Loop"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="aspect-square w-full max-w-[380px] mx-auto rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="w-full h-full object-contain block"
              />
            </div>

            {/* Timing, Copy & Export Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Frame Duration / Speed</span>
                  <span className="font-mono text-[#E97A11] tabular-nums">{frameDurationMs} ms / frame</span>
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

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loopGif}
                  onChange={(e) => setLoopGif(e.target.checked)}
                  className="rounded accent-[#FF4925]"
                />
                Infinite Loop (GIF89a Netscape 2.0)
              </label>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyFrameToClipboard}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#FFBA00] hover:bg-[#E97A11] text-slate-950 hover:text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedFrame ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Frame</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleExportGif}
                  disabled={isEncoding}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-[#FF4925] hover:bg-[#E97A11] text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>{isEncoding ? 'Encoding...' : 'Download .GIF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Method-Specific Controls */}
          <div className="lg:col-span-7 bg-white border-2 border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            {method === 'images-to-gif' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Method 1: Multi-Image Sequence to GIF
                    </h2>
                    <p className="text-xs text-slate-600">
                      Drag & drop or upload multiple photos, add top/bottom meme overlays, and reorder frames.
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
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF004C] hover:bg-[#FF4925] text-white cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Pictures
                  </button>
                </div>

                {/* Drag-and-Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleMultiImageUpload(e.dataTransfer.files);
                  }}
                  onClick={() => multiFileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      multiFileInputRef.current?.click();
                    }
                  }}
                  className={`p-4 rounded-xl border-2 border-dashed text-center transition-colors cursor-pointer ${
                    isDraggingOver
                      ? 'border-[#FF4925] bg-[#FFBA00]/15'
                      : 'border-slate-300 bg-[#F9F9F9] hover:border-[#FF4925]'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-700">
                    Drag & drop multiple images here, or click to browse (PNG, JPG, WEBP)
                  </p>
                </div>

                {/* Sequence Frame Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sequenceFrames.map((frame, idx) => {
                    const parsed = parseCropUrl(frame.src);
                    return (
                      <div
                        key={frame.id}
                        className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-2 space-y-2"
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
                            className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Earlier"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[10px] font-semibold text-slate-700 truncate">
                            {frame.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveFrame(idx, 1)}
                            disabled={idx === sequenceFrames.length - 1}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="Move Later"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFrame(frame.id)}
                            className="p-1 rounded bg-[#FF004C]/10 text-[#FF004C] hover:bg-[#FF004C]/20 cursor-pointer"
                            title="Remove Frame"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Top & Bottom Meme Text Overlays for Sequence */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Top Meme Text Overlay
                    </label>
                    <input
                      type="text"
                      value={sequenceTopText}
                      onChange={(e) => setSequenceTopText(e.target.value)}
                      placeholder="Optional top meme text..."
                      className="w-full rounded-xl border border-slate-200 bg-[#F9F9F9] px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF4925]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Bottom Meme Text Overlay
                    </label>
                    <input
                      type="text"
                      value={sequenceCaption}
                      onChange={(e) => setSequenceCaption(e.target.value)}
                      placeholder="Optional bottom meme text..."
                      className="w-full rounded-xl border border-slate-200 bg-[#F9F9F9] px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF4925]"
                    />
                  </div>
                </div>

                {/* Quick Add from Library */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
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
                          className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 hover:border-[#FF4925] transition-colors cursor-pointer"
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
                    <h2 className="font-display text-lg font-bold text-slate-900">
                      Method 2: Image to Animated Meme GIF
                    </h2>
                    <p className="text-xs text-slate-600">
                      Drag & drop or upload a picture, add top/bottom meme captions, and apply kinetic motion.
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
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF004C] hover:bg-[#FF4925] text-white cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Picture
                  </button>
                </div>

                {/* Drag-and-drop zone for single image */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(true);
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleSingleImageUpload(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => singleFileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      singleFileInputRef.current?.click();
                    }
                  }}
                  className={`p-3.5 rounded-xl border-2 border-dashed text-center transition-colors cursor-pointer ${
                    isDraggingOver
                      ? 'border-[#FF4925] bg-[#FFBA00]/15'
                      : 'border-slate-300 bg-[#F9F9F9] hover:border-[#FF4925]'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-700">
                    Drag & drop an image here, or click to upload your own photo
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Top Meme Caption
                    </label>
                    <input
                      type="text"
                      value={memeTopText}
                      onChange={(e) => setMemeTopText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-[#F9F9F9] px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF4925]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Bottom Meme Caption
                    </label>
                    <input
                      type="text"
                      value={memeBottomText}
                      onChange={(e) => setMemeBottomText(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-[#F9F9F9] px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#FF4925]"
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
      <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF4925]" />
              Trending GIF Presets
            </h2>
            <p className="text-xs font-medium text-slate-600">
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
                className="rounded-xl border border-slate-200 bg-[#F9F9F9] p-4 flex flex-col justify-between gap-3"
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
                          ? 'text-[#FF004C] bg-[#FF004C]/10'
                          : 'text-slate-400 hover:text-[#FF004C]'
                      }`}
                      title="Save GIF to Favorites"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{gif.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    “{gif.topText} — {gif.bottomText}”
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadPresetGif(gif)}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-[#FF4925] text-white hover:bg-[#E97A11] transition-colors cursor-pointer"
                >
                  Load in GIF Studio
                </button>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
};

