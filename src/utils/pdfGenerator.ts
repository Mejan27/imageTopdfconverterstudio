import { jsPDF } from 'jspdf';
import { ImageItem, PDFSettings } from '../types';

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Pre-processes an image to apply target compression quality and dimensions.
 */
async function compressImageToJpeg(src: string, quality: number): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d')!;

  // Fill white background in case image has transparency (PNG/WEBP to JPEG)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  const compressedDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.2, Math.min(1.0, quality)));
  return {
    dataUrl: compressedDataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  blobUrl: string;
  totalPages: number;
  fileName: string;
  fileSizeBytes: number;
}

export async function generatePdf(
  images: ImageItem[],
  settings: PDFSettings,
  onProgress?: (current: number, total: number) => void
): Promise<GeneratePdfResult> {
  if (images.length === 0) {
    throw new Error('No images provided for PDF generation');
  }

  let pdf: jsPDF | null = null;
  const total = images.length;

  // Margin values in mm
  let marginMm = 0;
  if (settings.margin === 'small') marginMm = 5;
  else if (settings.margin === 'medium') marginMm = 12;
  else if (settings.margin === 'large') marginMm = 20;

  for (let i = 0; i < total; i++) {
    if (onProgress) {
      onProgress(i + 1, total);
    }

    const item = images[i];
    const { dataUrl, width: imgW, height: imgH } = await compressImageToJpeg(item.currentSrc, settings.quality);
    const imgRatio = imgW / imgH;

    // Determine Orientation
    let orientation: 'p' | 'l' = 'p';
    if (settings.orientation === 'landscape') {
      orientation = 'l';
    } else if (settings.orientation === 'portrait') {
      orientation = 'p';
    } else {
      // Auto: based on aspect ratio
      orientation = imgRatio >= 1.05 ? 'l' : 'p';
    }

    // Determine Page Width and Height in mm
    let pageWidthMm = 210;
    let pageHeightMm = 297;

    if (settings.pageSize === 'fit') {
      // 96 DPI: 1 inch = 25.4 mm; 1 px = 25.4 / 96 ≈ 0.264583 mm
      const pxToMm = 0.264583;
      pageWidthMm = Math.max(50, Math.round(imgW * pxToMm));
      pageHeightMm = Math.max(50, Math.round(imgH * pxToMm));
      orientation = pageWidthMm > pageHeightMm ? 'l' : 'p';
    } else if (settings.pageSize === 'letter') {
      pageWidthMm = orientation === 'p' ? 215.9 : 279.4;
      pageHeightMm = orientation === 'p' ? 279.4 : 215.9;
    } else if (settings.pageSize === 'legal') {
      pageWidthMm = orientation === 'p' ? 215.9 : 355.6;
      pageHeightMm = orientation === 'p' ? 355.6 : 215.9;
    } else {
      // A4 default
      pageWidthMm = orientation === 'p' ? 210 : 297;
      pageHeightMm = orientation === 'p' ? 297 : 210;
    }

    const pageFormat: [number, number] | string =
      settings.pageSize === 'fit' ? [pageWidthMm, pageHeightMm] : settings.pageSize;

    // Initialize or add page
    if (i === 0) {
      pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageFormat,
        compress: true,
      });
    } else {
      pdf!.addPage(pageFormat, orientation);
    }

    // Usable printable area
    const printW = Math.max(10, pageWidthMm - marginMm * 2);
    const printH = Math.max(10, pageHeightMm - marginMm * 2);

    let drawW = printW;
    let drawH = printW / imgRatio;
    let xPos = marginMm;
    let yPos = marginMm;

    if (settings.imageFit === 'contain') {
      if (drawH > printH) {
        drawH = printH;
        drawW = printH * imgRatio;
      }
      xPos = marginMm + (printW - drawW) / 2;
      yPos = marginMm + (printH - drawH) / 2;
    } else if (settings.imageFit === 'cover') {
      if (drawH < printH) {
        drawH = printH;
        drawW = printH * imgRatio;
      }
      xPos = marginMm + (printW - drawW) / 2;
      yPos = marginMm + (printH - drawH) / 2;
    } else {
      // Original / natural sizing (fit within print area)
      const naturalWMm = imgW * 0.264583;
      const naturalHMm = imgH * 0.264583;
      if (naturalWMm <= printW && naturalHMm <= printH) {
        drawW = naturalWMm;
        drawH = naturalHMm;
      } else {
        if (drawH > printH) {
          drawH = printH;
          drawW = printH * imgRatio;
        }
      }
      xPos = marginMm + (printW - drawW) / 2;
      yPos = marginMm + (printH - drawH) / 2;
    }

    // Add Image to PDF Page
    pdf!.addImage(dataUrl, 'JPEG', xPos, yPos, drawW, drawH, undefined, 'FAST');

    // Page Numbering
    if (settings.pageNumbers && settings.pageNumbers !== 'none') {
      const pageStr = `${i + 1} / ${total}`;
      pdf!.setFont('helvetica', 'normal');
      pdf!.setFontSize(9);
      pdf!.setTextColor(140, 140, 140);

      const marginOffset = Math.max(marginMm, 6);
      if (settings.pageNumbers === 'bottom-center') {
        pdf!.text(pageStr, pageWidthMm / 2, pageHeightMm - Math.max(4, marginOffset / 2), { align: 'center' });
      } else if (settings.pageNumbers === 'bottom-right') {
        pdf!.text(pageStr, pageWidthMm - marginOffset, pageHeightMm - Math.max(4, marginOffset / 2), { align: 'right' });
      } else if (settings.pageNumbers === 'top-right') {
        pdf!.text(pageStr, pageWidthMm - marginOffset, Math.max(6, marginOffset), { align: 'right' });
      }
    }
  }

  if (!pdf) {
    throw new Error('Failed to generate PDF');
  }

  const rawName = settings.fileName?.trim() || 'Img2PDF_document';
  const cleanName = rawName.replace(/\.pdf$/i, '') + '.pdf';

  const blob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  return {
    pdf,
    blob,
    blobUrl,
    totalPages: total,
    fileName: cleanName,
    fileSizeBytes: blob.size,
  };
}
