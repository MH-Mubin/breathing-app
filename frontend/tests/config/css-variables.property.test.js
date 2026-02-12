/**
 * Property-based test for CSS variable theme references
 * Feature: color-system-centralization, Property 5: CSS Variable Theme Reference
 * Validates: Requirements 3.3
 * 
 * This test verifies that all CSS variable definitions use the Tailwind theme() function
 * rather than hardcoded color values.
 */

import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';

describe('Property 5: CSS Variable Theme Reference', () => {
  // Read the index.css file
  const cssFilePath = join(process.cwd(), 'src', 'index.css');
  const cssContent = readFileSync(cssFilePath, 'utf-8');

  // Extract CSS variable definitions from :root block
  const extractCSSVariables = (content) => {
    const variables = [];
    
    // Match :root block or @layer base :root block
    const rootBlockRegex = /(?:@layer\s+base\s*{)?\s*:root\s*{([^}]*)}/gs;
    const matches = [...content.matchAll(rootBlockRegex)];
    
    if (matches.length === 0) {
      return variables;
    }

    // Get the content inside :root
    const rootContent = matches[0][1];
    
    // Match CSS variable definitions: --variable-name: value;
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let match;
    
    while ((match = varRegex.exec(rootContent)) !== null) {
      const varName = match[1];
      const varValue = match[2].trim();
      variables.push({ name: varName, value: varValue });
    }
    
    return variables;
  };

  // Check if a value is a hardcoded color (hex, rgb, rgba, hsl, hsla)
  const isHardcodedColor = (value) => {
    // Hex colors: #fff, #ffffff, #FFFFFF
    const hexPattern = /#[0-9A-Fa-f]{3,6}\b/;
    
    // RGB/RGBA colors: rgb(255, 255, 255), rgba(255, 255, 255, 0.5)
    const rgbPattern = /rgba?\s*\([^)]+\)/;
    
    // HSL/HSLA colors: hsl(0, 0%, 100%), hsla(0, 0%, 100%, 0.5)
    const hslPattern = /hsla?\s*\([^)]+\)/;
    
    return hexPattern.test(value) || rgbPattern.test(value) || hslPattern.test(value);
  };

  // Check if a value uses theme() function
  const usesThemeFunction = (value) => {
    return /theme\s*\([^)]+\)/.test(value);
  };

  it('should extract CSS variables from index.css', () => {
    const variables = extractCSSVariables(cssContent);
    expect(variables.length).toBeGreaterThan(0);
  });

  it('should use theme() function for all color-related CSS variables', () => {
    const variables = extractCSSVariables(cssContent);
    
    // Filter to color-related variables (exclude non-color variables like shadows, dimensions)
    const colorVariables = variables.filter(v => {
      const name = v.name.toLowerCase();
      return (
        name.includes('color') ||
        name.includes('primary') ||
        name.includes('secondary') ||
        name.includes('accent') ||
        name.includes('background') ||
        name.includes('bg') ||
        name.includes('surface') ||
        name.includes('border') ||
        name.includes('text') ||
        name.includes('muted')
      );
    });

    expect(colorVariables.length).toBeGreaterThan(0);

    // Check each color variable
    colorVariables.forEach(variable => {
      const { name, value } = variable;
      
      // If the value is a hardcoded color, it should use theme() function
      if (isHardcodedColor(value)) {
        expect(
          usesThemeFunction(value),
          `CSS variable --${name} has hardcoded color value "${value}" without using theme() function`
        ).toBe(true);
      }
    });
  });

  // Property-based test: For any CSS variable that contains a color value,
  // it should reference the Tailwind theme
  it('property test: all color CSS variables should reference Tailwind theme', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...extractCSSVariables(cssContent)),
        (variable) => {
          const { name, value } = variable;
          
          // Skip non-color variables
          const isColorVariable = 
            name.includes('color') ||
            name.includes('primary') ||
            name.includes('secondary') ||
            name.includes('accent') ||
            name.includes('background') ||
            name.includes('bg') ||
            name.includes('surface') ||
            name.includes('border') ||
            name.includes('text') ||
            name.includes('muted');
          
          if (!isColorVariable) {
            return true; // Skip non-color variables
          }

          // If it's a color variable with a hardcoded color value,
          // it must use theme() function
          if (isHardcodedColor(value) && !usesThemeFunction(value)) {
            return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have all new color variables using theme() function', () => {
    const variables = extractCSSVariables(cssContent);
    
    // Check specific new color variables that should use theme()
    const expectedThemeVariables = [
      'color-primary',
      'color-primary-dark',
      'color-primary-light',
      'color-secondary',
      'color-accent',
      'color-background',
      'color-surface',
      'color-border',
      'color-text-primary',
      'color-text-secondary',
      'color-muted'
    ];

    expectedThemeVariables.forEach(expectedVar => {
      const variable = variables.find(v => v.name === expectedVar);
      
      if (variable) {
        expect(
          usesThemeFunction(variable.value),
          `CSS variable --${expectedVar} should use theme() function, but has value: ${variable.value}`
        ).toBe(true);
      }
    });
  });

  it('should have typography variables using theme() function', () => {
    const variables = extractCSSVariables(cssContent);
    
    const typographyVariables = variables.filter(v => 
      v.name.includes('font')
    );

    typographyVariables.forEach(variable => {
      const { name, value } = variable;
      
      // Typography variables should use theme() function
      expect(
        usesThemeFunction(value),
        `Typography variable --${name} should use theme() function, but has value: ${value}`
      ).toBe(true);
    });
  });

  it('property test: no CSS variable should have direct hex color without theme()', () => {
    const variables = extractCSSVariables(cssContent);
    
    fc.assert(
      fc.property(
        fc.constantFrom(...variables),
        (variable) => {
          const { name, value } = variable;
          
          // Check if value contains a hex color
          const hexPattern = /#[0-9A-Fa-f]{6}\b/;
          const hasHexColor = hexPattern.test(value);
          
          if (hasHexColor) {
            // If it has a hex color, it should be wrapped in theme()
            return usesThemeFunction(value);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
