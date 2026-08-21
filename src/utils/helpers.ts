/**
 * ============================================================================
 * HELPER UTILITIES
 * ============================================================================
 * Helper functions for image compression, date parsing, zodiac signs, and clipboard operations.
 */

// Birthday countdown helper
  export const getBirthdayCountdown = (
    dateOfBirth: string,
    currentTime: Date
  ) => {
    const birthDate = new Date(dateOfBirth);

    const today = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    );

    let nextBirthday = new Date(
      currentTime.getFullYear(),
      birthDate.getMonth(),
      birthDate.getDate()
    );

    const isToday =
      today.getMonth() === birthDate.getMonth() &&
      today.getDate() === birthDate.getDate();

    if (!isToday && nextBirthday < today) {
      nextBirthday.setFullYear(currentTime.getFullYear() + 1);
    }

    const diffTime = nextBirthday.getTime() - currentTime.getTime();

    const diffDays = Math.floor(
      diffTime / (1000 * 60 * 60 * 24)
    );

    const diffHours = Math.floor(
      (diffTime / (1000 * 60 * 60)) % 24
    );

    const diffMinutes = Math.floor(
      (diffTime / (1000 * 60)) % 60
    );

    const diffSeconds = Math.floor(
      (diffTime / 1000) % 60
    );

    return {
      diffDays,
      diffHours,
      diffMinutes,
      diffSeconds,
      isToday,
    };
  };

// Image downscaling / compression utility to fit in standard URL limits
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 140;
        const MAX_HEIGHT = 140;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // Lower quality JPEG to save URL length
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.55);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// Compression for slideshow images
export const compressSlideshowImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 480;
        const MAX_HEIGHT = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// Relationship label formatting
export const getRelationshipLabel = (rel?: string): string => {
  if (!rel) return '';
  const r = rel.toLowerCase();
  if (r === 'friend') return 'Friend';
  if (r === 'bestie') return 'Bestie';
  if (r === 'partner' || r === 'love' || r === 'lover') return 'Love';
  if (r === 'family' || r === 'bro' || r === 'sis') return 'Family';
  if (r === 'colleague') return 'Colleague';
  return r.charAt(0).toUpperCase() + r.slice(1);
};

// Extract birth month string from YYYY-MM-DD
export const getBirthMonth = (dobString?: string): string => {
  if (!dobString) return '';
  try {
    const parts = dobString.split('-');
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      if (monthIdx >= 0 && monthIdx < 12) {
        return monthNames[monthIdx];
      }
    }
    const date = new Date(dobString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('en-US', { month: 'long' });
  } catch {
    return '';
  }
};

// Calculate Zodiac sign and astrological symbol from YYYY-MM-DD
export const getZodiacSign = (dobString?: string): { name: string; symbol: string } | null => {
  if (!dobString) return null;
  try {
    const parts = dobString.split('-');
    let month = 0;
    let day = 0;
    if (parts.length >= 3) {
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      const date = new Date(dobString);
      if (isNaN(date.getTime())) return null;
      month = date.getMonth() + 1;
      day = date.getDate();
    }

    if (!month || !day) return null;

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'Aries', symbol: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'Taurus', symbol: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'Gemini', symbol: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'Cancer', symbol: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'Leo', symbol: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'Libra', symbol: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'Scorpio', symbol: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'Sagittarius', symbol: '♐' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'Capricorn', symbol: '♑' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'Aquarius', symbol: '♒' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'Pisces', symbol: '♓' };

    return null;
  } catch {
    return null;
  }
};

// Clipboard copy fallback handler
export const isImageUrl = (str?: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:')) return true;
  if (s.startsWith('/') || s.includes('/') || s.includes('.') || s.includes('storage') || s.includes('profile-')) {
    // Make sure it's not a short emoji string or simple text without slash/extension
    if (s.length > 3) return true;
  }
  return false;
};

export const resolveImageUrl = (str?: string, defaultFallback: string = '🎂'): string => {
  if (!str || typeof str !== 'string') return defaultFallback;
  const s = str.trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:') || s.startsWith('blob:')) {
    return s;
  }
  if (s.startsWith('/')) {
    return s;
  }
  // If it's a Supabase storage path or relative path
  if (s.includes('/') || s.includes('.')) {
    const cleanPath = s.replace(/^\/+/, '');
    return `https://n6powmbu2wxskm6as33bni.supabase.co/storage/v1/object/public/${cleanPath}`;
  }
  return s;
};

export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch (err) {
    console.error('Copy to clipboard failed:', err);
    return false;
  }
};
