/**
 * Utility helper functions for Map Remix
 */

/**
 * Deep clone an object (simple implementation for style objects)
 * @param {Object} obj - Object to clone
 * @returns {Object} Deep cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * Check if a color string is valid hex format
 * @param {string} color - Color string to validate
 * @returns {boolean} True if valid hex color
 */
export function isValidHexColor(color) {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

/**
 * Convert RGB to hex color
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color string
 */
export function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Get a contrasting text color (black or white) for a given background color
 * @param {string} backgroundColor - Hex color string
 * @returns {string} '#000000' or '#ffffff'
 */
export function getContrastingColor(backgroundColor) {
  // Remove # if present
  const hex = backgroundColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Generate a unique ID for DOM elements
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID string
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a number for display (remove unnecessary decimals)
 * @param {number} value - Number to format
 * @param {number} maxDecimals - Maximum decimal places
 * @returns {string} Formatted number string
 */
export function formatNumber(value, maxDecimals = 2) {
  const rounded = Math.round(value * Math.pow(10, maxDecimals)) / Math.pow(10, maxDecimals);
  return rounded.toString();
}

/**
 * Check if browser supports a specific feature
 * @param {string} feature - Feature to check ('webgl', 'colorInput', 'serviceWorker')
 * @returns {boolean} True if feature is supported
 */
export function supportsFeature(feature) {
  switch (feature) {
    case 'webgl':
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    
    case 'webgl2':
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch (e) {
        return false;
      }
    
    case 'colorInput':
      const input = document.createElement('input');
      input.type = 'color';
      return input.type === 'color';
    
    case 'serviceWorker':
      return 'serviceWorker' in navigator;
    
    default:
      return false;
  }
}

/**
 * Create a download link for a blob
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename for download
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}