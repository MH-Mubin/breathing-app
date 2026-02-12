#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const ALLOWED_HEX_FILES = [
  'frontend/tailwind.config.js',
  'backend/utils/emailService.js',
];

const ALLOWED_FONT_FILES = [
  'frontend/tailwind.config.js',
  'backend/utils/emailService.js',
];

// Directories to scan
const SCAN_DIRS = [
  'frontend/src',
  'backend',
];

// Patterns to detect
const ORANGE_PATTERNS = [
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
  /#FF8A1F/gi,
  /#ff6a00/gi,
];

const HEX_COLOR_PATTERN = /#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b/g;
const FONT_FAMILY_PATTERN = /font-family\s*:\s*[^;]+/gi;

// Patterns that indicate legitimate hex color usage
const LEGITIMATE_HEX_PATTERNS = [
  /\/\/.*?from Tailwind config/i,
  /\/\/.*?matches Tailwind/i,
  /\/\*.*?Recharts.*?\*\//i,
  /\/\*.*?matches Tailwind.*?\*\//i,
  /\/\*.*?from Tailwind.*?\*\//i,
  /toastOptions/i,
  /stopColor/i,
  /const COLORS = \[/i,
];

// Patterns that indicate legitimate font-family usage
const LEGITIMATE_FONT_PATTERNS = [
  /theme\(['"]fontFamily/i,
];

// Results storage
const violations = {
  orange: [],
  hex: [],
  font: [],
};

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeFile(filePath) {
  const excludePatterns = [
    /node_modules/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.test\./,
    /\.spec\./,
    /validate-colors\.js$/,
  ];
  
  return excludePatterns.some(pattern => pattern.test(filePath));
}

/**
 * Check if a file is allowed to have hex colors
 */
function isAllowedHexFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return ALLOWED_HEX_FILES.some(allowed => normalizedPath.includes(allowed));
}

/**
 * Check if a file is allowed to have font-family declarations
 */
function isAllowedFontFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  return ALLOWED_FONT_FILES.some(allowed => normalizedPath.includes(allowed));
}

/**
 * Check if a line has legitimate hex color usage
 */
function isLegitimateHexUsage(line) {
  return LEGITIMATE_HEX_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Check if a line has legitimate font-family usage
 */
function isLegitimateFontUsage(line) {
  return LEGITIMATE_FONT_PATTERNS.some(pattern => pattern.test(line));
}

/**
 * Scan a file for violations
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check for orange color patterns
  ORANGE_PATTERNS.forEach(pattern => {
    lines.forEach((line, index) => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          violations.orange.push({
            file: relativePath,
            line: index + 1,
            match: match,
            context: line.trim(),
          });
        });
      }
    });
  });
  
  // Check for hex color patterns (if not in allowed files)
  if (!isAllowedHexFile(filePath)) {
    lines.forEach((line, index) => {
      // Skip lines with legitimate hex usage
      if (isLegitimateHexUsage(line)) {
        return;
      }
      
      const matches = line.match(HEX_COLOR_PATTERN);
      if (matches) {
        matches.forEach(match => {
          violations.hex.push({
            file: relativePath,
            line: index + 1,
            match: match,
            context: line.trim(),
          });
        });
      }
    });
  }
  
  // Check for font-family declarations (if not in allowed files)
  if (!isAllowedFontFile(filePath)) {
    lines.forEach((line, index) => {
      // Skip lines with legitimate font-family usage
      if (isLegitimateFontUsage(line)) {
        return;
      }
      
      const matches = line.match(FONT_FAMILY_PATTERN);
      if (matches) {
        matches.forEach(match => {
          violations.font.push({
            file: relativePath,
            line: index + 1,
            match: match,
            context: line.trim(),
          });
        });
      }
    });
  }
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dirPath, entry.name);
    
    if (shouldExcludeFile(fullPath)) {
      return;
    }
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      // Only scan relevant file types
      const ext = path.extname(entry.name);
      if (['.js', '.jsx', '.ts', '.tsx', '.css', '.html'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  });
}

/**
 * Print violations report
 */
function printReport() {
  let hasViolations = false;
  
  console.log('\n=== Color and Typography Validation Report ===\n');
  
  // Orange color violations
  if (violations.orange.length > 0) {
    hasViolations = true;
    console.log(`❌ Found ${violations.orange.length} orange color reference(s):\n`);
    violations.orange.forEach(v => {
      console.log(`  ${v.file}:${v.line}`);
      console.log(`    Match: ${v.match}`);
      console.log(`    Context: ${v.context}`);
      console.log('');
    });
  } else {
    console.log('✅ No orange color references found\n');
  }
  
  // Hex color violations
  if (violations.hex.length > 0) {
    hasViolations = true;
    console.log(`❌ Found ${violations.hex.length} hardcoded hex color(s) outside allowed files:\n`);
    violations.hex.forEach(v => {
      console.log(`  ${v.file}:${v.line}`);
      console.log(`    Match: ${v.match}`);
      console.log(`    Context: ${v.context}`);
      console.log('');
    });
  } else {
    console.log('✅ No hardcoded hex colors found outside allowed files\n');
  }
  
  // Font-family violations
  if (violations.font.length > 0) {
    hasViolations = true;
    console.log(`❌ Found ${violations.font.length} hardcoded font-family declaration(s) outside allowed files:\n`);
    violations.font.forEach(v => {
      console.log(`  ${v.file}:${v.line}`);
      console.log(`    Match: ${v.match}`);
      console.log(`    Context: ${v.context}`);
      console.log('');
    });
  } else {
    console.log('✅ No hardcoded font-family declarations found outside allowed files\n');
  }
  
  console.log('=== End of Report ===\n');
  
  if (hasViolations) {
    console.log('❌ Validation FAILED: Please fix the violations above.\n');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED: All color and typography checks passed!\n');
    process.exit(0);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('Starting color and typography validation...\n');
  console.log('Scanning directories:', SCAN_DIRS.join(', '));
  console.log('');
  
  SCAN_DIRS.forEach(dir => {
    scanDirectory(dir);
  });
  
  printReport();
}

main();
