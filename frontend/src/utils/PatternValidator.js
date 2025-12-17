/**
 * PatternValidator utility for validating breathing pattern configurations
 * Ensures patterns conform to 3-phase or 4-phase requirements with comprehensive error handling
 */

export class PatternValidator {
  // Duration limits for validation
  static DURATION_LIMITS = {
    MIN_DURATION: 0.5, // Minimum 0.5 seconds
    MAX_DURATION: 60,  // Maximum 60 seconds
    WARN_DURATION: 30  // Warn for durations > 30 seconds
  };

  // Error types for detailed error reporting
  static ERROR_TYPES = {
    INVALID_PATTERN: 'INVALID_PATTERN',
    DURATION_OUT_OF_RANGE: 'DURATION_OUT_OF_RANGE',
    MISSING_REQUIRED_PHASE: 'MISSING_REQUIRED_PHASE',
    INVALID_PHASE_SEQUENCE: 'INVALID_PHASE_SEQUENCE',
    PERFORMANCE_WARNING: 'PERFORMANCE_WARNING'
  };
  /**
   * Validate duration limits for a single phase
   * @param {number} duration - Phase duration in seconds
   * @param {string} phaseName - Name of the phase for error reporting
   * @returns {Object} Validation result with success flag and error details
   */
  static validateDuration(duration, phaseName) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (typeof duration !== 'number' || isNaN(duration)) {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.DURATION_OUT_OF_RANGE,
        message: `${phaseName} duration must be a valid number`,
        phase: phaseName,
        value: duration
      });
      return result;
    }

    // Allow zero duration for holdTop and holdBottom phases (common in breathing patterns)
    const allowZero = phaseName === 'holdTop' || phaseName === 'holdBottom';
    const minDuration = allowZero ? 0 : this.DURATION_LIMITS.MIN_DURATION;
    
    if (duration < minDuration) {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.DURATION_OUT_OF_RANGE,
        message: `${phaseName} duration (${duration}s) is below minimum (${minDuration}s)`,
        phase: phaseName,
        value: duration,
        min: minDuration
      });
    }

    if (duration > this.DURATION_LIMITS.MAX_DURATION) {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.DURATION_OUT_OF_RANGE,
        message: `${phaseName} duration (${duration}s) exceeds maximum (${this.DURATION_LIMITS.MAX_DURATION}s)`,
        phase: phaseName,
        value: duration,
        max: this.DURATION_LIMITS.MAX_DURATION
      });
    } else if (duration > this.DURATION_LIMITS.WARN_DURATION) {
      result.warnings.push({
        type: this.ERROR_TYPES.PERFORMANCE_WARNING,
        message: `${phaseName} duration (${duration}s) is very long and may affect performance`,
        phase: phaseName,
        value: duration,
        recommended: this.DURATION_LIMITS.WARN_DURATION
      });
    }

    return result;
  }

  /**
   * Validate that a pattern has the correct phase sequence based on its type
   * @param {Object} pattern - Breathing pattern configuration
   * @param {string} pattern.type - Pattern type ("3-phase" or "4-phase")
   * @param {number} pattern.inhale - Inhale duration in seconds
   * @param {number} pattern.holdTop - HoldTop duration in seconds
   * @param {number} pattern.exhale - Exhale duration in seconds
   * @param {number} [pattern.holdBottom] - HoldBottom duration in seconds (required for 4-phase)
   * @returns {boolean} True if pattern has correct phase sequence for its type
   */
  static validatePhaseSequence(pattern) {
    if (!pattern || typeof pattern !== 'object') {
      return false;
    }

    // Check required fields for all patterns with duration validation
    const inhaleValidation = this.validateDuration(pattern.inhale, 'inhale');
    if (!inhaleValidation.isValid || pattern.inhale <= 0) {
      return false;
    }
    
    const holdTopValidation = this.validateDuration(pattern.holdTop, 'holdTop');
    if (!holdTopValidation.isValid || pattern.holdTop < 0) {
      return false;
    }
    
    const exhaleValidation = this.validateDuration(pattern.exhale, 'exhale');
    if (!exhaleValidation.isValid || pattern.exhale <= 0) {
      return false;
    }

    if (pattern.type === '3-phase') {
      // 3-phase pattern should have inhale, holdTop, exhale only
      // holdBottom should be undefined or not present
      return pattern.holdBottom === undefined;
    } else if (pattern.type === '4-phase') {
      // 4-phase pattern should have inhale, holdTop, exhale, holdBottom
      // holdBottom should be a positive number with duration validation
      const holdBottomValidation = this.validateDuration(pattern.holdBottom, 'holdBottom');
      return holdBottomValidation.isValid && typeof pattern.holdBottom === 'number' && pattern.holdBottom > 0;
    }

    // Unknown pattern type
    return false;
  }

  /**
   * Create a phase sequence array for a given pattern
   * @param {Object} pattern - Breathing pattern configuration
   * @returns {Array} Array of phase names in correct sequence
   */
  static createPhaseSequence(pattern) {
    if (!this.validatePhaseSequence(pattern)) {
      throw new Error('Invalid pattern configuration');
    }

    const phases = ['inhale', 'holdTop', 'exhale'];
    
    if (pattern.type === '4-phase') {
      phases.push('holdBottom');
    }

    return phases;
  }

  /**
   * Comprehensive pattern validation with detailed error reporting
   * @param {Object} pattern - Breathing pattern configuration
   * @returns {Object} Detailed validation result
   */
  static validatePatternDetailed(pattern) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      fallbackPattern: null
    };

    // Null/undefined check
    if (!pattern || typeof pattern !== 'object') {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.INVALID_PATTERN,
        message: 'Pattern must be a valid object',
        value: pattern
      });
      result.fallbackPattern = this.getDefaultPattern();
      return result;
    }

    // Check required fields
    const requiredFields = ['name', 'type', 'inhale', 'holdTop', 'exhale', 'level', 'category', 'description'];
    const missingFields = requiredFields.filter(field => !(field in pattern));
    
    if (missingFields.length > 0) {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.MISSING_REQUIRED_PHASE,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Validate type
    if (pattern.type !== '3-phase' && pattern.type !== '4-phase') {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.INVALID_PHASE_SEQUENCE,
        message: `Invalid pattern type: ${pattern.type}. Must be '3-phase' or '4-phase'`,
        value: pattern.type
      });
    }

    // Validate durations
    if (typeof pattern.inhale === 'number') {
      const inhaleValidation = this.validateDuration(pattern.inhale, 'inhale');
      result.errors.push(...inhaleValidation.errors);
      result.warnings.push(...inhaleValidation.warnings);
      if (!inhaleValidation.isValid) result.isValid = false;
    }

    if (typeof pattern.holdTop === 'number') {
      const holdTopValidation = this.validateDuration(pattern.holdTop, 'holdTop');
      result.errors.push(...holdTopValidation.errors);
      result.warnings.push(...holdTopValidation.warnings);
      if (!holdTopValidation.isValid) result.isValid = false;
    }

    if (typeof pattern.exhale === 'number') {
      const exhaleValidation = this.validateDuration(pattern.exhale, 'exhale');
      result.errors.push(...exhaleValidation.errors);
      result.warnings.push(...exhaleValidation.warnings);
      if (!exhaleValidation.isValid) result.isValid = false;
    }

    if (pattern.type === '4-phase' && typeof pattern.holdBottom === 'number') {
      const holdBottomValidation = this.validateDuration(pattern.holdBottom, 'holdBottom');
      result.errors.push(...holdBottomValidation.errors);
      result.warnings.push(...holdBottomValidation.warnings);
      if (!holdBottomValidation.isValid) result.isValid = false;
    }

    // Validate phase sequence
    if (!this.validatePhaseSequence(pattern)) {
      result.isValid = false;
      result.errors.push({
        type: this.ERROR_TYPES.INVALID_PHASE_SEQUENCE,
        message: 'Invalid phase sequence for pattern type',
        patternType: pattern.type,
        hasHoldBottom: pattern.holdBottom !== undefined
      });
    }

    // Provide fallback if invalid
    if (!result.isValid) {
      result.fallbackPattern = this.createFallbackPattern(pattern);
    }

    return result;
  }

  /**
   * Validate that a pattern configuration is complete and valid (legacy method)
   * @param {Object} pattern - Breathing pattern configuration
   * @returns {boolean} True if pattern is valid
   */
  static validatePattern(pattern) {
    const detailedResult = this.validatePatternDetailed(pattern);
    return detailedResult.isValid;
  }

  /**
   * Get a safe default pattern for fallback scenarios
   * @returns {Object} Default breathing pattern
   */
  static getDefaultPattern() {
    return {
      name: "Safe Default",
      type: "3-phase",
      inhale: 4,
      holdTop: 2,
      exhale: 6,
      level: "Beginner",
      category: "stress",
      description: "Safe default pattern for error recovery"
    };
  }

  /**
   * Create a fallback pattern based on a potentially invalid pattern
   * @param {Object} invalidPattern - The invalid pattern to base fallback on
   * @returns {Object} Safe fallback pattern
   */
  static createFallbackPattern(invalidPattern) {
    const defaultPattern = this.getDefaultPattern();
    
    if (!invalidPattern || typeof invalidPattern !== 'object') {
      return defaultPattern;
    }

    // Try to preserve valid parts of the original pattern
    const fallback = { ...defaultPattern };
    
    // Preserve name if it exists and is valid
    if (typeof invalidPattern.name === 'string' && invalidPattern.name.trim()) {
      fallback.name = `${invalidPattern.name} (Safe Mode)`;
    }

    // Preserve valid durations within safe limits
    if (this.isDurationSafe(invalidPattern.inhale)) {
      fallback.inhale = invalidPattern.inhale;
    }
    if (this.isDurationSafe(invalidPattern.holdTop)) {
      fallback.holdTop = invalidPattern.holdTop;
    }
    if (this.isDurationSafe(invalidPattern.exhale)) {
      fallback.exhale = invalidPattern.exhale;
    }

    // For 4-phase patterns, try to preserve holdBottom if safe
    if (invalidPattern.type === '4-phase' && this.isDurationSafe(invalidPattern.holdBottom)) {
      fallback.type = '4-phase';
      fallback.holdBottom = invalidPattern.holdBottom;
    }

    return fallback;
  }

  /**
   * Check if a duration is within safe limits
   * @param {number} duration - Duration to check
   * @returns {boolean} True if duration is safe
   */
  static isDurationSafe(duration) {
    return typeof duration === 'number' && 
           !isNaN(duration) && 
           duration >= this.DURATION_LIMITS.MIN_DURATION && 
           duration <= this.DURATION_LIMITS.MAX_DURATION;
  }
}