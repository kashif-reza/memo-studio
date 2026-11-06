import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Upload,
  Type,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  RotateCcw,
  Download,
  Copy,
  Search,
  Heart,
  Sparkles,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Check,
  RefreshCw,
} from 'lucide-react';
import { GIVEN_PHOTO_EMOJIS, parseCropUrl } from '../utils/photoEmojiCatalog';
import { GivenPhotoItem } from '../types/emoji';

export interface MemeTextLayer {
  id: string;
  label: string;
  text: string;
  x: number; // percentage 0..100
  y: number; // percentage 0..100
  fontSize: number; // px on 640x640 canvas
  fontFamily: string;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  bgColor: string;
  bgOpacity: number; // 0..1
  align: 'left' | 'center' | 'right';
  rotation: number; // degrees -45..45
  opacity: number; // 0.1..1
  uppercase: boolean;
}

interface MemeMakerState {
  imageSrc: string;
  imageTitle: string;
  isCustomUpload: boolean;
  layers: MemeTextLayer[];
}

interface MemeMakerStudioProps {
  initialTemplate?: GivenPhotoItem | null;
  favoriteTemplateIds: string[];
  onToggleFavoriteTemplate: (id: string) => void;
  onRecordRecentTemplate: (id: string) => void;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const FONT_OPTIONS = [
  { label: 'Classic Meme (Impact)', value: 'Impact, "Bricolage Grotesque", "Arial Black", sans-serif' },
  { label: 'Bricolage Display', value: '"Bricolage Grotesque", sans-serif' },
  { label: 'Modern Sans (Jakarta)', value: '"Plus Jakarta Sans", sans-serif' },
  { label: 'Mono Code', value: '"JetBrains Mono", monospace' },
];

const DEFAULT_LAYERS: MemeTextLayer[] = [
  {
    id: 'layer-top',
    label: 'Top Text',
    text: 'WHEN THE CODE COMPILES',
    x: 50,
    y: 11,
    fontSize: 42,
    fontFamily: FONT_OPTIONS[0].value,
    color: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 7,
    bgColor: '#000000',
    bgOpacity: 0,
    align: 'center',
    rotation: 0,
    opacity: 1,
    uppercase: true,
  },
  {
    id: 'layer-bottom',
    label: 'Bottom Text',
    text: 'ON THE VERY FIRST TRY',
    x: 50,
    y: 89,
    fontSize: 42,
    fontFamily: FONT_OPTIONS[0].value,
    color: '#FFFFFF',
    outlineColor: '#000000',
    outlineWidth: 7,
    bgColor: '#000000',
    bgOpacity: 0,
    align: 'center',
    rotation: 0,
    opacity: 1,
    uppercase: true,
  },
];

export const MemeMakerStudio: React.FC<MemeMakerStudioProps> = ({
  initialTemplate,
  favoriteTemplateIds,
  onToggleFavoriteTemplate,
  onRecordRecentTemplate,
  onToast,
}) => {
  const defaultTemplate = initialTemplate || GIVEN_PHOTO_EMOJIS[0];

  const [history, setHistory] = useState<{
    past: MemeMakerState[];
    present: MemeMakerState;
    future: MemeMakerState[];
  }>(() => ({
    past: [],
    present: {
      imageSrc: defaultTemplate.photoUrl,
      imageTitle: defaultTemplate.name,
      isCustomUpload: false,
      layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
    },
    future: [],
  }));

  const [selectedLayerId, setSelectedLayerId] = useState<string>('layer-top');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState<'all' | 'featured' | 'favorites'>('all');
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);
  const [imageTick, setImageTick] = useState(0);

  const currentState = history.present;
  const selectedLayer =
    currentState.layers.find((l) => l.id === selectedLayerId) || currentState.layers[0] || null;

  const commitState = useCallback((updater: (prev: MemeMakerState) => MemeMakerState) => {
    setHistory((h) => {
      const next = updater(h.present);
      return {
        past: [...h.past.slice(-24), h.present],
        present: next,
        future: [],
      };
    });
  }, []);

  // Sync external initialTemplate selection
  useEffect(() => {
    if (initialTemplate) {
      commitState((prev) => ({
        ...prev,
        imageSrc: initialTemplate.photoUrl,
        imageTitle: initialTemplate.name,
        isCustomUpload: false,
      }));
      onRecordRecentTemplate(initialTemplate.id);
    }
  }, [initialTemplate, commitState, onRecordRecentTemplate]);

