export interface ImageFilters {
  brightness: number; // 30 - 200 (100 is default)
  contrast: number;   // 30 - 250 (100 is default)
  grayscale: number;  // 0 - 100 (0 is default)
  blur: number;       // 0 - 10 (0 is default)
  saturation: number; // 0 - 200 (100 is default)
}

export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageItem {
  id: string;
  name: string;
  originalSrc: string;
  currentSrc: string;
  width: number;
  height: number;
  sizeBytes: number;
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  filters: ImageFilters;
  crop?: ImageCrop;
}

export type PageOrientation = 'auto' | 'portrait' | 'landscape';
export type PageSize = 'a4' | 'letter' | 'legal' | 'fit';
export type PageMargin = 'none' | 'small' | 'medium' | 'large';
export type ImageFitMode = 'contain' | 'cover' | 'original';
export type PageNumberStyle = 'none' | 'bottom-center' | 'bottom-right' | 'top-right';

export interface PDFSettings {
  orientation: PageOrientation;
  pageSize: PageSize;
  margin: PageMargin;
  quality: number; // 0.3 - 1.0
  imageFit: ImageFitMode;
  pageNumbers: PageNumberStyle;
  fileName: string;
  addTitleHeader: boolean;
  docTitle?: string;
}

export type Language = 'bn' | 'en';
