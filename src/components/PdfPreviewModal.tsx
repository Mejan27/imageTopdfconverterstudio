import React from 'react';
import { X, Download, ExternalLink, FileCheck } from 'lucide-react';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  fileName: string;
  totalPages: number;
  fileSizeBytes: number;
  onDownload: () => void;
  lang: Language;
}

export const PdfPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  pdfUrl,
  fileName,
  totalPages,
  fileSizeBytes,
  onDownload,
  lang,
}) => {
  if (!isOpen || !pdfUrl) return null;

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl h-[92vh] max-h-[900px] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">
                {lang === 'bn' ? 'পিডিএফ প্রিভিউ' : 'Generated PDF Preview'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {fileName} · {totalPages} {lang === 'bn' ? 'পেজ' : 'pages'} · {formatSize(fileSizeBytes)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              title="Open in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন ট্যাবে খুলুন' : 'Open in New Tab'}</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame */}
        <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title="PDF Preview Frame"
            className="w-full h-full rounded-lg border border-slate-800 bg-white"
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close Preview'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'bn' ? 'পিডিএফ সেভ করুন' : 'Download PDF Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
