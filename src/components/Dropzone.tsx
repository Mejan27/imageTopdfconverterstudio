import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Plus } from 'lucide-react';
import { Language } from '../types';

interface Props {
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
  lang: Language;
}

export const Dropzone: React.FC<Props> = ({ onFilesSelected, onLoadSamples, lang }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste support from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        onFilesSelected(imageFiles);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesSelected]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 group relative overflow-hidden ${
        isDragOver
          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
            e.target.value = '';
          }
        }}
      />

      <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
            {lang === 'bn' ? (
              <>
                এখানে ছবি ড্রপ করুন অথবা{' '}
                <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 font-bold">
                  ব্রাউজ করুন
                </span>
              </>
            ) : (
              <>
                Drag & drop images here, or{' '}
                <span className="text-emerald-600 dark:text-emerald-400 underline underline-offset-4 font-bold">
                  Browse Files
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {lang === 'bn'
              ? 'JPG, PNG, WEBP, GIF সমর্থিত · একাধিক ছবি একসাথে নির্বাচন করতে পারবেন · Ctrl+V দিয়ে পেস্ট করতে পারবেন'
              : 'JPG, PNG, WEBP, GIF supported · Select multiple images at once · Paste with Ctrl+V'}
          </p>
        </div>

        {/* Action button inside dropzone */}
        <div className="pt-2 flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLoadSamples();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'bn' ? 'নমুনা দিয়ে পরীক্ষা করুন' : 'Try with Sample Docs'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
