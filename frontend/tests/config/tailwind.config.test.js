/**
 * Unit tests for Tailwind configuration structure
 * Validates that all required color and typography tokens are defined
 */

import { describe, expect, it } from 'vitest';
import tailwindConfig from '../../tailwind.config.js';

describe('Tailwind Configuration - Color Tokens', () => {
  const colors = tailwindConfig.theme.extend.colors;

  it('should define all required primary color tokens', () => {
    expect(colors.primary).toBeDefined();
    expect(colors.primary.DEFAULT).toBeDefined();
    expect(colors.primary.dark).toBeDefined();
    expect(colors.primary.light).toBeDefined();
  });

  it('should define secondary color token', () => {
    expect(colors.secondary).toBeDefined();
    expect(colors.secondary.DEFAULT).toBeDefined();
  });

  it('should define accent color token', () => {
    expect(colors.accent).toBeDefined();
    expect(colors.accent.DEFAULT).toBeDefined();
  });

  it('should define neutral color tokens', () => {
    expect(colors.background).toBeDefined();
    expect(colors.surface).toBeDefined();
    expect(colors.border).toBeDefined();
    expect(colors.muted).toBeDefined();
  });

  it('should define text color tokens', () => {
    expect(colors.text).toBeDefined();
    expect(colors.text.primary).toBeDefined();
    expect(colors.text.secondary).toBeDefined();
  });
});

describe('Tailwind Configuration - Color Values', () => {
  const colors = tailwindConfig.theme.extend.colors;

  // Helper function to validate hex color format
  const isValidHexColor = (color) => {
    return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(color);
  };

  it('should have valid hex color values for primary colors', () => {
    expect(isValidHexColor(colors.primary.DEFAULT)).toBe(true);
    expect(isValidHexColor(colors.primary.dark)).toBe(true);
    expect(isValidHexColor(colors.primary.light)).toBe(true);
  });

  it('should have valid hex color value for secondary', () => {
    expect(isValidHexColor(colors.secondary.DEFAULT)).toBe(true);
  });

  it('should have valid hex color value for accent', () => {
    expect(isValidHexColor(colors.accent.DEFAULT)).toBe(true);
  });

  it('should have valid hex color values for neutrals', () => {
    expect(isValidHexColor(colors.background)).toBe(true);
    expect(isValidHexColor(colors.surface)).toBe(true);
    expect(isValidHexColor(colors.border)).toBe(true);
    expect(isValidHexColor(colors.muted)).toBe(true);
  });

  it('should have valid hex color values for text colors', () => {
    expect(isValidHexColor(colors.text.primary)).toBe(true);
    expect(isValidHexColor(colors.text.secondary)).toBe(true);
  });
});

describe('Tailwind Configuration - Typography Tokens', () => {
  const fontFamily = tailwindConfig.theme.extend.fontFamily;

  it('should define heading font family token', () => {
    expect(fontFamily.heading).toBeDefined();
    expect(Array.isArray(fontFamily.heading)).toBe(true);
  });

  it('should define body font family token (sans)', () => {
    expect(fontFamily.sans).toBeDefined();
    expect(Array.isArray(fontFamily.sans)).toBe(true);
  });

  it('should have Poppins as heading font', () => {
    expect(fontFamily.heading).toContain('Poppins');
  });

  it('should have Nunito as body font', () => {
    expect(fontFamily.sans).toContain('Nunito');
  });

  it('should include fallback fonts', () => {
    expect(fontFamily.heading.length).toBeGreaterThan(1);
    expect(fontFamily.sans.length).toBeGreaterThan(1);
  });
});

describe('Tailwind Configuration - Semantic Token Completeness', () => {
  const colors = tailwindConfig.theme.extend.colors;

  it('should have all semantic tokens defined', () => {
    const requiredTokens = [
      'primary',
      'secondary',
      'accent',
      'background',
      'surface',
      'border',
      'text',
      'muted'
    ];

    requiredTokens.forEach(token => {
      expect(colors[token]).toBeDefined();
    });
  });

  it('should have primary variants defined', () => {
    const requiredVariants = ['DEFAULT', 'dark', 'light'];
    
    requiredVariants.forEach(variant => {
      expect(colors.primary[variant]).toBeDefined();
    });
  });

  it('should have text variants defined', () => {
    const requiredVariants = ['primary', 'secondary'];
    
    requiredVariants.forEach(variant => {
      expect(colors.text[variant]).toBeDefined();
    });
  });
});
