import React from 'react';
import { X, Edit3, Trash2, RotateCw } from 'lucide-react';
import { ImageItem, Language } from '../types';

interface Props {
  image: ImageItem | null;
  onClose: () => void;
  onEdit: (image: ImageItem) => void;
  onRotate: (id: string) => void;
  onRemove: (id: string) => void;
  lang: Language;
}

export const ImageViewModal: React.FC<Props> = ({
  image,
  onClose,
  onEdit,
  onRotate,
  onRemove,
  lang,
}) => {
  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-md">
              {image.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {image.width} × {image.height} px · {Math.round(image.sizeBytes / 1024)} KB
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 bg-slate-950 p-4 flex items-center justify-center overflow-auto min-h-[300px]">
          <img
            src={image.currentSrc}
            alt={image.name}
            className="max-w-full max-h-[70vh] object-contain rounded"
          />
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(image);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'এডিটর ও ক্রপ' : 'Edit & Crop'}</span>
            </button>
            <button
              type="button"
              onClick={() => onRotate(image.id)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? '৯০° ঘুরান' : 'Rotate 90°'}</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              onRemove(image.id);
              onClose();
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
