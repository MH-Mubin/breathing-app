import { describe, it } from 'vitest';
import { PatternValidator } from './PatternValidator.js';

describe('PatternValidator', () => {
  describe('Unit Tests for Pattern Validation', () => {
    
    describe('Invalid Phase Durations Rejection', () => {
      it('should reject patterns with negative inhale duration', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: -1,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns with zero inhale duration', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 0,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns with negative holdTop duration', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: -1,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns with negative exhale duration', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: -1,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns with zero exhale duration', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 0,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject Box Breathing patterns with negative holdBottom duration', () => {
        const pattern = {
          name: 'Invalid Box Breathing',
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom: -1,
          level: 'Intermediate',
          category: 'stress',
          description: 'Invalid Box Breathing pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject Box Breathing patterns with zero holdBottom duration', () => {
        const pattern = {
          name: 'Invalid Box Breathing',
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom: 0,
          level: 'Intermediate',
          category: 'stress',
          description: 'Invalid Box Breathing pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should accept patterns with zero holdTop duration for 3-phase patterns', () => {
        const pattern = {
          name: 'Valid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 0,
          exhale: 6,
          level: 'Beginner',
          category: 'stress',
          description: 'Valid pattern with no hold'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(true);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(true);
      });
    });

    describe('Missing Required Phases Detection', () => {
      it('should reject patterns missing inhale phase', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns missing holdTop phase', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns missing exhale phase', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns missing name field', () => {
        const pattern = {
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });

      it('should reject patterns missing type field', () => {
        const pattern = {
          name: 'Invalid Pattern',
          inhale: 4,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });

      it('should reject patterns missing level field', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 3,
          category: 'stress',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });

      it('should reject patterns missing category field', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          description: 'Test pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });

      it('should reject patterns missing description field', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 3,
          level: 'Beginner',
          category: 'stress'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });
    });

    describe('Box Breathing Validation Logic', () => {
      it('should accept valid Box Breathing pattern with all required phases', () => {
        const pattern = {
          name: 'Box Breathing',
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom: 4,
          level: 'Intermediate',
          category: 'stress',
          description: 'Navy SEAL technique - Creates calm under pressure'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(true);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(true);
      });

      it('should reject Box Breathing pattern missing holdBottom phase', () => {
        const pattern = {
          name: 'Invalid Box Breathing',
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          level: 'Intermediate',
          category: 'stress',
          description: 'Invalid Box Breathing pattern'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject 3-phase pattern with holdBottom phase', () => {
        const pattern = {
          name: 'Invalid 3-phase',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 6,
          holdBottom: 2,
          level: 'Beginner',
          category: 'stress',
          description: 'Invalid 3-phase pattern with holdBottom'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(pattern)).toBe(false);
      });

      it('should reject patterns with invalid type', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '5-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 6,
          level: 'Beginner',
          category: 'stress',
          description: 'Invalid pattern type'
        };
        
        expect(PatternValidator.validatePattern(pattern)).toBe(false);
      });

      it('should create correct phase sequence for 3-phase pattern', () => {
        const pattern = {
          name: 'Valid 3-phase',
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 6,
          level: 'Beginner',
          category: 'stress',
          description: 'Valid 3-phase pattern'
        };
        
        const phases = PatternValidator.createPhaseSequence(pattern);
        expect(phases).toEqual(['inhale', 'holdTop', 'exhale']);
      });

      it('should create correct phase sequence for Box Breathing pattern', () => {
        const pattern = {
          name: 'Box Breathing',
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom: 4,
          level: 'Intermediate',
          category: 'stress',
          description: 'Box Breathing pattern'
        };
        
        const phases = PatternValidator.createPhaseSequence(pattern);
        expect(phases).toEqual(['inhale', 'holdTop', 'exhale', 'holdBottom']);
      });

      it('should throw error when creating phase sequence for invalid pattern', () => {
        const pattern = {
          name: 'Invalid Pattern',
          type: '3-phase',
          inhale: -1,
          holdTop: 2,
          exhale: 6,
          level: 'Beginner',
          category: 'stress',
          description: 'Invalid pattern'
        };
        
        expect(() => PatternValidator.createPhaseSequence(pattern)).toThrow('Invalid pattern configuration');
      });
    });

    describe('Edge Cases and Null Handling', () => {
      it('should reject null pattern', () => {
        expect(PatternValidator.validatePattern(null)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(null)).toBe(false);
      });

      it('should reject undefined pattern', () => {
        expect(PatternValidator.validatePattern(undefined)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(undefined)).toBe(false);
      });

      it('should reject non-object pattern', () => {
        expect(PatternValidator.validatePattern('invalid')).toBe(false);
        expect(PatternValidator.validatePhaseSequence('invalid')).toBe(false);
        expect(PatternValidator.validatePattern(123)).toBe(false);
        expect(PatternValidator.validatePhaseSequence(123)).toBe(false);
      });

      it('should reject empty object', () => {
        expect(PatternValidator.validatePattern({})).toBe(false);
        expect(PatternValidator.validatePhaseSequence({})).toBe(false);
      });
    });
  });
});