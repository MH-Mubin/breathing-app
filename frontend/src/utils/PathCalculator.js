/**
 * PathCalculator utility class for adaptive breathing visualization
 * Provides pure functions for calculating line lengths and ball speeds
 * based on breathing pattern configurations with comprehensive error handling
 * Optimized for real-time performance with caching and efficient calculations
 */

export class PathCalculator {
  // Performance optimization: Cache for frequently calculated values
  static _calculationCache = new Map();
  static _cacheMaxSize = 100; // Limit cache size to prevent memory leaks
  // Safe default values for fallback scenarios
  static SAFE_DEFAULTS = {
    MIN_LINE_LENGTH: 15,
    MAX_LINE_LENGTH: 2000, // Increased to allow for larger test values
    DEFAULT_DIAGONAL_LENGTH: 200,
    DEFAULT_MAX_HORIZONTAL_LENGTH: 400,
    MIN_BALL_SPEED: 0.001, // pixels per millisecond
    MAX_BALL_SPEED: 10     // pixels per millisecond
  };

  // Error types for detailed error reporting
  static ERROR_TYPES = {
    INVALID_INPUT: 'INVALID_INPUT',
    CALCULATION_FAILURE: 'CALCULATION_FAILURE',
    PERFORMANCE_WARNING: 'PERFORMANCE_WARNING'
  };
  /**
   * Safely validate and sanitize input values
   * @param {number} value - Value to validate
   * @param {number} fallback - Fallback value if invalid
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Validated and sanitized value
   */
  static sanitizeValue(value, fallback, min = 0, max = Infinity) {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Calculate the top horizontal line length based on holdTop duration with error handling
   * @param {number} holdTop - Duration of holdTop phase in seconds
   * @param {number} maxLength - Maximum horizontal line length in pixels
   * @returns {number} Calculated top horizontal line length in pixels
   */
  static calculateTopHorizontalLength(holdTop, maxLength) {
    try {
      // Sanitize inputs
      const safeHoldTop = this.sanitizeValue(holdTop, 4, 0, 60);
      const safeMaxLength = this.sanitizeValue(maxLength, this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH, 
                                               this.SAFE_DEFAULTS.MIN_LINE_LENGTH, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      
      if (safeHoldTop <= 4) {
        const result = safeMaxLength * (safeHoldTop / 4); // 25%, 50%, 75%, 100%
        // Only apply minimum constraint if the result would be unreasonably small
        return result < 1 ? this.SAFE_DEFAULTS.MIN_LINE_LENGTH : result;
      }
      return safeMaxLength; // 100% for holdTop > 4s
    } catch (error) {
      console.warn('PathCalculator: Error in calculateTopHorizontalLength, using fallback', error);
      return this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH;
    }
  }

  /**
   * Calculate the bottom horizontal line length based on pattern type with error handling
   * @param {Object} pattern - Breathing pattern configuration
   * @param {number} pattern.holdBottom - Duration of holdBottom phase (optional)
   * @param {number} maxLength - Maximum horizontal line length in pixels (for Box Breathing)
   * @returns {number} Calculated bottom horizontal line length in pixels
   */
  static calculateBottomHorizontalLength(pattern, maxLength = 0) {
    try {
      // Validate pattern input
      if (!pattern || typeof pattern !== 'object') {
        console.warn('PathCalculator: Invalid pattern provided to calculateBottomHorizontalLength');
        return this.SAFE_DEFAULTS.MIN_LINE_LENGTH;
      }

      // Sanitize maxLength
      const safeMaxLength = this.sanitizeValue(maxLength, this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH,
                                               this.SAFE_DEFAULTS.MIN_LINE_LENGTH, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);

      if (!pattern.holdBottom) {
        return this.SAFE_DEFAULTS.MIN_LINE_LENGTH; // Fixed 15px for 3-phase patterns
      }
      
      // Box Breathing: same logic as top line with validation
      const safeHoldBottom = this.sanitizeValue(pattern.holdBottom, 4, 0, 60);
      
      if (safeHoldBottom <= 4) {
        const result = safeMaxLength * (safeHoldBottom / 4);
        // Only apply minimum constraint if the result would be unreasonably small
        return result < 1 ? this.SAFE_DEFAULTS.MIN_LINE_LENGTH : result;
      }
      return safeMaxLength;
    } catch (error) {
      console.warn('PathCalculator: Error in calculateBottomHorizontalLength, using fallback', error);
      return this.SAFE_DEFAULTS.MIN_LINE_LENGTH;
    }
  }

  /**
   * Calculate ball speed for a given phase duration and segment length with error handling
   * @param {number} phaseDuration - Duration of the phase in seconds
   * @param {number} segmentLength - Length of the line segment in pixels
   * @returns {number} Ball speed in pixels per millisecond
   */
  static calculateBallSpeed(phaseDuration, segmentLength) {
    try {
      // Sanitize inputs
      const safeDuration = this.sanitizeValue(phaseDuration, 4, 0.1, 60);
      const safeLength = this.sanitizeValue(segmentLength, this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
                                            this.SAFE_DEFAULTS.MIN_LINE_LENGTH, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      
      if (safeDuration <= 0) {
        console.warn('PathCalculator: Invalid phase duration, using fallback speed');
        return this.SAFE_DEFAULTS.MIN_BALL_SPEED;
      }
      
      const speed = safeLength / (safeDuration * 1000); // pixels per millisecond
      
      // Ensure speed is within reasonable bounds
      return this.sanitizeValue(speed, this.SAFE_DEFAULTS.MIN_BALL_SPEED, 
                                this.SAFE_DEFAULTS.MIN_BALL_SPEED, this.SAFE_DEFAULTS.MAX_BALL_SPEED);
    } catch (error) {
      console.warn('PathCalculator: Error calculating ball speed, using fallback', error);
      return this.SAFE_DEFAULTS.MIN_BALL_SPEED;
    }
  }

  /**
   * Generate cache key for pattern and config combination
   * @param {Object} pattern - Breathing pattern configuration
   * @param {Object} config - Visual configuration
   * @returns {string} Cache key
   */
  static _generateCacheKey(pattern, config) {
    if (!pattern || !config) return 'invalid';
    
    return JSON.stringify({
      inhale: pattern.inhale,
      holdTop: pattern.holdTop,
      exhale: pattern.exhale,
      holdBottom: pattern.holdBottom,
      diagonalLength: config.diagonalLength,
      maxHorizontalLength: config.maxHorizontalLength,
      fixedBallPosition: config.fixedBallPosition,
      viewportWidth: config.viewportWidth
    });
  }

  /**
   * Clear calculation cache (useful for memory management)
   */
  static clearCache() {
    this._calculationCache.clear();
  }

  /**
   * Manage cache size to prevent memory leaks
   */
  static _manageCacheSize() {
    if (this._calculationCache.size > this._cacheMaxSize) {
      // Remove oldest entries (FIFO)
      const keysToDelete = Array.from(this._calculationCache.keys()).slice(0, 20);
      keysToDelete.forEach(key => this._calculationCache.delete(key));
    }
  }

  /**
   * Calculate horizontal offset needed to align bottom-of-up-diagonal with fixed ball position
   * @param {Object} pattern - Breathing pattern configuration
   * @param {number} fixedBallPosition - Fixed ball position in pixels from left edge
   * @param {number} bottomHorizontalLength - Length of bottom horizontal line in pixels
   * @param {number} diagonalHorizontal - Horizontal component of diagonal line in pixels
   * @returns {number} Horizontal offset in pixels
   */
  static calculateHorizontalOffset(pattern, fixedBallPosition, bottomHorizontalLength, diagonalHorizontal) {
    try {
      // Validate inputs are numbers
      if (typeof fixedBallPosition !== 'number' || typeof bottomHorizontalLength !== 'number' || typeof diagonalHorizontal !== 'number') {
        throw new Error('Invalid input types for horizontal offset calculation');
      }
      
      // Calculate where the bottom of up-diagonal would be in the default path
      const defaultBottomOfUpDiagonal = bottomHorizontalLength + diagonalHorizontal;
      
      // Calculate offset needed to align with fixed ball position
      const offset = fixedBallPosition - defaultBottomOfUpDiagonal;
      
      return offset;
    } catch (error) {
      console.warn('PathCalculator: Error calculating horizontal offset, using fallback', error);
      return 0; // No offset as fallback
    }
  }

  /**
   * Calculate the width of one complete breathing pattern cycle
   * @param {number} topHorizontalLength - Length of top horizontal line in pixels
   * @param {number} bottomHorizontalLength - Length of bottom horizontal line in pixels
   * @param {number} diagonalLength - Length of diagonal lines in pixels
   * @returns {number} Total pattern width in pixels
   */
  static calculatePatternWidth(topHorizontalLength, bottomHorizontalLength, diagonalLength) {
    try {
      // Validate inputs
      const safeTopLength = this.sanitizeValue(topHorizontalLength, this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH, 0, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      const safeBottomLength = this.sanitizeValue(bottomHorizontalLength, this.SAFE_DEFAULTS.MIN_LINE_LENGTH, 0, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      const safeDiagonalLength = this.sanitizeValue(diagonalLength, this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH, 0, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      
      // Calculate horizontal component of diagonal lines (assuming 60-degree angle)
      const diagonalHorizontal = safeDiagonalLength / Math.sqrt(3);
      
      // Total pattern width = top line + bottom line + 2 diagonal horizontal components
      return safeTopLength + safeBottomLength + (2 * diagonalHorizontal);
    } catch (error) {
      console.warn('PathCalculator: Error calculating pattern width, using fallback', error);
      return this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH + this.SAFE_DEFAULTS.MIN_LINE_LENGTH + (2 * this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH / Math.sqrt(3));
    }
  }

  /**
   * Calculate infinite path extension parameters to ensure no empty spaces at viewport edges
   * @param {number} viewportWidth - Width of the viewport in pixels
   * @param {number} patternWidth - Width of one complete pattern cycle in pixels
   * @param {number} horizontalOffset - Horizontal offset applied to the path in pixels
   * @returns {Object} Extension parameters including number of patterns needed and boundaries
   */
  static calculateInfiniteExtension(viewportWidth, patternWidth, horizontalOffset) {
    try {
      // Validate inputs
      const safeViewportWidth = this.sanitizeValue(viewportWidth, 700, 100, 5000);
      const safePatternWidth = this.sanitizeValue(patternWidth, 400, 50, 2000);
      const safeOffset = this.sanitizeValue(horizontalOffset, 0, -2000, 2000);
      
      // Calculate extension buffer (at least one pattern width on each side)
      const extensionBuffer = safePatternWidth;
      
      // Calculate total width needed (viewport + extensions on both sides)
      const totalRequiredWidth = safeViewportWidth + (2 * extensionBuffer);
      
      // Calculate number of complete patterns needed to cover the required width
      const patternsNeeded = Math.ceil(totalRequiredWidth / safePatternWidth);
      
      // Calculate the leftmost and rightmost boundaries
      const leftBoundary = safeOffset - extensionBuffer;
      const rightBoundary = safeOffset + (patternsNeeded * safePatternWidth);
      
      // Ensure boundaries extend beyond viewport edges
      const adjustedLeftBoundary = Math.min(leftBoundary, -extensionBuffer);
      const adjustedRightBoundary = Math.max(rightBoundary, safeViewportWidth + extensionBuffer);
      
      return {
        patternsNeeded,
        extensionBuffer,
        leftBoundary: adjustedLeftBoundary,
        rightBoundary: adjustedRightBoundary,
        totalCoverage: adjustedRightBoundary - adjustedLeftBoundary,
        extendsLeftEdge: adjustedLeftBoundary < 0,
        extendsRightEdge: adjustedRightBoundary > safeViewportWidth,
        hasNoGaps: (adjustedRightBoundary - adjustedLeftBoundary) >= safeViewportWidth
      };
    } catch (error) {
      console.warn('PathCalculator: Error calculating infinite extension, using fallback', error);
      return {
        patternsNeeded: 3,
        extensionBuffer: 400,
        leftBoundary: -400,
        rightBoundary: 1100,
        totalCoverage: 1500,
        extendsLeftEdge: true,
        extendsRightEdge: true,
        hasNoGaps: true
      };
    }
  }

  /**
   * Validate that infinite path extension meets requirements
   * @param {number} viewportWidth - Width of the viewport in pixels
   * @param {Object} pathMetrics - Path metrics from calculatePathMetrics
   * @returns {Object} Validation result for infinite extension
   */
  static validateInfiniteExtension(viewportWidth, pathMetrics) {
    try {
      // Calculate pattern width
      const diagonalHorizontal = pathMetrics.diagonalLength / Math.sqrt(3);
      const patternWidth = this.calculatePatternWidth(
        pathMetrics.topHorizontalLength,
        pathMetrics.bottomHorizontalLength,
        pathMetrics.diagonalLength
      );
      
      // Calculate extension parameters
      const extension = this.calculateInfiniteExtension(
        viewportWidth,
        patternWidth,
        pathMetrics.horizontalOffset
      );
      
      // Validate requirements
      const validationResults = {
        isValid: true,
        errors: [],
        warnings: [],
        extension
      };
      
      // Check if path extends beyond viewport edges (Requirement 5.3)
      if (!extension.extendsLeftEdge) {
        validationResults.isValid = false;
        validationResults.errors.push({
          type: this.ERROR_TYPES.INVALID_INPUT,
          message: 'Path does not extend beyond left viewport edge',
          requirement: '5.3'
        });
      }
      
      if (!extension.extendsRightEdge) {
        validationResults.isValid = false;
        validationResults.errors.push({
          type: this.ERROR_TYPES.INVALID_INPUT,
          message: 'Path does not extend beyond right viewport edge',
          requirement: '5.3'
        });
      }
      
      // Check for gaps at viewport edges
      if (!extension.hasNoGaps) {
        validationResults.isValid = false;
        validationResults.errors.push({
          type: this.ERROR_TYPES.INVALID_INPUT,
          message: 'Path has gaps that do not cover the full viewport',
          requirement: '5.3'
        });
      }
      
      // Performance warnings for excessive pattern repetition
      if (extension.patternsNeeded > 10) {
        validationResults.warnings.push({
          type: this.ERROR_TYPES.PERFORMANCE_WARNING,
          message: `Large number of pattern repetitions (${extension.patternsNeeded}) may impact performance`,
          patternsNeeded: extension.patternsNeeded
        });
      }
      
      return validationResults;
    } catch (error) {
      console.error('PathCalculator: Error validating infinite extension', error);
      return {
        isValid: false,
        errors: [{
          type: this.ERROR_TYPES.CALCULATION_FAILURE,
          message: 'Failed to validate infinite extension',
          originalError: error.message
        }],
        warnings: [],
        extension: null
      };
    }
  }

  /**
   * Calculate complete path metrics for a breathing pattern with comprehensive error handling and caching
   * @param {Object} pattern - Breathing pattern configuration
   * @param {number} pattern.inhale - Inhale duration in seconds
   * @param {number} pattern.holdTop - HoldTop duration in seconds
   * @param {number} pattern.exhale - Exhale duration in seconds
   * @param {number} pattern.holdBottom - HoldBottom duration in seconds (optional)
   * @param {Object} config - Visual configuration
   * @param {number} config.diagonalLength - Fixed diagonal line length in pixels
   * @param {number} config.maxHorizontalLength - Maximum horizontal line length in pixels
   * @param {number} config.fixedBallPosition - Fixed ball position in pixels from left edge (optional)
   * @returns {Object} Complete path metrics including line lengths, ball speeds, and horizontal offset
   */
  static calculatePathMetrics(pattern, config) {
    try {
      // Performance optimization: Check cache first
      const cacheKey = this._generateCacheKey(pattern, config);
      if (this._calculationCache.has(cacheKey)) {
        return this._calculationCache.get(cacheKey);
      }

      // Validate inputs
      if (!pattern || typeof pattern !== 'object') {
        console.warn('PathCalculator: Invalid pattern provided, using safe defaults');
        pattern = {
          inhale: 4,
          holdTop: 2,
          exhale: 6,
          type: '3-phase'
        };
      }

      if (!config || typeof config !== 'object') {
        console.warn('PathCalculator: Invalid config provided, using safe defaults');
        config = {
          diagonalLength: this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
          maxHorizontalLength: this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH
        };
      }

      // Sanitize config values
      const safeDiagonalLength = this.sanitizeValue(config.diagonalLength, this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
                                                    this.SAFE_DEFAULTS.MIN_LINE_LENGTH, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);
      const safeMaxHorizontalLength = this.sanitizeValue(config.maxHorizontalLength, this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH,
                                                          this.SAFE_DEFAULTS.MIN_LINE_LENGTH, this.SAFE_DEFAULTS.MAX_LINE_LENGTH);

      const safeConfig = {
        diagonalLength: safeDiagonalLength,
        maxHorizontalLength: safeMaxHorizontalLength
      };
      
      const topHorizontalLength = this.calculateTopHorizontalLength(
        pattern.holdTop, 
        safeConfig.maxHorizontalLength
      );
      
      const bottomHorizontalLength = this.calculateBottomHorizontalLength(
        pattern, 
        safeConfig.maxHorizontalLength
      );

      const ballSpeeds = {
        inhale: this.calculateBallSpeed(pattern.inhale, safeConfig.diagonalLength),
        holdTop: this.calculateBallSpeed(pattern.holdTop, topHorizontalLength),
        exhale: this.calculateBallSpeed(pattern.exhale, safeConfig.diagonalLength),
      };

      // Add holdBottom speed for Box Breathing
      if (pattern.holdBottom !== undefined) {
        ballSpeeds.holdBottom = this.calculateBallSpeed(pattern.holdBottom, bottomHorizontalLength);
      }

      // Calculate horizontal offset if fixedBallPosition is provided
      let horizontalOffset = 0;
      if (config.fixedBallPosition !== undefined) {
        const diagonalHorizontal = safeConfig.diagonalLength / Math.sqrt(3); // Assuming 60-degree angle
        horizontalOffset = this.calculateHorizontalOffset(
          pattern, 
          config.fixedBallPosition, 
          bottomHorizontalLength, 
          diagonalHorizontal
        );
      }

      // Calculate infinite extension parameters if viewport width is provided
      let infiniteExtension = null;
      if (config.viewportWidth !== undefined) {
        const patternWidth = this.calculatePatternWidth(topHorizontalLength, bottomHorizontalLength, safeConfig.diagonalLength);
        infiniteExtension = this.calculateInfiniteExtension(config.viewportWidth, patternWidth, horizontalOffset);
      }

      const result = {
        topHorizontalLength,
        bottomHorizontalLength,
        diagonalLength: safeConfig.diagonalLength, // Always fixed
        horizontalOffset,
        ballSpeeds,
        infiniteExtension,
        isValid: true,
        errors: []
      };

      // Cache the result for performance
      this._calculationCache.set(cacheKey, result);
      this._manageCacheSize();

      return result;
    } catch (error) {
      console.error('PathCalculator: Critical error in calculatePathMetrics', error);
      
      // Return safe fallback metrics
      return {
        topHorizontalLength: this.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH,
        bottomHorizontalLength: this.SAFE_DEFAULTS.MIN_LINE_LENGTH,
        diagonalLength: this.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
        horizontalOffset: 0,
        ballSpeeds: {
          inhale: this.SAFE_DEFAULTS.MIN_BALL_SPEED,
          holdTop: this.SAFE_DEFAULTS.MIN_BALL_SPEED,
          exhale: this.SAFE_DEFAULTS.MIN_BALL_SPEED,
          holdBottom: this.SAFE_DEFAULTS.MIN_BALL_SPEED
        },
        isValid: false,
        errors: [{
          type: this.ERROR_TYPES.CALCULATION_FAILURE,
          message: 'Failed to calculate path metrics, using safe defaults',
          originalError: error.message
        }]
      };
    }
  }

  /**
   * Validate that calculated metrics are within performance bounds
   * @param {Object} metrics - Calculated path metrics
   * @returns {Object} Performance validation result
   */
  static validatePerformance(metrics) {
    const warnings = [];
    
    // Check for extremely small ball speeds that might cause performance issues
    Object.entries(metrics.ballSpeeds).forEach(([phase, speed]) => {
      if (speed < this.SAFE_DEFAULTS.MIN_BALL_SPEED * 0.1) {
        warnings.push({
          type: this.ERROR_TYPES.PERFORMANCE_WARNING,
          message: `Very slow ball speed for ${phase} phase may cause animation issues`,
          phase,
          speed,
          recommended: this.SAFE_DEFAULTS.MIN_BALL_SPEED
        });
      }
      
      if (speed > this.SAFE_DEFAULTS.MAX_BALL_SPEED * 0.8) {
        warnings.push({
          type: this.ERROR_TYPES.PERFORMANCE_WARNING,
          message: `Very fast ball speed for ${phase} phase may cause animation issues`,
          phase,
          speed,
          recommended: this.SAFE_DEFAULTS.MAX_BALL_SPEED * 0.5
        });
      }
    });

    return {
      isPerformant: warnings.length === 0,
      warnings
    };
  }
}