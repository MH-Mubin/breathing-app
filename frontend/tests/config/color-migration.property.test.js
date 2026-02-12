/**
 * Property-based tests for color system migration validation
 * Feature: color-system-centralization
 * 
 * This file contains three property tests:
 * - Property 1: Orange Color Elimination
 * - Property 2: Hex Color Centralization
 * - Property 3: Font Family Centralization
 */

import * as fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { describe, expect, it } from 'vitest';

/**
 * Recursively get all files in a directory
 */
const getAllFiles = (dirPath, arrayOfFiles = []) => {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    
    if (statSync(filePath).isDirectory()) {
      // Skip node_modules, .git, dist, build, tests directories
      if (!['node_modules', '.git', 'dist', 'build', '.kiro', 'tests'].includes(file)) {
        arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
      }
    } else {
      // Only include source files (js, jsx, ts, tsx, css, html)
      // Exclude test files
      if (/\.(jsx?|tsx?|css|html)$/.test(file) && !/\.test\.(jsx?|tsx?)$/.test(file)) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
};

/**
 * Get all source files from frontend and backend
 */
const getSourceFiles = () => {
  const frontendFiles = getAllFiles(join(process.cwd(), 'src'));
  
  // Try to get backend files if they exist
  let backendFiles = [];
  try {
    const backendPath = join(process.cwd(), '..', 'backend');
    if (statSync(backendPath).isDirectory()) {
      backendFiles = getAllFiles(backendPath);
    }
  } catch (error) {
    // Backend directory doesn't exist or not accessible, skip it
  }

  return [...frontendFiles, ...backendFiles];
};

describe('Property 1: Orange Color Elimination', () => {
  // Feature: color-system-centralization, Property 1: Orange Color Elimination
  // Validates: Requirements 2.1, 4.1, 9.1

  const sourceFiles = getSourceFiles();

  it('should have source files to test', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it('should not contain any hardcoded orange color references', () => {
    const orangePatterns = [
      // Tailwind orange classes
      /\borange-50\b/g,
      /\borange-100\b/g,
      /\borange-200\b/g,
      /\borange-300\b/g,
      /\borange-400\b/g,
      /\borange-500\b/g,
      /\borange-600\b/g,
      /\borange-700\b/g,
      /\borange-800\b/g,
      /\borange-900\b/g,
      // Hex color values (case insensitive)
      /#FF8A1F/gi,
      /#ff6a00/gi,
    ];

    const violations = [];

    sourceFiles.forEach((filePath) => {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(process.cwd(), filePath);

      orangePatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          // Get line numbers for each match
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              violations.push({
                file: relativePath,
                line: index + 1,
                match: line.trim(),
                pattern: pattern.toString(),
              });
            }
          });
        }
      });
    });

    if (violations.length > 0) {
      const violationReport = violations
        .map((v) => `  ${v.file}:${v.line} - "${v.match}"`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} orange color reference(s):\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  // Property-based test: For any file in the codebase, scanning for orange colors should return zero matches
  it('property test: no file should contain orange color references', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...sourceFiles),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8');
          
          // Check for orange Tailwind classes
          const orangeClassPattern = /\borange-(?:50|100|200|300|400|500|600|700|800|900)\b/;
          
          // Check for specific hex values
          const hexPattern1 = /#FF8A1F/i;
          const hexPattern2 = /#ff6a00/i;

          const hasOrangeClass = orangeClassPattern.test(content);
          const hasHex1 = hexPattern1.test(content);
          const hasHex2 = hexPattern2.test(content);

          return !hasOrangeClass && !hasHex1 && !hasHex2;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 2: Hex Color Centralization', () => {
  // Feature: color-system-centralization, Property 2: Hex Color Centralization
  // Validates: Requirements 2.2, 9.2

  const sourceFiles = getSourceFiles();

  // Files that are allowed to have hex colors
  const allowedFiles = [
    'tailwind.config.js',
    // Email templates in backend (if they exist)
    'emailService.js',
    'emailTemplates.js',
  ];

  // Patterns that indicate legitimate hex color usage (third-party libraries)
  const legitimatePatterns = [
    /\/\*.*?Recharts.*?\*\//i, // Recharts library comments
    /\/\/.*?Recharts.*?$/im, // Recharts library comments
    /stopColor=["']#/i, // SVG gradient stops
    /toastOptions/i, // Toast notification library config
    /\/\/.*?from Tailwind config/i, // Explicit comment indicating Tailwind config reference
    /\/\/.*?matches Tailwind/i, // Explicit comment indicating Tailwind match
    /const COLORS = \[/i, // Chart color arrays (Recharts)
  ];

  const isFileAllowed = (filePath) => {
    const relativePath = relative(process.cwd(), filePath);
    return allowedFiles.some((allowed) => relativePath.includes(allowed));
  };

  const isLegitimateHexUsage = (line) => {
    return legitimatePatterns.some((pattern) => pattern.test(line));
  };

  it('should not contain hardcoded hex colors outside allowed files', () => {
    // Hex color pattern: #RGB or #RRGGBB
    const hexColorPattern = /#[0-9A-Fa-f]{3,6}\b/g;

    const violations = [];

    sourceFiles.forEach((filePath) => {
      // Skip allowed files
      if (isFileAllowed(filePath)) {
        return;
      }

      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(process.cwd(), filePath);

      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Skip lines with legitimate hex usage (third-party libraries)
        if (isLegitimateHexUsage(line)) {
          return;
        }

        if (hexColorPattern.test(line)) {
          violations.push({
            file: relativePath,
            line: index + 1,
            match: line.trim(),
          });
        }
      });
    });

    if (violations.length > 0) {
      const violationReport = violations
        .map((v) => `  ${v.file}:${v.line} - "${v.match}"`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} hardcoded hex color(s) outside allowed files:\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  // Property-based test: For any file not in the allowed list, hex colors should return zero matches
  it('property test: no disallowed file should contain hex colors', () => {
    const disallowedFiles = sourceFiles.filter((f) => !isFileAllowed(f));

    if (disallowedFiles.length === 0) {
      // Skip if no disallowed files
      return;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...disallowedFiles),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8');
          
          // Check for hex color pattern
          const hexColorPattern = /#[0-9A-Fa-f]{3,6}\b/g;
          const lines = content.split('\n');
          
          // Check each line and skip legitimate usages
          for (const line of lines) {
            if (hexColorPattern.test(line) && !isLegitimateHexUsage(line)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow hex colors in tailwind.config.js', () => {
    const tailwindConfigPath = join(process.cwd(), 'tailwind.config.js');
    const content = readFileSync(tailwindConfigPath, 'utf-8');
    
    // Tailwind config should have hex colors
    const hexColorPattern = /#[0-9A-Fa-f]{6}\b/;
    expect(hexColorPattern.test(content)).toBe(true);
  });
});

describe('Property 3: Font Family Centralization', () => {
  // Feature: color-system-centralization, Property 3: Font Family Centralization
  // Validates: Requirements 8.1, 9.3

  const sourceFiles = getSourceFiles();

  // Files that are allowed to have font-family declarations
  const allowedFiles = [
    'tailwind.config.js',
    'index.css', // Global CSS file that uses theme() to reference Tailwind config
    // Email templates in backend (if they exist)
    'emailService.js',
    'emailTemplates.js',
  ];

  const isFileAllowed = (filePath) => {
    const relativePath = relative(process.cwd(), filePath);
    return allowedFiles.some((allowed) => relativePath.includes(allowed));
  };

  const isLegitimateFontFamilyUsage = (line) => {
    // Allow font-family declarations that use theme() function
    return /font-family\s*:\s*theme\(/i.test(line);
  };

  it('should not contain hardcoded font-family declarations outside allowed files', () => {
    // Font-family pattern: font-family: "Font Name", fallback;
    const fontFamilyPattern = /font-family\s*:\s*[^;]+;/gi;

    const violations = [];

    sourceFiles.forEach((filePath) => {
      // Skip allowed files
      if (isFileAllowed(filePath)) {
        return;
      }

      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(process.cwd(), filePath);

      const matches = content.match(fontFamilyPattern);
      if (matches) {
        // Get line numbers for each match
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          // Skip legitimate font-family usage (theme() function)
          if (isLegitimateFontFamilyUsage(line)) {
            return;
          }

          if (fontFamilyPattern.test(line)) {
            violations.push({
              file: relativePath,
              line: index + 1,
              match: line.trim(),
            });
          }
        });
      }
    });

    if (violations.length > 0) {
      const violationReport = violations
        .map((v) => `  ${v.file}:${v.line} - "${v.match}"`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} hardcoded font-family declaration(s) outside allowed files:\n${violationReport}`
      );
    }

    expect(violations.length).toBe(0);
  });

  // Property-based test: For any file not in the allowed list, font-family declarations should return zero matches
  it('property test: no disallowed file should contain font-family declarations', () => {
    const disallowedFiles = sourceFiles.filter((f) => !isFileAllowed(f));

    if (disallowedFiles.length === 0) {
      // Skip if no disallowed files
      return;
    }

    fc.assert(
      fc.property(
        fc.constantFrom(...disallowedFiles),
        (filePath) => {
          const content = readFileSync(filePath, 'utf-8');
          
          // Check for font-family pattern
          const fontFamilyPattern = /font-family\s*:\s*[^;]+;/gi;
          const lines = content.split('\n');

          // Check each line and skip legitimate usages
          for (const line of lines) {
            if (fontFamilyPattern.test(line) && !isLegitimateFontFamilyUsage(line)) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow font-family in tailwind.config.js', () => {
    const tailwindConfigPath = join(process.cwd(), 'tailwind.config.js');
    const content = readFileSync(tailwindConfigPath, 'utf-8');
    
    // Tailwind config should have font-family definitions
    expect(content).toContain('fontFamily');
    expect(content).toContain('Poppins');
    expect(content).toContain('Nunito');
  });
});