  // Load current image for canvas rendering
  useEffect(() => {
    const parsed = parseCropUrl(currentState.imageSrc);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImageRef.current = img;
      setImageTick((t) => t + 1);
    };
    img.src = parsed.baseUrl;
  }, [currentState.imageSrc]);

  // Render meme onto the 640x640 HTML5 Canvas
  const renderMemeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background fill
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);

    // Draw base image (supporting both standard images and #crop=... sprite coordinates)
    const img = loadedImageRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      const parsed = parseCropUrl(currentState.imageSrc);
      if (parsed.crop) {
        const { x, y, w, h } = parsed.crop;
        ctx.drawImage(img, x, y, w, h, 0, 0, W, H);
      } else {
        // Cover-fit center crop so meme canvas looks crisp
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const offsetX = (W - drawW) / 2;
        const offsetY = (H - drawH) / 2;
        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      }
    }

    // Draw each text layer
    for (const layer of currentState.layers) {
      if (!layer.text.trim()) continue;
      ctx.save();

      const posX = (layer.x / 100) * W;
      const posY = (layer.y / 100) * H;
      ctx.translate(posX, posY);
      if (layer.rotation !== 0) {
        ctx.rotate((layer.rotation * Math.PI) / 180);
      }
      ctx.globalAlpha = layer.opacity;

      const displayText = layer.uppercase ? layer.text.toUpperCase() : layer.text;
      ctx.font = `900 ${layer.fontSize}px ${layer.fontFamily}`;
      ctx.textAlign = layer.align;
      ctx.textBaseline = 'middle';

      // Multi-line support if user enters newlines or long text
      const rawLines = displayText.split('\n');
      const wrappedLines: string[] = [];
      const maxLineWidth = W * 0.9;

      for (const rawLine of rawLines) {
        const words = rawLine.split(' ');
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          if (ctx.measureText(testLine).width > maxLineWidth && currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) wrappedLines.push(currentLine);
      }

      const lineHeight = layer.fontSize * 1.18;
      const totalHeight = wrappedLines.length * lineHeight;
      const startY = -totalHeight / 2 + lineHeight / 2;

      for (let i = 0; i < wrappedLines.length; i++) {
        const line = wrappedLines[i];
        const lineY = startY + i * lineHeight;
        const metrics = ctx.measureText(line);

        if (layer.bgOpacity > 0) {
          ctx.save();
          ctx.globalAlpha = layer.opacity * layer.bgOpacity;
          ctx.fillStyle = layer.bgColor;
          const padX = 14;
          const padY = 6;
          let boxX = -metrics.width / 2 - padX;
          if (layer.align === 'left') boxX = -padX;
          if (layer.align === 'right') boxX = -metrics.width - padX;
          ctx.fillRect(boxX, lineY - layer.fontSize / 2 - padY, metrics.width + padX * 2, layer.fontSize + padY * 2);
          ctx.restore();
        }

        if (layer.outlineWidth > 0) {
          ctx.strokeStyle = layer.outlineColor;
          ctx.lineWidth = layer.outlineWidth;
          ctx.lineJoin = 'round';
          ctx.miterLimit = 2;
          ctx.strokeText(line, 0, lineY);
        }

        ctx.fillStyle = layer.color;
        ctx.fillText(line, 0, lineY);
      }

      ctx.restore();
    }
  }, [currentState]);

  useEffect(() => {
    renderMemeCanvas();
  }, [renderMemeCanvas, imageTick]);

  // Dragging text layers directly on the preview stage
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingLayerId || !previewContainerRef.current) return;
      const rect = previewContainerRef.current.getBoundingClientRect();
      const relX = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
      const relY = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100));

      setHistory((h) => ({
        ...h,
        present: {
          ...h.present,
          layers: h.present.layers.map((l) =>
            l.id === draggingLayerId ? { ...l, x: Math.round(relX), y: Math.round(relY) } : l
          ),
        },
      }));
    },
    [draggingLayerId]
  );

  const handlePointerUp = useCallback(() => {
    setDraggingLayerId(null);
  }, []);

  // Handle custom image upload (PNG, JPG, JPEG, WEBP)
  const handleFileUpload = (file: File | undefined) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onToast('Please upload a PNG, JPG, JPEG, or WEBP image.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        commitState((prev) => ({
          ...prev,
          imageSrc: reader.result as string,
          imageTitle: file.name.replace(/\.[^.]+$/, ''),
          isCustomUpload: true,
        }));
        onToast(`Uploaded "${file.name}" to Meme Maker!`, 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const updateSelectedLayer = (patch: Partial<MemeTextLayer>) => {
    if (!selectedLayer) return;
    commitState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === selectedLayer.id ? { ...l, ...patch } : l)),
    }));
  };

  const handleAddCustomLayer = () => {
    const newId = `layer-${Date.now()}`;
    const newLayer: MemeTextLayer = {
      id: newId,
      label: `Custom Text ${currentState.layers.length + 1}`,
      text: 'NEW CAPTION',
      x: 50,
      y: 50,
      fontSize: 38,
      fontFamily: FONT_OPTIONS[0].value,
      color: '#FFFFFF',
      outlineColor: '#000000',
      outlineWidth: 6,
      bgColor: '#000000',
      bgOpacity: 0,
      align: 'center',
      rotation: 0,
      opacity: 1,
      uppercase: true,
    };
    commitState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
    }));
    setSelectedLayerId(newId);
    onToast('Added custom text layer — drag it anywhere on the meme!', 'info');
  };

  const handleDeleteLayer = (id: string) => {
    if (currentState.layers.length <= 1) {
      onToast('Keep at least one text layer or clear its text.', 'info');
      return;
    }
    commitState((prev) => {
      const remaining = prev.layers.filter((l) => l.id !== id);
      if (selectedLayerId === id && remaining[0]) {
        setSelectedLayerId(remaining[0].id);
      }
      return { ...prev, layers: remaining };
    });
  };

  const handleUndo = () => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      return {
        past: h.past.slice(0, -1),
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  };

  const handleRedo = () => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      return {
        past: [...h.past, h.present],
        present: next,
        future: h.future.slice(1),
      };
    });
  };

  const handleReset = () => {
    commitState(() => ({
      imageSrc: defaultTemplate.photoUrl,
      imageTitle: defaultTemplate.name,
      isCustomUpload: false,
      layers: DEFAULT_LAYERS.map((l) => ({ ...l })),
    }));
    setSelectedLayerId('layer-top');
    onToast('Meme editor reset to default state.', 'info');
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mimeType, 0.94);
    const link = document.createElement('a');
    const safeName = currentState.imageTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    link.download = `memo-meme-${safeName || 'custom'}.${format}`;
    link.href = dataUrl;
    link.click();
    onToast(`Downloaded meme as ${format.toUpperCase()}!`, 'success');
  };

  const handleCopyMemeImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (blob && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopiedState(true);
        setTimeout(() => setCopiedState(false), 2000);
        onToast('Copied meme image to clipboard!', 'success');
      } else {
        const captions = currentState.layers.map((l) => l.text).join(' — ');
        await navigator.clipboard.writeText(captions);
        onToast('Copied meme caption to clipboard!', 'info');
      }
    } catch {
      onToast('Could not copy image directly — use Download PNG.', 'info');
    }
  };

  const filteredTemplates = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    return GIVEN_PHOTO_EMOJIS.filter((item) => {
      if (templateFilter === 'featured' && !item.id.startsWith('pin-')) return false;
      if (templateFilter === 'favorites' && !favoriteTemplateIds.includes(item.id)) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.shortcode.toLowerCase().includes(q) ||
        item.defaultCaption.toLowerCase().includes(q) ||
        (item.mood || '').toLowerCase().includes(q)
      );
    });
  }, [templateSearch, templateFilter, favoriteTemplateIds]);

  return (
    <div className="w-full min-h-screen bg-[#F9F9F9] text-slate-900">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 space-y-8">
      {/* Studio Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-2 border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF004C] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            MEMO Meme Creator Studio
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
            MEME <span className="text-[#FF4925]">CREATOR</span> STUDIO
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
            Upload your own photo or pick from 139 viral templates. Drag text layers directly on the canvas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.past.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
            Undo
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={history.future.length === 0}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
            Redo
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleCopyMemeImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-[#FF4925] transition-colors cursor-pointer"
          >
            {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedState ? 'Copied!' : 'Copy Meme'}
          </button>
          <button
            type="button"
            onClick={() => handleDownload('png')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FF4925] hover:bg-[#e03d1d] text-white shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            PNG
          </button>
          <button
            type="button"
            onClick={() => handleDownload('jpg')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            JPG
          </button>
        </div>
      </div>

      {/* Main Workspace Grid: Canvas Left, Controls Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Meme Canvas & Upload Zone */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Canvas
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {currentState.imageTitle}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Move className="w-3.5 h-3.5" /> Drag badges to move text
              </span>
            </div>

            {/* Interactive Canvas Container */}
            <div
              ref={previewContainerRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="group/canvas relative w-full aspect-square max-w-[520px] mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 select-none touch-none shadow-inner"
            >
              <canvas
                ref={canvasRef}
                width={640}
                height={640}
                className="w-full h-full object-contain block"
              />

              {/* Interactive Drag Pins positioned above each text line so they never cover the meme text */}
              {currentState.layers.map((layer) => {
                const isSelected = selectedLayer?.id === layer.id;
                const badgeTop = layer.y > 50 ? Math.max(6, layer.y - 7) : Math.min(94, layer.y - 6);
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedLayerId(layer.id);
                      setDraggingLayerId(layer.id);
                    }}
                    style={{
                      left: `${layer.x}%`,
                      top: `${badgeTop}%`,
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-full px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-grab active:cursor-grabbing opacity-85 hover:opacity-100 ${
                      isSelected
                        ? 'bg-[#FF4925] text-white ring-1 ring-white shadow-md'
                        : 'bg-slate-900/75 text-white/90 hover:bg-slate-900 border border-white/30'
                    }`}
                    title={`Drag to reposition "${layer.label}"`}
                  >
                    ↕ {layer.label}
                  </button>
                );
              })}
            </div>

            {/* Upload / Replace / Remove Own Picture Bar */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOverUpload(true);
              }}
              onDragLeave={() => setIsDraggingOverUpload(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOverUpload(false);
                const file = e.dataTransfer.files?.[0];
                handleFileUpload(file);
              }}
              className={`mt-4 rounded-xl border-2 border-dashed p-4 transition-colors ${
                isDraggingOverUpload
                  ? 'border-[#FF4925] bg-[#FF4925]/5'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4925]/10 text-[#FF4925] flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {currentState.isCustomUpload ? 'Custom Image Loaded' : 'Upload Your Own Picture'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Drag & drop or browse PNG, JPG, JPEG, WEBP
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    {currentState.isCustomUpload ? 'Replace Image' : 'Upload Photo'}
                  </button>
                  {currentState.isCustomUpload && (
                    <button
                      type="button"
                      onClick={() => {
                        commitState((prev) => ({
                          ...prev,
                          imageSrc: defaultTemplate.photoUrl,
                          imageTitle: defaultTemplate.name,
                          isCustomUpload: false,
                        }));
                        onToast('Removed uploaded photo and restored template.', 'info');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Layer Manager & Full Typography Controls */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Layer Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                {currentState.layers.map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setSelectedLayerId(layer.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      selectedLayer?.id === layer.id
                        ? 'bg-[#FF4925] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {layer.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddCustomLayer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white border border-slate-800 dark:border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Text Layer
              </button>
            </div>

            {selectedLayer && (
              <div className="space-y-4">
                {/* Text Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#FF4925]" />
                      {selectedLayer.label} Content
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelectedLayer({
                            color: '#FFFFFF',
                            outlineColor: '#000000',
                            outlineWidth: 7,
                            fontFamily: FONT_OPTIONS[0].value,
                            uppercase: true,
                          })
                        }
                        className="text-[11px] font-semibold text-[#FF4925] hover:underline cursor-pointer"
                      >
                        Classic Impact Preset
                      </button>
                      {currentState.layers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteLayer(selectedLayer.id)}
                          className="text-xs text-rose-500 hover:text-rose-600 p-1 cursor-pointer"
                          title="Delete Text Layer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={selectedLayer.text}
                    onChange={(e) => updateSelectedLayer({ text: e.target.value })}
                    placeholder="Type meme text here..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
                  />
                </div>

                {/* Font Family & Alignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedLayer.fontFamily}
                      onChange={(e) => updateSelectedLayer({ fontFamily: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.label} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Alignment & Case
                    </label>
                    <div className="flex items-center gap-1.5">
                      {(['left', 'center', 'right'] as const).map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => updateSelectedLayer({ align })}
                          className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                            selectedLayer.align === align
                              ? 'border-[#FF4925] bg-[#FF4925]/10 text-[#FF4925]'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {align === 'left' && <AlignLeft className="w-4 h-4" />}
                          {align === 'center' && <AlignCenter className="w-4 h-4" />}
                          {align === 'right' && <AlignRight className="w-4 h-4" />}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateSelectedLayer({ uppercase: !selectedLayer.uppercase })}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          selectedLayer.uppercase
                            ? 'border-[#FF4925] bg-[#FF4925]/10 text-[#FF4925]'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        CAPS
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sliders: Font Size, Outline Width, Rotation, Opacity */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Font Size</span>
                      <span>{selectedLayer.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={18}
                      max={76}
                      value={selectedLayer.fontSize}
                      onChange={(e) => updateSelectedLayer({ fontSize: Number(e.target.value) })}
                      className="w-full accent-[#FF4925]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Outline Stroke</span>
                      <span>{selectedLayer.outlineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={14}
                      value={selectedLayer.outlineWidth}
                      onChange={(e) => updateSelectedLayer({ outlineWidth: Number(e.target.value) })}
                      className="w-full accent-[#FF4925]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Rotation</span>
                      <span>{selectedLayer.rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-45}
                      max={45}
                      value={selectedLayer.rotation}
                      onChange={(e) => updateSelectedLayer({ rotation: Number(e.target.value) })}
                      className="w-full accent-[#FF4925]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      <span>Layer Opacity</span>
                      <span>{Math.round(selectedLayer.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      value={Math.round(selectedLayer.opacity * 100)}
                      onChange={(e) => updateSelectedLayer({ opacity: Number(e.target.value) / 100 })}
                      className="w-full accent-[#FF4925]"
                    />
                  </div>
                </div>

                {/* Colors: Text Color, Outline Color, Background Box Color & Opacity */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedLayer.color}
                        onChange={(e) => updateSelectedLayer({ color: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {selectedLayer.color}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Outline Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedLayer.outlineColor}
                        onChange={(e) => updateSelectedLayer({ outlineColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {selectedLayer.outlineColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Box Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedLayer.bgColor}
                        onChange={(e) => updateSelectedLayer({ bgColor: e.target.value })}
                        className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {selectedLayer.bgColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Box Fill ({Math.round(selectedLayer.bgOpacity * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(selectedLayer.bgOpacity * 100)}
                      onChange={(e) => updateSelectedLayer({ bgOpacity: Number(e.target.value) / 100 })}
                      className="w-full accent-[#FF4925] mt-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Searchable Meme Template Gallery (All 139 Local Templates) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Meme Template Gallery ({filteredTemplates.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any template to load it onto the canvas or save it to your Favorites.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates (e.g. Hera Pheri, Doge, Bean)..."
                className="pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-64 focus:outline-none focus:ring-2 focus:ring-[#FF4925]"
              />
            </div>

            {(['all', 'featured', 'favorites'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setTemplateFilter(tab)}
                className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  templateFilter === tab
                    ? 'bg-[#FF4925] text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab === 'featured' ? 'Viral Memes' : tab}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                const randomItem =
                  GIVEN_PHOTO_EMOJIS[Math.floor(Math.random() * GIVEN_PHOTO_EMOJIS.length)];
                commitState((prev) => ({
                  ...prev,
                  imageSrc: randomItem.photoUrl,
                  imageTitle: randomItem.name,
                  isCustomUpload: false,
                }));
                onRecordRecentTemplate(randomItem.id);
                onToast(`Loaded random template: ${randomItem.name}`, 'info');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Random Template
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-[420px] overflow-y-auto pr-1">
          {filteredTemplates.map((tpl) => {
            const parsed = parseCropUrl(tpl.photoUrl);
            const isSelected = currentState.imageSrc === tpl.photoUrl;
            const isFav = favoriteTemplateIds.includes(tpl.id);
            return (
              <div
                key={tpl.id}
                className={`group relative rounded-xl overflow-hidden border transition-all ${
                  isSelected
                    ? 'border-[#FF4925] ring-2 ring-[#FF4925]/30 bg-[#FF4925]/5'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    commitState((prev) => ({
                      ...prev,
                      imageSrc: tpl.photoUrl,
                      imageTitle: tpl.name,
                      isCustomUpload: false,
                    }));
                    onRecordRecentTemplate(tpl.id);
                    onToast(`Selected "${tpl.name}"`, 'info');
                  }}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="aspect-square w-full overflow-hidden bg-slate-900">
                    <img
                      src={parsed.baseUrl}
                      alt={tpl.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tpl.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {tpl.defaultCaption}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavoriteTemplate(tpl.id);
                  }}
                  className={`absolute top-1.5 right-1.5 p-1.5 rounded-lg backdrop-blur-sm transition-colors cursor-pointer ${
                    isFav
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-900/60 text-white/80 hover:text-white'
                  }`}
                  title={isFav ? 'Remove from Favorites' : 'Save to Favorites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
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
