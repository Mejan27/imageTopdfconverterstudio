import React from 'react';
import {
  FileDown,
  Eye,
  Sliders,
  Settings2,
  FileCheck,
  Check,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import { PDFSettings, Language, PageOrientation, PageSize, PageMargin, ImageFitMode, PageNumberStyle } from '../types';

interface Props {
  settings: PDFSettings;
  onChange: (updated: PDFSettings) => void;
  onGenerate: () => void;
  onPreview: () => void;
  isGenerating: boolean;
  imageCount: number;
  totalBytes: number;
  lang: Language;
}

export const PdfSettingsPanel: React.FC<Props> = ({
  settings,
  onChange,
  onGenerate,
  onPreview,
  isGenerating,
  imageCount,
  totalBytes,
  lang,
}) => {
  const update = <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  // Estimate final PDF size based on quality & total bytes
  const estimatedKb = Math.max(
    15,
    Math.round(((totalBytes * settings.quality * 0.75) / 1024) + imageCount * 2)
  );

  return (
    <div
      id="export-settings"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs sticky top-24 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
          <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{lang === 'bn' ? 'PDF সেটিংস (Export Settings)' : 'PDF Export Settings'}</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-400">
          {imageCount} {lang === 'bn' ? 'পেজ' : 'pg'}
        </span>
      </div>

      {/* Page Orientation */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'পেজ ওরিয়েন্টেশন (Orientation)' : 'Orientation'}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(
            [
              { id: 'auto', label: lang === 'bn' ? 'অটো' : 'Auto' },
              { id: 'portrait', label: lang === 'bn' ? 'পোর্ট্রেট (P)' : 'Portrait' },
              { id: 'landscape', label: lang === 'bn' ? 'ল্যান্ডস্কেপ (L)' : 'Landscape' },
            ] as { id: PageOrientation; label: string }[]
          ).map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => update('orientation', btn.id)}
              className={`py-2 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                settings.orientation === btn.id
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Size */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'পেজ সাইজ (Page Size)' : 'Page Size'}
        </label>
        <select
          value={settings.pageSize}
          onChange={(e) => update('pageSize', e.target.value as PageSize)}
          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="a4">{lang === 'bn' ? 'A4 (210 × 297 mm - স্ট্যান্ডার্ড)' : 'A4 Standard (210 × 297 mm)'}</option>
          <option value="letter">{lang === 'bn' ? 'US Letter (8.5 × 11 in)' : 'US Letter (8.5 × 11 in)'}</option>
          <option value="legal">{lang === 'bn' ? 'Legal (8.5 × 14 in)' : 'Legal (8.5 × 14 in)'}</option>
          <option value="fit">{lang === 'bn' ? 'ছবির মাপে ফিট (Fit Image / No Border)' : 'Fit to Image Dimensions (Border-free)'}</option>
        </select>
      </div>

      {/* Margins */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'মার্জিন (Margin)' : 'Page Margins'}
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {(
            [
              { id: 'none', label: lang === 'bn' ? '০ মিমি' : '0 mm' },
              { id: 'small', label: lang === 'bn' ? '৫ মিমি' : '5 mm' },
              { id: 'medium', label: lang === 'bn' ? '১২ মিমি' : '12 mm' },
              { id: 'large', label: lang === 'bn' ? '২০ মিমি' : '20 mm' },
            ] as { id: PageMargin; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => update('margin', m.id)}
              className={`py-1.5 px-1 text-xs font-medium rounded-xl border transition-all text-center ${
                settings.margin === m.id
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Fit */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'ইমেজ লেআউট (Image Fit)' : 'Image Fit Mode'}
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {(
            [
              { id: 'contain', label: lang === 'bn' ? 'কনটেইন (Fit)' : 'Contain' },
              { id: 'cover', label: lang === 'bn' ? 'ফুল ফিল (Cover)' : 'Full Cover' },
              { id: 'original', label: lang === 'bn' ? 'অরিজিনাল' : 'Original' },
            ] as { id: ImageFitMode; label: string }[]
          ).map((fit) => (
            <button
              key={fit.id}
              type="button"
              onClick={() => update('imageFit', fit.id)}
              className={`py-1.5 px-1 font-medium rounded-xl border transition-all text-center ${
                settings.imageFit === fit.id
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {fit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Numbers */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'পেজ নম্বর (Page Numbers)' : 'Page Numbering'}
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {(
            [
              { id: 'none', label: lang === 'bn' ? 'নাই' : 'None' },
              { id: 'bottom-center', label: lang === 'bn' ? 'নিচে মাঝে' : 'Btm Center' },
              { id: 'bottom-right', label: lang === 'bn' ? 'নিচে ডানে' : 'Btm Right' },
            ] as { id: PageNumberStyle; label: string }[]
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => update('pageNumbers', p.id)}
              className={`py-1.5 px-1 font-medium rounded-xl border transition-all text-center ${
                settings.pageNumbers === p.id
                  ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality / Compression Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {lang === 'bn' ? 'ছবির কোয়ালিটি (Quality)' : 'Image Quality / Compression'}
          </label>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {Math.round(settings.quality * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="30"
          max="100"
          value={Math.round(settings.quality * 100)}
          onChange={(e) => update('quality', Number(e.target.value) / 100)}
          className="w-full accent-emerald-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{lang === 'bn' ? 'কম সাইজ (Small Size)' : 'Smallest Size'}</span>
          <span>{lang === 'bn' ? 'ব্যালান্সড' : 'Balanced'}</span>
          <span>{lang === 'bn' ? 'উচ্চ রেজোলিউশন' : 'Max Sharpness'}</span>
        </div>
      </div>

      {/* File Name */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {lang === 'bn' ? 'ফাইল নাম (File Name)' : 'PDF File Name'}
        </label>
        <div className="relative">
          <input
            type="text"
            value={settings.fileName}
            onChange={(e) => update('fileName', e.target.value)}
            placeholder="converted_document"
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-12 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono font-semibold pointer-events-none">
            .pdf
          </span>
        </div>
      </div>

      {/* Estimated info box */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
            {lang === 'bn' ? 'আনুমানিক ফাইল সাইজ:' : 'Estimated PDF Size:'}
          </p>
          <p className="text-[10px] text-slate-400">
            {imageCount} {lang === 'bn' ? 'পেজ' : 'pages'} · {settings.pageSize.toUpperCase()}
          </p>
        </div>
        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs tabular-nums">
          ~{estimatedKb > 1024 ? `${(estimatedKb / 1024).toFixed(1)} MB` : `${estimatedKb} KB`}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        {/* Generate / Download PDF button */}
        <button
          type="button"
          disabled={imageCount === 0 || isGenerating}
          onClick={onGenerate}
          className={`w-full py-3 px-4 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm ${
            imageCount === 0 || isGenerating
              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer active:scale-[0.99]'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...'}</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              <span>{lang === 'bn' ? 'PDF ডাউনলোড করুন' : 'Download PDF'}</span>
            </>
          )}
        </button>

        {/* In-app Preview PDF button */}
        <button
          type="button"
          disabled={imageCount === 0 || isGenerating}
          onClick={onPreview}
          className={`w-full py-2 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
            imageCount === 0 || isGenerating
              ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>{lang === 'bn' ? 'পিডিএফ প্রিভিউ দেখুন' : 'Preview PDF in App'}</span>
        </button>
      </div>
    </div>
  );
};
