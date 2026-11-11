import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Crop as CropIcon,
  Sliders,
  Sparkles,
  RefreshCw,
  FileText,
  Sun,
  Contrast,
  Droplets,
  Layers
} from 'lucide-react';
import { ImageItem, ImageFilters, Language } from '../types';

interface Props {
  image: ImageItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ImageItem) => void;
  lang: Language;
}

type AspectRatioPreset = 'free' | '1:1' | 'a4' | '4:3' | '16:9' | '3:2';

interface CropBox {
  x: number; // percentage 0-100
  y: number;
  w: number;
  h: number;
}

export const ImageEditorModal: React.FC<Props> = ({
  image,
  isOpen,
  onClose,
  onSave,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'crop' | 'filters'>('crop');
  const [rotation, setRotation] = useState<number>(image.rotation || 0);
  const [flipH, setFlipH] = useState<boolean>(image.flipH || false);
  const [flipV, setFlipV] = useState<boolean>(image.flipV || false);
  const [filters, setFilters] = useState<ImageFilters>({
    brightness: image.filters?.brightness ?? 100,
    contrast: image.filters?.contrast ?? 100,
    grayscale: image.filters?.grayscale ?? 0,
    blur: image.filters?.blur ?? 0,
    saturation: image.filters?.saturation ?? 100,
  });

  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>('free');
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, w: 100, h: 100 });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef<{
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw' | null;
    startX: number;
    startY: number;
    initialBox: CropBox;
  }>({ mode: null, startX: 0, startY: 0, initialBox: { x: 0, y: 0, w: 100, h: 100 } });

  // Reset internal state when image changes
  useEffect(() => {
    if (isOpen && image) {
      setRotation(image.rotation || 0);
      setFlipH(image.flipH || false);
      setFlipV(image.flipV || false);
      setFilters({
        brightness: image.filters?.brightness ?? 100,
        contrast: image.filters?.contrast ?? 100,
        grayscale: image.filters?.grayscale ?? 0,
        blur: image.filters?.blur ?? 0,
        saturation: image.filters?.saturation ?? 100,
      });
      setCropBox({ x: 0, y: 0, w: 100, h: 100 });
      setAspectRatio('free');
    }
  }, [isOpen, image]);

  // Adjust cropBox when aspect ratio changes
  const applyAspectRatio = useCallback((ratio: AspectRatioPreset) => {
    setAspectRatio(ratio);
    if (ratio === 'free') return;

    let targetRatio = 1;
    if (ratio === '1:1') targetRatio = 1;
    else if (ratio === 'a4') targetRatio = 1 / 1.414; // Portrait A4
    else if (ratio === '4:3') targetRatio = 4 / 3;
    else if (ratio === '16:9') targetRatio = 16 / 9;
    else if (ratio === '3:2') targetRatio = 3 / 2;

    const imgW = image.width || 800;
    const imgH = image.height || 600;
    const isRotated90 = (rotation % 180 !== 0);
    const effW = isRotated90 ? imgH : imgW;
    const effH = isRotated90 ? imgW : imgH;
    const naturalRatio = effW / effH;

    let newW = 80;
    let newH = 80;

    if (targetRatio > naturalRatio) {
      newW = 90;
      newH = (90 * naturalRatio) / targetRatio;
    } else {
      newH = 90;
      newW = (90 * targetRatio) / naturalRatio;
    }

    newW = Math.min(100, Math.max(20, newW));
    newH = Math.min(100, Math.max(20, newH));

    setCropBox({
      x: (100 - newW) / 2,
      y: (100 - newH) / 2,
      w: newW,
      h: newH,
    });
  }, [image, rotation]);

  // Pointer drag handlers for crop box
  const handlePointerDown = (
    e: React.PointerEvent,
    mode: 'move' | 'nw' | 'ne' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isDraggingRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialBox: { ...cropBox },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const { mode, startX, startY, initialBox } = isDraggingRef.current;
    if (!mode || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - startX) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - startY) / rect.height) * 100;

    let { x, y, w, h } = initialBox;

    if (mode === 'move') {
      x = Math.max(0, Math.min(100 - w, initialBox.x + deltaXPercent));
      y = Math.max(0, Math.min(100 - h, initialBox.y + deltaYPercent));
    } else if (mode === 'se') {
      w = Math.max(15, Math.min(100 - x, initialBox.w + deltaXPercent));
      h = Math.max(15, Math.min(100 - y, initialBox.h + deltaYPercent));
    } else if (mode === 'nw') {
      const right = initialBox.x + initialBox.w;
      const bottom = initialBox.y + initialBox.h;
      x = Math.max(0, Math.min(right - 15, initialBox.x + deltaXPercent));
      y = Math.max(0, Math.min(bottom - 15, initialBox.y + deltaYPercent));
      w = right - x;
      h = bottom - y;
    } else if (mode === 'ne') {
      const bottom = initialBox.y + initialBox.h;
      w = Math.max(15, Math.min(100 - x, initialBox.w + deltaXPercent));
      y = Math.max(0, Math.min(bottom - 15, initialBox.y + deltaYPercent));
      h = bottom - y;
    } else if (mode === 'sw') {
      const right = initialBox.x + initialBox.w;
      x = Math.max(0, Math.min(right - 15, initialBox.x + deltaXPercent));
      w = right - x;
      h = Math.max(15, Math.min(100 - y, initialBox.h + deltaYPercent));
    }

    setCropBox({ x, y, w, h });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current.mode) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      isDraggingRef.current.mode = null;
    }
  };

  // Presets
  const applyPreset = (preset: 'docScanner' | 'bw' | 'sepia' | 'contrast' | 'reset') => {
    if (preset === 'docScanner') {
      // Document Scanner preset: cleans grayish background, high contrast text
      setFilters({
        brightness: 120,
        contrast: 175,
        grayscale: 100,
        blur: 0,
        saturation: 0,
      });
    } else if (preset === 'bw') {
      setFilters({
        brightness: 100,
        contrast: 125,
        grayscale: 100,
        blur: 0,
        saturation: 0,
      });
    } else if (preset === 'sepia') {
      setFilters({
        brightness: 95,
        contrast: 110,
        grayscale: 20,
        blur: 0,
        saturation: 140,
      });
    } else if (preset === 'contrast') {
      setFilters({
        brightness: 105,
        contrast: 150,
        grayscale: 0,
        blur: 0,
        saturation: 110,
      });
    } else {
      setFilters({
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        blur: 0,
        saturation: 100,
      });
    }
  };

  // Rotation controls
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleFlipH = () => setFlipH((prev) => !prev);
  const handleFlipV = () => setFlipV((prev) => !prev);

  // Save changes by baking the crop, rotation, and CSS filters into a final canvas
  const handleSave = async () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = image.originalSrc;
    });

    const isRotated90 = rotation % 180 !== 0;
    const baseW = isRotated90 ? img.naturalHeight : img.naturalWidth;
    const baseH = isRotated90 ? img.naturalWidth : img.naturalHeight;

    // Step 1: Draw rotated & flipped image onto intermediate canvas
    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = baseW;
    rotCanvas.height = baseH;
    const rotCtx = rotCanvas.getContext('2d')!;

    rotCtx.save();
    rotCtx.translate(baseW / 2, baseH / 2);
    rotCtx.rotate((rotation * Math.PI) / 180);
    rotCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    rotCtx.drawImage(
      img,
      -img.naturalWidth / 2,
      -img.naturalHeight / 2,
      img.naturalWidth,
      img.naturalHeight
    );
    rotCtx.restore();

    // Step 2: Crop box calculation in actual pixel dimensions
    const cropX = Math.round((cropBox.x / 100) * baseW);
    const cropY = Math.round((cropBox.y / 100) * baseH);
    const cropW = Math.max(10, Math.round((cropBox.w / 100) * baseW));
    const cropH = Math.max(10, Math.round((cropBox.h / 100) * baseH));

    // Step 3: Draw cropped region and apply filters
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = cropW;
    finalCanvas.height = cropH;
    const finalCtx = finalCanvas.getContext('2d')!;

    // Background white fill
    finalCtx.fillStyle = '#ffffff';
    finalCtx.fillRect(0, 0, cropW, cropH);

    // Apply Filter string
    finalCtx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;

    finalCtx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    const processedDataUrl = finalCanvas.toDataURL('image/jpeg', 0.92);
    const approxBytes = Math.round((processedDataUrl.length * 3) / 4);

    onSave({
      ...image,
      currentSrc: processedDataUrl,
      width: cropW,
      height: cropH,
      sizeBytes: approxBytes,
      rotation,
      flipH,
      flipV,
      filters: { ...filters },
    });

    onClose();
  };

  if (!isOpen) return null;

  const filterStyle = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) saturate(${filters.saturation}%) blur(${filters.blur}px)`;
  const transformStyle = `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {lang === 'bn' ? 'ছবি এডিটর ও স্ক্যানার' : 'Image Editor & Studio'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {image.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Canvas Preview Area */}
          <div className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
            <div
              ref={containerRef}
              className="relative max-w-full max-h-full flex items-center justify-center overflow-hidden"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* Image preview with dynamic CSS transformations */}
              <img
                src={image.originalSrc}
                alt="Source Preview"
                style={{
                  filter: filterStyle,
                  transform: transformStyle,
                }}
                className="max-w-full max-h-[50vh] md:max-h-[66vh] object-contain block transition-transform duration-150 pointer-events-none rounded shadow-md"
              />

              {/* Crop Overlay when crop tab is active */}
              {activeTab === 'crop' && (
                <div
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10 cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`,
                  }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                >
                  {/* Grid of thirds inside crop box */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-r border-b border-white/60"></div>
                    <div className="border-b border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div className="border-r border-white/60"></div>
                    <div></div>
                  </div>

                  {/* Corner Handles */}
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'nw')}
                    className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs cursor-nwse-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'ne')}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs cursor-nesw-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'sw')}
                    className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs cursor-nesw-resize"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDown(e, 'se')}
                    className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs cursor-nwse-resize"
                  />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Right Controls Panel */}
          <div className="w-full md:w-80 bg-white dark:bg-slate-900 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto shrink-0">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('crop')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'crop'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CropIcon className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ক্রপ ও রোটেশন' : 'Crop & Rotate'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('filters')}
                className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'filters'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'স্ক্যানার ও ফিল্টার' : 'Scanner & Filters'}</span>
              </button>
            </div>

            {/* TAB: CROP & ROTATE */}
            {activeTab === 'crop' && (
              <div className="space-y-4">
                {/* Aspect Ratio Presets */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'bn' ? 'অনুপাত (Aspect Ratio)' : 'Aspect Ratio'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-medium">
                    {(
                      [
                        { id: 'free', label: lang === 'bn' ? 'মুক্ত (Free)' : 'Free' },
                        { id: '1:1', label: '1:1 Square' },
                        { id: 'a4', label: 'A4 Page' },
                        { id: '4:3', label: '4:3 Standard' },
                        { id: '16:9', label: '16:9 Widescreen' },
                        { id: '3:2', label: '3:2 Photo' },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => applyAspectRatio(item.id)}
                        className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                          aspectRatio === item.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotate & Flip */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'bn' ? 'ঘুরানো ও ফ্লিপ (Rotate & Flip)' : 'Orientation'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      title={lang === 'bn' ? 'বামে ৯০°' : 'Rotate -90°'}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      title={lang === 'bn' ? 'ডানে ৯০°' : 'Rotate +90°'}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFlipH}
                      title={lang === 'bn' ? 'হরাইজন্টাল ফ্লিপ' : 'Flip Horizontal'}
                      className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${
                        flipH
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFlipV}
                      title={lang === 'bn' ? 'ভার্টিকাল ফ্লিপ' : 'Flip Vertical'}
                      className={`p-2 border rounded-lg transition-colors flex items-center justify-center ${
                        flipV
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FlipVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reset Crop */}
                <button
                  type="button"
                  onClick={() => {
                    setCropBox({ x: 0, y: 0, w: 100, h: 100 });
                    setAspectRatio('free');
                    setRotation(0);
                    setFlipH(false);
                    setFlipV(false);
                  }}
                  className="w-full py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ক্রপ রিসেট করুন' : 'Reset Crop Area'}</span>
                </button>
              </div>
            )}

            {/* TAB: FILTERS & ENHANCEMENTS */}
            {activeTab === 'filters' && (
              <div className="space-y-4">
                {/* Presets */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                    {lang === 'bn' ? 'প্রিসেট ইফেক্ট (Presets)' : 'Quick Presets'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => applyPreset('docScanner')}
                      className="p-2 border border-emerald-500/30 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-center hover:opacity-90 flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'ডকুমেন্ট স্ক্যানার' : 'Doc Scanner'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('bw')}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {lang === 'bn' ? 'ব্ল্যাক & হোয়াইট' : 'B&W Mono'}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('contrast')}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {lang === 'bn' ? 'হাই কনট্রাস্ট' : 'High Contrast'}
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('sepia')}
                      className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {lang === 'bn' ? 'সেপিয়া (Sepia)' : 'Warm Vintage'}
                    </button>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-1">
                  {/* Brightness */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{lang === 'bn' ? 'উজ্জ্বলতা (Brightness)' : 'Brightness'}</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {filters.brightness}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="200"
                      value={filters.brightness}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, brightness: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Contrast className="w-3.5 h-3.5 text-blue-500" />
                        <span>{lang === 'bn' ? 'কনট্রাস্ট (Contrast)' : 'Contrast'}</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {filters.contrast}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="250"
                      value={filters.contrast}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{lang === 'bn' ? 'গ্রে-স্কেল (Grayscale)' : 'Grayscale'}</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {filters.grayscale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.grayscale}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, grayscale: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Blur */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-cyan-500" />
                        <span>{lang === 'bn' ? 'ব্লার / স্মুথ (Blur)' : 'Blur Smooth'}</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {filters.blur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      step="0.5"
                      value={filters.blur}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, blur: Number(e.target.value) }))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                <button
                  type="button"
                  onClick={() => applyPreset('reset')}
                  className="w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 border border-red-200 dark:border-red-950/60 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'সব ফিল্টার রিসেট' : 'Reset All Filters'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Apply Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
