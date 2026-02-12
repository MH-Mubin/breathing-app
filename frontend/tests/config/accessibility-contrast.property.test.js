/**
 * Property-based test for accessibility contrast compliance
 * Feature: color-system-centralization
 * Property 4: Accessibility Contrast Compliance
 * Validates: Requirements 2.5, 5.1
 */

import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
const getRelativeLuminance = (r, g, b) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Convert hex color to RGB
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.0 formula: https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error(`Invalid hex color: ${color1} or ${color2}`);
  }
  
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Extract color values from Tailwind config
 */
const getColorPalette = () => {
  const tailwindConfigPath = join(process.cwd(), 'tailwind.config.js');
  const content = readFileSync(tailwindConfigPath, 'utf-8');
  
  // Parse colors from the config
  // This is a simplified parser - in production, you might want to use a proper JS parser
  const colors = {};
  
  // Extract primary colors
  const primaryMatch = content.match(/primary:\s*\{[^}]+DEFAULT:\s*['"]([^'"]+)['"]/);
  if (primaryMatch) colors.primary = primaryMatch[1];
  
  const primaryDarkMatch = content.match(/primary:\s*\{[^}]+dark:\s*['"]([^'"]+)['"]/);
  if (primaryDarkMatch) colors.primaryDark = primaryDarkMatch[1];
  
  const primaryLightMatch = content.match(/primary:\s*\{[^}]+light:\s*['"]([^'"]+)['"]/);
  if (primaryLightMatch) colors.primaryLight = primaryLightMatch[1];
  
  // Extract secondary
  const secondaryMatch = content.match(/secondary:\s*\{[^}]+DEFAULT:\s*['"]([^'"]+)['"]/);
  if (secondaryMatch) colors.secondary = secondaryMatch[1];
  
  // Extract accent
  const accentMatch = content.match(/accent:\s*\{[^}]+DEFAULT:\s*['"]([^'"]+)['"]/);
  if (accentMatch) colors.accent = accentMatch[1];
  
  // Extract neutrals
  const backgroundMatch = content.match(/background:\s*['"]([^'"]+)['"]/);
  if (backgroundMatch) colors.background = backgroundMatch[1];
  
  const surfaceMatch = content.match(/surface:\s*['"]([^'"]+)['"]/);
  if (surfaceMatch) colors.surface = surfaceMatch[1];
  
  const borderMatch = content.match(/border:\s*['"]([^'"]+)['"]/);
  if (borderMatch) colors.border = borderMatch[1];
  
  // Extract text colors
  const textPrimaryMatch = content.match(/text:\s*\{[^}]+primary:\s*['"]([^'"]+)['"]/);
  if (textPrimaryMatch) colors.textPrimary = textPrimaryMatch[1];
  
  const textSecondaryMatch = content.match(/text:\s*\{[^}]+secondary:\s*['"]([^'"]+)['"]/);
  if (textSecondaryMatch) colors.textSecondary = textSecondaryMatch[1];
  
  const mutedMatch = content.match(/muted:\s*['"]([^'"]+)['"]/);
  if (mutedMatch) colors.muted = mutedMatch[1];
  
  return colors;
};

