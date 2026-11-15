import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { ImageGrid } from './components/ImageGrid';
import { PdfSettingsPanel } from './components/PdfSettingsPanel';
import { ImageEditorModal } from './components/ImageEditorModal';
import { ImageViewModal } from './components/ImageViewModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { ToastContainer, ToastItem } from './components/Toast';
import { ImageItem, PDFSettings, Language } from './types';
import { generatePdf, loadImage } from './utils/pdfGenerator';
import { createSampleImages } from './utils/sampleImages';

export default function App() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('img2pdf_lang') as Language) || 'bn';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('img2pdf_theme');
    if (saved) return saved === 'dark';
    return true; // Default dark as requested in prototype
  });

  const [settings, setSettings] = useState<PDFSettings>({
    orientation: 'auto',
    pageSize: 'a4',
    margin: 'none',
    quality: 0.85,
    imageFit: 'contain',
    pageNumbers: 'none',
    fileName: 'converted_document',
    addTitleHeader: false,
  });

  const [editingImage, setEditingImage] = useState<ImageItem | null>(null);
  const [viewingImage, setViewingImage] = useState<ImageItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    url: string;
    fileName: string;
    pages: number;
    size: number;
  } | null>(null);

  // Sync theme to <html> tag
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('img2pdf_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('img2pdf_theme', 'light');
    }
  }, [isDark]);

  // Sync lang
  useEffect(() => {
    localStorage.setItem('img2pdf_lang', lang);
  }, [lang]);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load sample documents on demand
  const handleLoadSamples = async () => {
    try {
      const sampleList = await createSampleImages();
      setImages((prev) => [...prev, ...sampleList]);
      showToast(
        lang === 'bn' ? '৩টি নমুনা ডকুমেন্ট সফলভাবে যোগ করা হয়েছে!' : '3 sample documents loaded!',
        'success'
      );
    } catch {
      showToast(
        lang === 'bn' ? 'নমুনা লোড করতে সমস্যা হয়েছে' : 'Failed to load sample docs',
        'error'
      );
    }
  };

  // Process uploaded files
  const handleFilesSelected = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validImages = fileArray.filter((file) => file.type.startsWith('image/'));

    if (validImages.length === 0) {
      showToast(
        lang === 'bn' ? 'অনুগ্রহ করে সঠিক ছবি ফাইল নির্বাচন করুন' : 'Please select valid image files',
        'error'
      );
      return;
    }

    const loadedItems: ImageItem[] = [];

    for (const file of validImages) {
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const img = await loadImage(dataUrl);

        loadedItems.push({
          id: 'img_' + Math.random().toString(36).substring(2, 11),
          name: file.name,
          originalSrc: dataUrl,
          currentSrc: dataUrl,
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          sizeBytes: file.size,
          rotation: 0,
          flipH: false,
          flipV: false,
          filters: { brightness: 100, contrast: 100, grayscale: 0, blur: 0, saturation: 100 },
        });
      } catch (err) {
        console.error('Error loading image', err);
      }
    }

    if (loadedItems.length > 0) {
      setImages((prev) => [...prev, ...loadedItems]);
      showToast(
        lang === 'bn'
          ? `${loadedItems.length}টি ছবি যুক্ত করা হয়েছে!`
          : `Added ${loadedItems.length} image(s)!`,
        'success'
      );
    }
  };

  // Clear all images
  const handleClearAll = () => {
    if (images.length === 0) return;
    setImages([]);
    showToast(
      lang === 'bn' ? 'সব ছবি তালিকা থেকে মুছে ফেলা হয়েছে' : 'Cleared all document images',
      'info'
    );
  };

  // Image editing save
  const handleSaveEditedImage = (updated: ImageItem) => {
    setImages((prev) => prev.map((img) => (img.id === updated.id ? updated : img)));
    showToast(
      lang === 'bn' ? 'এডিট ও পরিবর্তন সেভ হয়েছে!' : 'Changes applied successfully!',
      'success'
    );
  };

  // Rotate single image 90 degrees
  const handleRotateOne = async (id: string) => {
    const target = images.find((i) => i.id === id);
    if (!target) return;

    try {
      const img = await loadImage(target.currentSrc);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext('2d')!;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      const rotatedUrl = canvas.toDataURL('image/jpeg', 0.92);

      setImages((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                currentSrc: rotatedUrl,
                width: canvas.width,
                height: canvas.height,
                rotation: (item.rotation + 90) % 360,
              }
            : item
        )
      );

      showToast(lang === 'bn' ? 'ছবি ৯০° ঘুরানো হয়েছে' : 'Rotated image 90°', 'info');
    } catch {
      showToast(lang === 'bn' ? 'ছবি ঘুরাতে সমস্যা হয়েছে' : 'Failed to rotate image', 'error');
    }
  };

  // Rotate all images 90 degrees
  const handleRotateAll = async () => {
    if (images.length === 0) return;

    try {
      const updatedList = await Promise.all(
        images.map(async (item) => {
          const img = await loadImage(item.currentSrc);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalHeight;
          canvas.height = img.naturalWidth;
          const ctx = canvas.getContext('2d')!;

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

          const rotatedUrl = canvas.toDataURL('image/jpeg', 0.92);

          return {
            ...item,
            currentSrc: rotatedUrl,
            width: canvas.width,
            height: canvas.height,
            rotation: (item.rotation + 90) % 360,
          };
        })
      );

      setImages(updatedList);
      showToast(
        lang === 'bn' ? 'সব ছবি ৯০° ঘুরানো হয়েছে' : 'Rotated all pages 90°',
        'success'
      );
    } catch {
      showToast(lang === 'bn' ? 'ছবি ঘুরাতে সমস্যা হয়েছে' : 'Failed to rotate all', 'error');
    }
  };

  // Sort by Name
  const handleSortByName = () => {
    const sorted = [...images].sort((a, b) => a.name.localeCompare(b.name));
    setImages(sorted);
    showToast(
      lang === 'bn' ? 'নাম অনুসারে সাজানো হয়েছে (A-Z)' : 'Sorted pages alphabetically (A-Z)',
      'info'
    );
  };

  // Reverse Order
  const handleReverseOrder = () => {
    setImages((prev) => [...prev].reverse());
    showToast(
      lang === 'bn' ? 'পেজের ক্রম উল্টানো হয়েছে' : 'Page order reversed',
      'info'
    );
  };

  // Remove single image
  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  // Generate & Download PDF
  const handleGeneratePdf = async () => {
    if (images.length === 0 || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generatePdf(images, settings);

      // Trigger Direct Download
      result.pdf.save(result.fileName);

      // Celebration Confetti
      try {
        confetti({
          particleCount: 65,
          spread: 70,
          origin: { y: 0.8 },
        });
      } catch {
        // ignore if confetti fails
      }

      showToast(
        lang === 'bn'
          ? `PDF "${result.fileName}" সফলভাবে ডাউনলোড হয়েছে!`
          : `PDF "${result.fileName}" downloaded successfully!`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast(
        lang === 'bn' ? 'পিডিএফ তৈরি করতে সমস্যা হয়েছে!' : 'Failed to generate PDF!',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Preview PDF in modal
  const handlePreviewPdf = async () => {
    if (images.length === 0 || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generatePdf(images, settings);
      setPdfPreviewData({
        url: result.blobUrl,
        fileName: result.fileName,
        pages: result.totalPages,
        size: result.fileSizeBytes,
      });
    } catch (err) {
      console.error(err);
      showToast(
        lang === 'bn' ? 'প্রিভিউ তৈরি করতে সমস্যা হয়েছে!' : 'Failed to build PDF preview!',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const totalBytes = images.reduce((sum, img) => sum + (img.sizeBytes || 0), 0);

  return (
  
    <div className="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-200">
{/* Advertisement Section */}
<div className="w-full max-w-[746px] mx-auto my-4 px-2">
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
    <p className="text-center text-[9px] text-slate-400 mb-2 tracking-wider">
      ADVERTISEMENT
    </p>

    <div
      id="adsterra-banner"
      className="w-full min-h-[90px] flex items-center justify-center bg-white overflow-hidden"
    >
      {/* Adsterra Banner Code Goes Here */}
    </div>
  </div>
</div>
      {/* Navbar */}
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        hasImages={images.length > 0}
        onClearAll={handleClearAll}
        onLoadSamples={handleLoadSamples}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        {/* Left Column: Upload & Image List */}
        <div id="editor-workspace" className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Upload Dropzone */}
          <Dropzone
            onFilesSelected={handleFilesSelected}
            onLoadSamples={handleLoadSamples}
            lang={lang}
          />

          {/* Grid of Images */}
          <ImageGrid
            images={images}
            onReorder={setImages}
            onEdit={(img) => setEditingImage(img)}
            onRemove={handleRemove}
            onRotateOne={handleRotateOne}
            onRotateAll={handleRotateAll}
            onSortByName={handleSortByName}
            onReverseOrder={handleReverseOrder}
            onLoadSamples={handleLoadSamples}
            onPreviewImage={(img) => setViewingImage(img)}
            lang={lang}
          />
        </div>

        {/* Right Column: Settings & Export Controls */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <PdfSettingsPanel
            settings={settings}
            onChange={setSettings}
            onGenerate={handleGeneratePdf}
            onPreview={handlePreviewPdf}
            isGenerating={isGenerating}
            imageCount={images.length}
            totalBytes={totalBytes}
            lang={lang}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {lang === 'bn'
              ? 'Img2PDF Studio · ১০০% ক্লায়েন্ট-সাইড নিরাপদ প্রসেসিং (আপনার ছবি কোনো সার্ভারে পাঠানো হয় না)'
              : 'Img2PDF Studio · 100% Client-Side Private Processing (Images never leave your browser)'}
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={handleLoadSamples}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {lang === 'bn' ? 'নমুনা ডকুমেন্ট' : 'Sample Docs'}
            </button>
            <span aria-hidden="true">·</span>
            <span>PDF 1.4+ Standard</span>
          </div>
        </div>
      </footer>

      {/* Image Editor Modal (Crop, Rotate, Filter, Scanner Presets) */}
      {editingImage && (
        <ImageEditorModal
          image={editingImage}
          isOpen={!!editingImage}
          onClose={() => setEditingImage(null)}
          onSave={handleSaveEditedImage}
          lang={lang}
        />
      )}

      {/* Full Image View Modal */}
      {viewingImage && (
        <ImageViewModal
          image={viewingImage}
          onClose={() => setViewingImage(null)}
          onEdit={(img) => {
            setViewingImage(null);
            setEditingImage(img);
          }}
          onRotate={handleRotateOne}
          onRemove={handleRemove}
          lang={lang}
        />
      )}

      {/* PDF In-App Preview Modal */}
      {pdfPreviewData && (
        <PdfPreviewModal
          isOpen={!!pdfPreviewData}
          onClose={() => setPdfPreviewData(null)}
          pdfUrl={pdfPreviewData.url}
          fileName={pdfPreviewData.fileName}
          totalPages={pdfPreviewData.pages}
          fileSizeBytes={pdfPreviewData.size}
          onDownload={() => {
            const a = document.createElement('a');
            a.href = pdfPreviewData.url;
            a.download = pdfPreviewData.fileName;
            a.click();
          }}
          lang={lang}
        />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
