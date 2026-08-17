import { toPng, toJpeg, toBlob } from 'html-to-image';

export interface ExportOptions {
  format: 'png' | 'jpeg';
  scale?: number; // 2 (Retina 1080p), 3 (Ultra-HD 1440p), 4 (4K / 300 DPI)
  quality?: number; // for jpeg: 0.85 to 1.0
  fileName?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
}

const FALLBACK_IMG_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="%23ec4899" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/><path d="M3 12h18"/></svg>';

/**
 * Downloads a DOM element as an ultra-crisp high-resolution PNG or JPG image.
 * Safely handles full element height, all items, and unclipped screen dimensions.
 */
export async function exportElementAsImage(
  element: HTMLElement,
  options: ExportOptions
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  try {
    const {
      format = 'png',
      scale = 3,
      quality = 0.98,
      fileName = 'wishlist-export',
      backgroundColor
    } = options;

    // Ensure all web fonts are loaded prior to rasterization
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    // Measure true dimensions so nothing gets cut off and card is perfectly centered
    const scrollHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
    const targetWidth = element.offsetWidth || element.clientWidth || element.scrollWidth;

    // Configuration for maximum sharpness, proper font rendering, and complete unclipped height
    const config = {
      pixelRatio: Math.max(1, Math.min(scale, 4)),
      quality: format === 'jpeg' ? quality : undefined,
      backgroundColor: backgroundColor || (format === 'jpeg' ? '#0f172a' : undefined),
      cacheBust: true,
      skipAutoScale: true,
      imagePlaceholder: FALLBACK_IMG_PLACEHOLDER,
      width: targetWidth > 0 ? targetWidth : undefined,
      height: scrollHeight > 0 ? scrollHeight : undefined,
      style: {
        transform: 'none',
        margin: '0 auto',
        height: 'auto',
        minHeight: `${scrollHeight}px`,
        maxHeight: 'none',
        overflow: 'visible',
      },
      filter: (node: HTMLElement) => {
        // Exclude interactive export UI controls from being captured on the downloaded image
        if (node.classList && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    };

    let dataUrl: string;

    try {
      if (format === 'jpeg') {
        dataUrl = await toJpeg(element, config);
      } else {
        dataUrl = await toPng(element, config);
      }
    } catch (primaryErr: any) {
      console.warn('Primary export attempt encountered notice, retrying with safe fallback:', primaryErr?.message);
      // Secondary attempt with relaxed cache & placeholder settings
      if (format === 'jpeg') {
        dataUrl = await toJpeg(element, { ...config, cacheBust: false });
      } else {
        dataUrl = await toPng(element, { ...config, cacheBust: false });
      }
    }

    // Trigger download
    const link = document.createElement('a');
    const ext = format === 'jpeg' ? 'jpg' : 'png';
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    link.download = `${sanitizedName}_${scale}x.${ext}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true, dataUrl };
  } catch (err: any) {
    console.error('Error exporting wishlist image:', err);
    return { success: false, error: err?.message || 'Failed to export image' };
  }
}

/**
 * Copies the DOM element as a high-res PNG directly to the user's system clipboard.
 */
export async function copyElementToClipboard(
  element: HTMLElement,
  scale: number = 3
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      throw new Error('Clipboard image copy is not supported in this browser environment.');
    }

    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const scrollHeight = Math.max(element.scrollHeight, element.offsetHeight, element.clientHeight);
    const targetWidth = element.offsetWidth || element.clientWidth || element.scrollWidth;

    const blob = await toBlob(element, {
      pixelRatio: Math.max(1, Math.min(scale, 4)),
      cacheBust: true,
      skipAutoScale: true,
      imagePlaceholder: FALLBACK_IMG_PLACEHOLDER,
      width: targetWidth > 0 ? targetWidth : undefined,
      height: scrollHeight > 0 ? scrollHeight : undefined,
      style: {
        transform: 'none',
        margin: '0 auto',
        height: 'auto',
        minHeight: `${scrollHeight}px`,
        maxHeight: 'none',
        overflow: 'visible',
      },
      filter: (node: HTMLElement) => {
        if (node.classList && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    });

    if (!blob) {
      throw new Error('Failed to generate image blob.');
    }

    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);

    return { success: true };
  } catch (err: any) {
    console.error('Error copying image to clipboard:', err);
    return { success: false, error: err?.message || 'Failed to copy image to clipboard' };
  }
}
