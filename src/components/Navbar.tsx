import React from 'react';
import { Moon, Sun, Globe, Trash2, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface Props {
  lang: Language;
  onToggleLang: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  hasImages: boolean;
  onClearAll: () => void;
  onLoadSamples: () => void;
}

export const Navbar: React.FC<Props> = ({
  lang,
  onToggleLang,
  isDark,
  onToggleTheme,
  hasImages,
  onClearAll,
  onLoadSamples,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-900 dark:text-white leading-none tracking-tight">
              Img2PDF Studio
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'bn' ? 'ছবি থেকে PDF কনভার্টার ও এডিটর' : 'Image to PDF Converter & Studio'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Utility Controls */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={onLoadSamples}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'bn' ? 'নমুনা ডকুমেন্ট লোড' : 'Load Sample Docs'}</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <a
            href="#editor-workspace"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 text-xs"
          >
            {lang === 'bn' ? 'ওয়ার্কস্পেস' : 'Workspace'}
          </a>
          <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
          <a
            href="#export-settings"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 text-xs"
          >
            {lang === 'bn' ? 'পিডিএফ সেটিংস' : 'PDF Settings'}
          </a>
        </nav>

        {/* Zone 3: Actions & Toggles */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sample quick button on mobile */}
          <button
            type="button"
            onClick={onLoadSamples}
            className="md:hidden p-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            title={lang === 'bn' ? 'নমুনা লোড' : 'Load Samples'}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
          </button>

          {/* Language toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            title="Toggle Language (English / বাংলা)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Clear all (if has images) */}
          {hasImages && (
            <button
              type="button"
              onClick={onClearAll}
              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'সব মুছুন' : 'Clear All'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