describe('Property 4: Accessibility Contrast Compliance', () => {
  // Feature: color-system-centralization, Property 4: Accessibility Contrast Compliance
  // Validates: Requirements 2.5, 5.1

  const colors = getColorPalette();

  // WCAG AA standards
  const WCAG_AA_NORMAL_TEXT = 4.5; // Minimum contrast for normal text (< 18pt)
  const WCAG_AA_LARGE_TEXT = 3.0;  // Minimum contrast for large text (≥ 18pt or ≥ 14pt bold)

  // Define text/background combinations that should be tested
  const textBackgroundCombinations = [
    { text: 'textPrimary', background: 'background', minRatio: WCAG_AA_NORMAL_TEXT, description: 'text-primary on background' },
    { text: 'textPrimary', background: 'surface', minRatio: WCAG_AA_NORMAL_TEXT, description: 'text-primary on surface' },
    { text: 'textSecondary', background: 'background', minRatio: WCAG_AA_NORMAL_TEXT, description: 'text-secondary on background' },
    { text: 'textSecondary', background: 'surface', minRatio: WCAG_AA_NORMAL_TEXT, description: 'text-secondary on surface' },
    { text: 'primary', background: 'background', minRatio: WCAG_AA_NORMAL_TEXT, description: 'primary on background (for text usage)' },
    { text: 'background', background: 'primary', minRatio: WCAG_AA_NORMAL_TEXT, description: 'background on primary (inverse text)' },
  ];

  it('should have extracted color values from Tailwind config', () => {
    expect(colors.primary).toBeDefined();
    expect(colors.background).toBeDefined();
    expect(colors.textPrimary).toBeDefined();
  });

  it('should meet WCAG AA contrast requirements for all text/background combinations', () => {
    const violations = [];

    textBackgroundCombinations.forEach(({ text, background, minRatio, description }) => {
      const textColor = colors[text];
      const bgColor = colors[background];

      if (!textColor || !bgColor) {
        violations.push({
          description,
          error: `Missing color definition: ${text}=${textColor}, ${background}=${bgColor}`,
        });
        return;
      }

      try {
        const ratio = getContrastRatio(textColor, bgColor);
        
        if (ratio < minRatio) {
          violations.push({
            description,
            textColor,
            bgColor,
            ratio: ratio.toFixed(2),
            minRatio,
            passes: false,
          });
        }
      } catch (error) {
        violations.push({
          description,
          error: error.message,
        });
      }
    });

    if (violations.length > 0) {
      const violationReport = violations
        .map((v) => {
          if (v.error) {
            return `  ${v.description}: ${v.error}`;
          }
          return `  ${v.description}: ${v.ratio}:1 (required: ${v.minRatio}:1) - ${v.textColor} on ${v.bgColor}`;
        })
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} contrast ratio violation(s):\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  // Property-based test: For any text/background combination, contrast ratio should meet WCAG AA
  it('property test: all text/background combinations should meet WCAG AA standards', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...textBackgroundCombinations),
        (combination) => {
          const textColor = colors[combination.text];
          const bgColor = colors[combination.background];

          if (!textColor || !bgColor) {
            // Skip if colors are not defined
            return true;
          }

          const ratio = getContrastRatio(textColor, bgColor);
          return ratio >= combination.minRatio;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Verify specific color pairs from requirements
  it('should verify specific color pairs from requirements', () => {
    const requiredPairs = [
      { text: colors.textPrimary, bg: colors.background, name: 'text-primary (#0F172A) on background (#FFFFFF)' },
      { text: colors.textPrimary, bg: colors.surface, name: 'text-primary (#0F172A) on surface (#F8FAFC)' },
      { text: colors.textSecondary, bg: colors.background, name: 'text-secondary (#475569) on background (#FFFFFF)' },
      { text: colors.textSecondary, bg: colors.surface, name: 'text-secondary (#475569) on surface (#F8FAFC)' },
      { text: colors.primary, bg: colors.background, name: 'primary (#0EA5A4) on background (#FFFFFF)' },
      { text: colors.background, bg: colors.primary, name: 'background (#FFFFFF) on primary (#0EA5A4)' },
    ];

    requiredPairs.forEach((pair) => {
      if (!pair.text || !pair.bg) {
        return; // Skip if colors not defined
      }

      const ratio = getContrastRatio(pair.text, pair.bg);
      expect(ratio, `${pair.name} should have ratio ≥ 4.5:1, got ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  });

  // Test contrast calculation functions
  it('should correctly calculate contrast ratios for known color pairs', () => {
    // Black on white should be 21:1
    const blackWhiteRatio = getContrastRatio('#000000', '#FFFFFF');
    expect(blackWhiteRatio).toBeCloseTo(21, 0);

    // White on white should be 1:1
    const whiteWhiteRatio = getContrastRatio('#FFFFFF', '#FFFFFF');
    expect(whiteWhiteRatio).toBeCloseTo(1, 1);

    // Test should work regardless of order
    const ratio1 = getContrastRatio('#000000', '#FFFFFF');
    const ratio2 = getContrastRatio('#FFFFFF', '#000000');
    expect(ratio1).toBeCloseTo(ratio2, 2);
  });
});
