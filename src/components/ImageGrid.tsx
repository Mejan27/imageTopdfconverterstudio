import React, { useState } from 'react';
import {
  Edit3,
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Images,
  ArrowDownUp,
  FileImage,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { ImageItem, Language } from '../types';

interface Props {
  images: ImageItem[];
  onReorder: (newImages: ImageItem[]) => void;
  onEdit: (image: ImageItem) => void;
  onRemove: (id: string) => void;
  onRotateOne: (id: string) => void;
  onRotateAll: () => void;
  onSortByName: () => void;
  onReverseOrder: () => void;
  onLoadSamples: () => void;
  onPreviewImage: (image: ImageItem) => void;
  lang: Language;
}

export const ImageGrid: React.FC<Props> = ({
  images,
  onReorder,
  onEdit,
  onRemove,
  onRotateOne,
  onRotateAll,
  onSortByName,
  onReverseOrder,
  onLoadSamples,
  onPreviewImage,
  lang,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Format bytes to KB / MB
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...images];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, moved);

    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onReorder(updated);
  };

  if (images.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
          <Images className="w-8 h-8 opacity-60" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
          {lang === 'bn' ? 'কোনো ছবি যুক্ত করা হয়নি' : 'No Images Added Yet'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-5">
          {lang === 'bn'
            ? 'উপরে ফাইল ড্রপ করুন বা ব্রাউজ করুন। অথবা সরাসরি নমুনা ডকুমেন্ট দিয়ে টেস্ট করুন।'
            : 'Drop images in the upload zone above, or test right away with pre-built sample documents.'}
        </p>
        <button
          type="button"
          onClick={onLoadSamples}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? '৩টি নমুনা ডকুমেন্ট লোড করুন' : 'Load 3 Sample Documents'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 flex flex-col shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {lang === 'bn' ? 'নির্বাচিত পেজসমূহ' : 'Selected Document Pages'}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            {lang === 'bn' ? `${images.length}টি পেজ` : `${images.length} Pages`}
          </span>
        </div>

        {/* Batch actions */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onSortByName}
            title={lang === 'bn' ? 'নাম অনুসারে সাজান' : 'Sort A-Z by Name'}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <ArrowDownUp className="w-3 h-3" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'A-Z সাজান' : 'Sort A-Z'}</span>
          </button>
          <button
            type="button"
            onClick={onReverseOrder}
            title={lang === 'bn' ? 'উল্টো ক্রম' : 'Reverse Order'}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span>{lang === 'bn' ? 'উল্টান' : 'Reverse'}</span>
          </button>
          <button
            type="button"
            onClick={onRotateAll}
            title={lang === 'bn' ? 'সব পেজ ৯০° ঘুরান' : 'Rotate all 90° clockwise'}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          >
            <RotateCw className="w-3 h-3" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'সব ঘুরান' : 'Rotate All'}</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-4">
        {images.map((item, index) => {
          const isBeingDragged = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              className={`group relative bg-slate-50 dark:bg-slate-800/80 rounded-xl border transition-all flex flex-col overflow-hidden select-none ${
                isOver
                  ? 'border-emerald-500 scale-[1.02] shadow-md ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'
              } ${isBeingDragged ? 'opacity-30' : 'opacity-100'}`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[3/4] bg-slate-900/5 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={item.currentSrc}
                  alt={item.name}
                  className="w-full h-full object-contain p-2 transition-transform duration-200 group-hover:scale-102"
                />

                {/* Page Number Indicator */}
                <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                  <span>{lang === 'bn' ? `পেজ ${index + 1}` : `P. ${index + 1}`}</span>
                </div>

                {/* Quick zoom preview button */}
                <button
                  type="button"
                  onClick={() => onPreviewImage(item)}
                  title={lang === 'bn' ? 'বড় করে দেখুন' : 'Full Preview'}
                  className="absolute top-2 right-2 w-7 h-7 rounded-md bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Overlay Action Buttons on Hover */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    title={lang === 'bn' ? 'এডিট ও ক্রপ করুন' : 'Edit, Crop & Enhance'}
                    className="w-8 h-8 rounded-full bg-white text-slate-800 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center shadow-lg"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRotateOne(item.id)}
                    title={lang === 'bn' ? '৯০° ঘুরান' : 'Rotate 90°'}
                    className="w-8 h-8 rounded-full bg-white text-slate-800 hover:bg-emerald-600 hover:text-white transition-colors flex items-center justify-center shadow-lg"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                    className="w-8 h-8 rounded-full bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Footer Details & Move controls */}
              <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-1">
                  <p
                    className="font-medium text-slate-800 dark:text-slate-200 truncate leading-snug"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                    {item.width}×{item.height} · {formatSize(item.sizeBytes)}
                  </p>
                </div>

                {/* Move arrows for precise sequential ordering */}
                <div className="flex items-center gap-0.5 shrink-0 text-slate-400">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'left')}
                    title={lang === 'bn' ? 'বামে সরান' : 'Move Left'}
                    className="p-1 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none rounded transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 'right')}
                    title={lang === 'bn' ? 'ডানে সরান' : 'Move Right'}
                    className="p-1 hover:text-slate-800 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none rounded transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
