import chroma from 'chroma-js';

/**
 * Generate a complete color palette from a single primary color
 * Creates 11 shades (50-950) suitable for UI design
 */
export function generateColorPalette(primaryColor) {
  try {
    const base = chroma(primaryColor);
    
    // Generate a scale from very light to very dark
    const palette = {
      50: base.brighten(2.8).hex(),
      100: base.brighten(2.2).hex(),
      200: base.brighten(1.6).hex(),
      300: base.brighten(1).hex(),
      400: base.brighten(0.4).hex(),
      500: base.hex(), // Original color
      600: base.darken(0.5).hex(),
      700: base.darken(1).hex(),
      800: base.darken(1.6).hex(),
      900: base.darken(2.2).hex(),
      950: base.darken(2.8).hex(),
    };
    
    return palette;
  } catch (error) {
    console.error('Error generating color palette:', error);
    // Return default blue palette if error
    return {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    };
  }
}

/**
 * Apply color palette to CSS custom properties
 */
export function applyColorPalette(primaryColor) {
  const palette = generateColorPalette(primaryColor);
  const root = document.documentElement;
  
  Object.entries(palette).forEach(([shade, color]) => {
    root.style.setProperty(`--primary-${shade}`, color);
  });
}

/**
 * Get readable text color (black or white) for a given background
 */
export function getContrastColor(backgroundColor) {
  try {
    const color = chroma(backgroundColor);
    return color.luminance() > 0.5 ? '#000000' : '#FFFFFF';
  } catch (error) {
    return '#000000';
  }
}

/**
 * Validate if a string is a valid hex color
 */
export function isValidHexColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Generate complementary colors for data visualization
 */
export function generateChartColors(primaryColor, count = 6) {
  try {
    const base = chroma(primaryColor);
    return chroma
      .scale([
        base.brighten(1),
        base,
        base.darken(1),
      ])
      .mode('lch')
      .colors(count);
  } catch (error) {
    // Default color scale
    return ['#93c5fd', '#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'].slice(0, count);
  }
}

