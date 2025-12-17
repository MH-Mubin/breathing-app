import fc from 'fast-check';
import { describe, it } from 'vitest';
import { PathCalculator } from './PathCalculator.js';
import { PatternValidator } from './PatternValidator.js';

describe('PathCalculator', () => {
  describe('Property-Based Tests', () => {
    
    // **Feature: adaptive-breathing-visualization, Property 1: Horizontal Line Length Proportionality**
    // **Validates: Requirements 1.1**
    it('should calculate top horizontal line length proportionally for holdTop durations 1-3 seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }), // holdTop duration 1-3 seconds
          fc.integer({ min: 100, max: 1000 }), // maxLength
          (holdTop, maxLength) => {
            const result = PathCalculator.calculateTopHorizontalLength(holdTop, maxLength);
            const expectedRatio = holdTop / 4;
            const actualRatio = result / maxLength;
            
            // Should be exactly proportional (25%, 50%, 75%)
            return Math.abs(actualRatio - expectedRatio) < 0.001;
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 2: Maximum Line Length Constraint**
    // **Validates: Requirements 1.2, 1.3**
    it('should return 100% of max length for holdTop duration >= 4 seconds', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4, max: 30 }), // holdTop duration >= 4 seconds
          fc.integer({ min: 100, max: 1000 }), // maxLength
          (holdTop, maxLength) => {
            const result = PathCalculator.calculateTopHorizontalLength(holdTop, maxLength);
            
            // Should always return exactly maxLength for holdTop >= 4
            return result === maxLength;
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 3: Ball Timing Accuracy**
    // **Validates: Requirements 1.4, 1.5, 3.3**
    it('should calculate ball speed such that traversal time matches phase duration exactly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // phaseDuration in seconds
          fc.integer({ min: 50, max: 500 }), // segmentLength in pixels
          (phaseDuration, segmentLength) => {
            const ballSpeed = PathCalculator.calculateBallSpeed(phaseDuration, segmentLength);
            
            // Calculate actual traversal time: segmentLength / ballSpeed should equal phaseDuration * 1000 (ms)
            const actualTraversalTime = segmentLength / ballSpeed;
            const expectedTraversalTime = phaseDuration * 1000;
            
            // Should be exactly equal (within floating point precision)
            return Math.abs(actualTraversalTime - expectedTraversalTime) < 0.001;
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 8: Phase Sequence Correctness**
    // **Validates: Requirements 5.1, 5.2**
    it('should validate correct phase sequences for 3-phase and 4-phase patterns', () => {
      // Test 3-phase patterns
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 0, max: 30 }), // holdTop (can be 0)
          fc.integer({ min: 1, max: 30 }), // exhale
          (inhale, holdTop, exhale) => {
            const threePhasePattern = {
              type: '3-phase',
              inhale,
              holdTop,
              exhale
            };
            
            const isValid = PatternValidator.validatePhaseSequence(threePhasePattern);
            const expectedSequence = ['inhale', 'holdTop', 'exhale'];
            const actualSequence = isValid ? PatternValidator.createPhaseSequence(threePhasePattern) : [];
            
            // 3-phase pattern should be valid and have correct sequence
            return isValid && 
                   actualSequence.length === 3 &&
                   actualSequence[0] === 'inhale' &&
                   actualSequence[1] === 'holdTop' &&
                   actualSequence[2] === 'exhale';
          }
        ),
        { numRuns: 100 }
      );

      // Test 4-phase patterns (Box Breathing)
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 1, max: 30 }), // holdTop
          fc.integer({ min: 1, max: 30 }), // exhale
          fc.integer({ min: 1, max: 30 }), // holdBottom
          (inhale, holdTop, exhale, holdBottom) => {
            const fourPhasePattern = {
              type: '4-phase',
              inhale,
              holdTop,
              exhale,
              holdBottom
            };
            
            const isValid = PatternValidator.validatePhaseSequence(fourPhasePattern);
            const expectedSequence = ['inhale', 'holdTop', 'exhale', 'holdBottom'];
            const actualSequence = isValid ? PatternValidator.createPhaseSequence(fourPhasePattern) : [];
            
            // 4-phase pattern should be valid and have correct sequence
            return isValid && 
                   actualSequence.length === 4 &&
                   actualSequence[0] === 'inhale' &&
                   actualSequence[1] === 'holdTop' &&
                   actualSequence[2] === 'exhale' &&
                   actualSequence[3] === 'holdBottom';
          }
        ),
        { numRuns: 100 }
      );

      // Test invalid patterns (3-phase with holdBottom should be invalid)
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 0, max: 30 }), // holdTop
          fc.integer({ min: 1, max: 30 }), // exhale
          fc.integer({ min: 1, max: 30 }), // holdBottom
          (inhale, holdTop, exhale, holdBottom) => {
            const invalidPattern = {
              type: '3-phase',
              inhale,
              holdTop,
              exhale,
              holdBottom // This should make it invalid for 3-phase
            };
            
            // 3-phase pattern with holdBottom should be invalid
            return !PatternValidator.validatePhaseSequence(invalidPattern);
          }
        ),
        { numRuns: 100 }
      );

      // Test invalid patterns (4-phase without holdBottom should be invalid)
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 1, max: 30 }), // holdTop
          fc.integer({ min: 1, max: 30 }), // exhale
          (inhale, holdTop, exhale) => {
            const invalidPattern = {
              type: '4-phase',
              inhale,
              holdTop,
              exhale
              // Missing holdBottom - should make it invalid for 4-phase
            };
            
            // 4-phase pattern without holdBottom should be invalid
            return !PatternValidator.validatePhaseSequence(invalidPattern);
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 4: Box Breathing Bottom Line Adaptation**
    // **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
    it('should adapt bottom horizontal line length for Box Breathing patterns using same rules as top line', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 1, max: 30 }), // holdTop
          fc.integer({ min: 1, max: 30 }), // exhale
          fc.integer({ min: 1, max: 30 }), // holdBottom
          fc.integer({ min: 100, max: 1000 }), // maxLength
          (inhale, holdTop, exhale, holdBottom, maxLength) => {
            const boxBreathingPattern = {
              type: '4-phase',
              inhale,
              holdTop,
              exhale,
              holdBottom
            };

            const bottomLength = PathCalculator.calculateBottomHorizontalLength(boxBreathingPattern, maxLength);
            
            // For Box Breathing, bottom line should follow same rules as top line
            let expectedLength;
            if (holdBottom <= 4) {
              expectedLength = maxLength * (holdBottom / 4);
            } else {
              expectedLength = maxLength;
            }
            
            return Math.abs(bottomLength - expectedLength) < 0.001;
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 5: Three-Phase Bottom Line Consistency**
    // **Validates: Requirements 2.1**
    it('should always return 15px for bottom horizontal line in 3-phase patterns', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale
          fc.integer({ min: 0, max: 30 }), // holdTop (can be 0)
          fc.integer({ min: 1, max: 30 }), // exhale
          fc.integer({ min: 100, max: 1000 }), // maxLength (should not affect result)
          (inhale, holdTop, exhale, maxLength) => {
            const threePhasePattern = {
              type: '3-phase',
              inhale,
              holdTop,
              exhale
              // No holdBottom for 3-phase
            };

            const bottomLength = PathCalculator.calculateBottomHorizontalLength(threePhasePattern, maxLength);
            
            // For 3-phase patterns, bottom line should always be exactly 15px
            // regardless of other pattern parameters or maxLength
            return bottomLength === 15;
          }
        ),
        { numRuns: 100 }
      );
    });

    // **Feature: adaptive-breathing-visualization, Property 6: Diagonal Line Length Invariance**
    // **Validates: Requirements 3.1, 3.2**
    it('should maintain fixed diagonal line lengths regardless of pattern changes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 30 }), // inhale1
          fc.integer({ min: 1, max: 30 }), // holdTop1
          fc.integer({ min: 1, max: 30 }), // exhale1
          fc.integer({ min: 1, max: 30 }), // inhale2
          fc.integer({ min: 1, max: 30 }), // holdTop2
          fc.integer({ min: 1, max: 30 }), // exhale2
          fc.integer({ min: 100, max: 1000 }), // diagonalLength
          fc.integer({ min: 100, max: 1000 }), // maxHorizontalLength
          (inhale1, holdTop1, exhale1, inhale2, holdTop2, exhale2, diagonalLength, maxHorizontalLength) => {
            const pattern1 = {
              type: '3-phase',
              inhale: inhale1,
              holdTop: holdTop1,
              exhale: exhale1
            };

            const pattern2 = {
              type: '3-phase',
              inhale: inhale2,
              holdTop: holdTop2,
              exhale: exhale2
            };

            const config = {
              diagonalLength,
              maxHorizontalLength
            };

            const metrics1 = PathCalculator.calculatePathMetrics(pattern1, config);
            const metrics2 = PathCalculator.calculatePathMetrics(pattern2, config);

            // Diagonal line lengths should be identical regardless of pattern changes
            return metrics1.diagonalLength === metrics2.diagonalLength &&
                   metrics1.diagonalLength === diagonalLength &&
                   metrics2.diagonalLength === diagonalLength;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Path Horizontal Positioning Tests', () => {
    
    // **Feature: adaptive-breathing-visualization, Property 11: Fixed Ball Position Consistency**
    // **Validates: Requirements 4.1**
    describe('Fixed Ball Position Consistency', () => {
      const fixedBallPosition = 350; // Fixed position at center of 700px viewport
      const testHoldDurations = [1, 2, 3, 4, 8, 15];
      
      // Test data representing various breathing patterns
      const testPatterns = [
        // 3-phase patterns with different hold durations
        ...testHoldDurations.map(holdTop => ({
          name: `3-phase-${holdTop}s`,
          type: '3-phase',
          inhale: 4,
          holdTop,
          exhale: 6
        })),
        // Box Breathing patterns with different hold durations
        ...testHoldDurations.map(holdBottom => ({
          name: `box-breathing-${holdBottom}s`,
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom
        }))
      ];

      it('should calculate horizontal offset so ball appears at same pixel coordinates for all patterns', () => {
        const config = {
          diagonalLength: 200,
          maxHorizontalLength: 400,
          fixedBallPosition
        };

        const offsets = testPatterns.map(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          return {
            pattern: pattern.name,
            offset: metrics.horizontalOffset,
            bottomLength: metrics.bottomHorizontalLength
          };
        });

        // All patterns should have calculated offsets that result in the same ball position
        // The ball position after translation should be: bottomHorizontalLength + diagonalHorizontal + offset = fixedBallPosition
        const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
        
        offsets.forEach(({ pattern, offset, bottomLength }) => {
          const actualBallPosition = bottomLength + diagonalHorizontal + offset;
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });

      it('should maintain consistent ball position across various hold durations', () => {
        const config = {
          diagonalLength: 200,
          maxHorizontalLength: 400,
          fixedBallPosition
        };

        testHoldDurations.forEach(holdDuration => {
          const threePhasePattern = {
            type: '3-phase',
            inhale: 4,
            holdTop: holdDuration,
            exhale: 6
          };

          const boxBreathingPattern = {
            type: '4-phase',
            inhale: 4,
            holdTop: 4,
            exhale: 4,
            holdBottom: holdDuration
          };

          const threePhaseMetrics = PathCalculator.calculatePathMetrics(threePhasePattern, config);
          const boxBreathingMetrics = PathCalculator.calculatePathMetrics(boxBreathingPattern, config);

          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          
          const threePhaseActualPosition = threePhaseMetrics.bottomHorizontalLength + diagonalHorizontal + threePhaseMetrics.horizontalOffset;
          const boxBreathingActualPosition = boxBreathingMetrics.bottomHorizontalLength + diagonalHorizontal + boxBreathingMetrics.horizontalOffset;

          expect(threePhaseActualPosition).toBeCloseTo(fixedBallPosition, 1);
          expect(boxBreathingActualPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });

      it('should handle edge cases with extreme hold durations', () => {
        const config = {
          diagonalLength: 200,
          maxHorizontalLength: 400,
          fixedBallPosition
        };

        const extremePatterns = [
          { type: '3-phase', inhale: 1, holdTop: 0.5, exhale: 1 }, // Very short
          { type: '3-phase', inhale: 30, holdTop: 30, exhale: 30 }, // Very long
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 0.5 }, // Short holdBottom
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 30 } // Long holdBottom
        ];

        const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);

        extremePatterns.forEach(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
          expect(metrics.isValid).toBe(true);
        });
      });
    });

    // **Feature: adaptive-breathing-visualization, Property 12: Path Alignment Accuracy**
    // **Validates: Requirements 5.1, 5.2**
    describe('Path Alignment Accuracy', () => {
      const fixedBallPosition = 350;

      it('should align bottom-of-up-diagonal with fixed ball position after translation', () => {
        const testConfigs = [
          { diagonalLength: 150, maxHorizontalLength: 300 },
          { diagonalLength: 200, maxHorizontalLength: 400 },
          { diagonalLength: 250, maxHorizontalLength: 500 }
        ];

        const testPatterns = [
          { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 },
          { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 },
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 2 },
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 }
        ];

        testConfigs.forEach(config => {
          const configWithBallPosition = { ...config, fixedBallPosition };
          
          testPatterns.forEach(pattern => {
            const metrics = PathCalculator.calculatePathMetrics(pattern, configWithBallPosition);
            const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
            
            // Calculate where bottom-of-up-diagonal is after translation
            const bottomOfUpDiagonal = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
            
            // Should align exactly with fixed ball position
            expect(bottomOfUpDiagonal).toBeCloseTo(fixedBallPosition, 1);
          });
        });
      });

      it('should calculate correct horizontal offset for different line lengths', () => {
        const config = {
          diagonalLength: 200,
          maxHorizontalLength: 400,
          fixedBallPosition
        };

        const patterns = [
          { type: '3-phase', inhale: 4, holdTop: 1, exhale: 6 }, // 25% top line
          { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 }, // 50% top line
          { type: '3-phase', inhale: 4, holdTop: 3, exhale: 6 }, // 75% top line
          { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 }, // 100% top line
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 1 }, // 25% bottom line
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 }  // 100% bottom line
        ];

        const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);

        patterns.forEach(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          
          // Verify offset calculation is correct
          const expectedBottomOfUpDiagonal = metrics.bottomHorizontalLength + diagonalHorizontal;
          const expectedOffset = fixedBallPosition - expectedBottomOfUpDiagonal;
          
          expect(metrics.horizontalOffset).toBeCloseTo(expectedOffset, 1);
        });
      });

      it('should handle alignment with various pattern configurations', () => {
        const config = {
          diagonalLength: 200,
          maxHorizontalLength: 400,
          fixedBallPosition
        };

        // Test with different inhale/exhale durations (should not affect alignment)
        const variousPatterns = [
          { type: '3-phase', inhale: 2, holdTop: 2, exhale: 4 },
          { type: '3-phase', inhale: 6, holdTop: 3, exhale: 8 },
          { type: '4-phase', inhale: 3, holdTop: 2, exhale: 5, holdBottom: 3 },
          { type: '4-phase', inhale: 8, holdTop: 6, exhale: 10, holdBottom: 4 }
        ];

        const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);

        variousPatterns.forEach(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          const actualAlignment = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          
          expect(actualAlignment).toBeCloseTo(fixedBallPosition, 1);
          expect(metrics.isValid).toBe(true);
        });
      });

      it('should maintain alignment accuracy with edge case configurations', () => {
        const edgeConfigs = [
          { diagonalLength: 50, maxHorizontalLength: 100, fixedBallPosition: 100 },   // Small viewport
          { diagonalLength: 500, maxHorizontalLength: 1000, fixedBallPosition: 800 }, // Large viewport
          { diagonalLength: 200, maxHorizontalLength: 400, fixedBallPosition: 50 },   // Ball near left edge
          { diagonalLength: 200, maxHorizontalLength: 400, fixedBallPosition: 650 }   // Ball near right edge
        ];

        const testPattern = { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 };

        edgeConfigs.forEach(config => {
          const metrics = PathCalculator.calculatePathMetrics(testPattern, config);
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualAlignment = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          
          expect(actualAlignment).toBeCloseTo(config.fixedBallPosition, 1);
          expect(metrics.isValid).toBe(true);
        });
      });
    });
  });

  // **Feature: adaptive-breathing-visualization, Property 13: Infinite Path Extension**
  // **Validates: Requirements 5.3**
  describe('Infinite Path Extension', () => {
    const viewportWidth = 700; // Standard viewport width
    const testConfig = {
      diagonalLength: 200,
      maxHorizontalLength: 400,
      fixedBallPosition: 350
    };

    it('should extend path beyond viewport edges after translation', () => {
      const testPatterns = [
        { type: '3-phase', inhale: 4, holdTop: 1, exhale: 6 }, // Small top line, large negative offset
        { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 }, // Full top line, moderate offset
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 1 }, // Small bottom line
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 }  // Full bottom line
      ];

      testPatterns.forEach(pattern => {
        const configWithViewport = { ...testConfig, viewportWidth };
        const metrics = PathCalculator.calculatePathMetrics(pattern, configWithViewport);
        
        // Verify infinite extension was calculated
        expect(metrics.infiniteExtension).toBeDefined();
        expect(metrics.infiniteExtension).not.toBeNull();
        
        // Path should extend beyond viewport edges
        expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
        expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
        
        // Verify boundaries extend beyond viewport
        expect(metrics.infiniteExtension.leftBoundary).toBeLessThan(0);
        expect(metrics.infiniteExtension.rightBoundary).toBeGreaterThan(viewportWidth);
        
        // Verify no gaps would exist
        expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
        expect(metrics.infiniteExtension.totalCoverage).toBeGreaterThanOrEqual(viewportWidth);
      });
    });

    it('should ensure no empty spaces at left or right edges', () => {
      const edgeTestCases = [
        // Test with various horizontal offsets that could create edge gaps
        { offset: -200, description: 'large negative offset' },
        { offset: -50, description: 'small negative offset' },
        { offset: 0, description: 'zero offset' },
        { offset: 50, description: 'small positive offset' },
        { offset: 200, description: 'large positive offset' }
      ];

      const testPattern = { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 };
      
      edgeTestCases.forEach(({ offset, description }) => {
        // Simulate different horizontal offsets by changing ball position
        const configWithOffset = { 
          ...testConfig, 
          fixedBallPosition: testConfig.fixedBallPosition + offset,
          viewportWidth 
        };
        const metrics = PathCalculator.calculatePathMetrics(testPattern, configWithOffset);
        
        // Verify infinite extension ensures no gaps
        expect(metrics.infiniteExtension).toBeDefined();
        expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
        
        // Ensure complete coverage with no gaps at edges
        expect(metrics.infiniteExtension.leftBoundary).toBeLessThanOrEqual(0); // No gap at left edge
        expect(metrics.infiniteExtension.rightBoundary).toBeGreaterThanOrEqual(viewportWidth); // No gap at right edge
        
        // Verify continuous coverage
        expect(metrics.infiniteExtension.totalCoverage).toBeGreaterThanOrEqual(viewportWidth);
      });
    });

    it('should handle infinite extension with different horizontal offsets', () => {
      const offsetTestCases = [
        // Different ball positions that create various horizontal offsets
        { fixedBallPosition: 100, description: 'far left position' },
        { fixedBallPosition: 200, description: 'left of center position' },
        { fixedBallPosition: 350, description: 'center position' },
        { fixedBallPosition: 500, description: 'right of center position' },
        { fixedBallPosition: 600, description: 'far right position' }
      ];

      const testPatterns = [
        { type: '3-phase', inhale: 4, holdTop: 1, exhale: 6 }, // Creates different offset than...
        { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 }, // ...this pattern
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 2 }
      ];

      offsetTestCases.forEach(({ fixedBallPosition, description }) => {
        testPatterns.forEach(pattern => {
          const config = { ...testConfig, fixedBallPosition, viewportWidth };
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          
          // Verify infinite extension was calculated
          expect(metrics.infiniteExtension).toBeDefined();
          
          // Verify infinite extension covers all cases regardless of offset
          expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
          expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
          expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
          
          // Ensure seamless coverage
          expect(metrics.infiniteExtension.totalCoverage).toBeGreaterThanOrEqual(viewportWidth);
          
          // Verify ball position is correctly aligned
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });
    });

    it('should maintain infinite extension consistency across pattern switches', () => {
      const patternSequence = [
        { type: '3-phase', inhale: 4, holdTop: 1, exhale: 6 },
        { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 },
        { type: '3-phase', inhale: 4, holdTop: 3, exhale: 6 },
        { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 },
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 1 },
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 }
      ];

      const fixedBallPositions = [200, 350, 500]; // Test different ball positions

      fixedBallPositions.forEach(fixedBallPosition => {
        const config = { ...testConfig, fixedBallPosition, viewportWidth };
        
        patternSequence.forEach(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          
          // Verify each pattern maintains infinite extension
          expect(metrics.infiniteExtension).toBeDefined();
          expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
          expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
          expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
          
          // Verify ball position consistency (should always be at fixedBallPosition)
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });
    });

    it('should handle edge cases for infinite extension', () => {
      const edgeCases = [
        // Very small viewport
        { viewportWidth: 100, config: { diagonalLength: 50, maxHorizontalLength: 80, fixedBallPosition: 50 } },
        // Very large viewport  
        { viewportWidth: 2000, config: { diagonalLength: 300, maxHorizontalLength: 800, fixedBallPosition: 1000 } },
        // Minimal pattern dimensions
        { viewportWidth: 700, config: { diagonalLength: 50, maxHorizontalLength: 100, fixedBallPosition: 350 } },
        // Large pattern dimensions
        { viewportWidth: 700, config: { diagonalLength: 500, maxHorizontalLength: 1000, fixedBallPosition: 350 } }
      ];

      const testPattern = { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 };

      edgeCases.forEach(({ viewportWidth: vw, config }) => {
        const configWithViewport = { ...config, viewportWidth: vw };
        const metrics = PathCalculator.calculatePathMetrics(testPattern, configWithViewport);
        
        // Verify infinite extension was calculated and is valid
        expect(metrics.infiniteExtension).toBeDefined();
        expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
        expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
        expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
        
        // Verify no calculation errors occurred
        expect(metrics.isValid).toBe(true);
        expect(metrics.infiniteExtension.totalCoverage).toBeGreaterThan(0);
        expect(metrics.infiniteExtension.patternsNeeded).toBeGreaterThan(0);
      });
    });
  });
});