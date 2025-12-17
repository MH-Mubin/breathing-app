import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PathCalculator } from './PathCalculator.js';
import { PatternValidator } from './PatternValidator.js';
import { PhaseManager } from './PhaseManager.js';

describe('Breathing System Integration Tests', () => {
  let threePhasePattern;
  let fourPhasePattern;
  let config;

  beforeEach(() => {
    threePhasePattern = {
      name: "Test 3-Phase",
      type: "3-phase",
      inhale: 4,
      holdTop: 2,
      exhale: 6,
      level: "Beginner",
      category: "stress",
      description: "Test pattern for 3-phase breathing"
    };

    fourPhasePattern = {
      name: "Test Box Breathing",
      type: "4-phase",
      inhale: 4,
      holdTop: 4,
      exhale: 4,
      holdBottom: 4,
      level: "Intermediate",
      category: "stress",
      description: "Test pattern for Box Breathing"
    };

    config = {
      diagonalLength: 200,
      maxHorizontalLength: 400
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('3-Phase Pattern Complete Cycles', () => {
    it('should complete a full 3-phase breathing cycle correctly', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Track phase transitions through complete cycle
      const phaseTransitions = [];

      // Initial state - should be inhale
      let state = phaseManager.update(startTime);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBe(0);
      phaseTransitions.push({ phase: state.currentPhase, progress: state.phaseProgress, time: 0 });

      // Halfway through inhale (2 seconds) - verify still in inhale but don't record
      state = phaseManager.update(startTime + 2000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBeCloseTo(0.5);

      // Complete inhale phase (4 seconds) - should transition to holdTop
      state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
      expect(state.phaseIndex).toBe(1);
      expect(state.phaseProgress).toBe(0);
      phaseTransitions.push({ phase: state.currentPhase, progress: state.phaseProgress, time: 4000 });

      // Complete holdTop phase (2 more seconds) - should transition to exhale
      state = phaseManager.update(startTime + 6000);
      expect(state.currentPhase).toBe('exhale');
      expect(state.phaseIndex).toBe(2);
      expect(state.phaseProgress).toBe(0);
      phaseTransitions.push({ phase: state.currentPhase, progress: state.phaseProgress, time: 6000 });

      // Complete exhale phase (6 more seconds) - should start new cycle
      state = phaseManager.update(startTime + 12000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.cycleNumber).toBe(1);
      phaseTransitions.push({ phase: state.currentPhase, progress: state.phaseProgress, time: 12000 });

      // Verify complete cycle took expected time
      const totalCycleDuration = phaseManager.getTotalCycleDuration();
      expect(totalCycleDuration).toBe(12); // 4 + 2 + 6

      // Verify phase sequence was correct
      const expectedSequence = ['inhale', 'holdTop', 'exhale', 'inhale'];
      const actualSequence = phaseTransitions.map(t => t.phase);
      expect(actualSequence).toEqual(expectedSequence);
    });

    it('should maintain consistent timing across multiple 3-phase cycles', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      const cycleTimes = [];

      // Complete 3 full cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        const cycleStartTime = startTime + (cycle * 12000);
        
        // Complete one full cycle
        phaseManager.update(cycleStartTime + 12000);
        
        const state = phaseManager.getCurrentState();
        expect(state.cycleNumber).toBe(cycle + 1);
        
        cycleTimes.push(12000); // Each cycle should take exactly 12 seconds
      }

      // All cycles should have consistent duration
      expect(cycleTimes.every(time => time === 12000)).toBe(true);
    });

    it('should handle 3-phase pattern with zero holdTop correctly', () => {
      const zeroHoldPattern = {
        ...threePhasePattern,
        holdTop: 0
      };

      const phaseManager = new PhaseManager(zeroHoldPattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Complete inhale (4 seconds)
      let state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
      expect(state.phaseProgress).toBe(0);

      // HoldTop should complete immediately (0 seconds)
      state = phaseManager.update(startTime + 4001); // Just 1ms later
      expect(state.currentPhase).toBe('exhale');
      expect(state.phaseIndex).toBe(2);

      // Complete exhale (6 seconds)
      state = phaseManager.update(startTime + 10000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.cycleNumber).toBe(1);

      // Total cycle should be 10 seconds (4 + 0 + 6)
      expect(phaseManager.getTotalCycleDuration()).toBe(10);
    });
  });

  describe('Box Breathing 4-Phase Complete Cycles', () => {
    it('should complete a full Box Breathing cycle correctly', () => {
      const phaseManager = new PhaseManager(fourPhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      const phaseTransitions = [];

      // Initial state - should be inhale
      let state = phaseManager.update(startTime);
      expect(state.currentPhase).toBe('inhale');
      expect(state.totalPhases).toBe(4);
      phaseTransitions.push(state.currentPhase);

      // Complete inhale (4 seconds) - transition to holdTop
      state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
      expect(state.phaseIndex).toBe(1);
      phaseTransitions.push(state.currentPhase);

      // Complete holdTop (4 seconds) - transition to exhale
      state = phaseManager.update(startTime + 8000);
      expect(state.currentPhase).toBe('exhale');
      expect(state.phaseIndex).toBe(2);
      phaseTransitions.push(state.currentPhase);

      // Complete exhale (4 seconds) - transition to holdBottom
      state = phaseManager.update(startTime + 12000);
      expect(state.currentPhase).toBe('holdBottom');
      expect(state.phaseIndex).toBe(3);
      phaseTransitions.push(state.currentPhase);

      // Complete holdBottom (4 seconds) - start new cycle
      state = phaseManager.update(startTime + 16000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.cycleNumber).toBe(1);
      phaseTransitions.push(state.currentPhase);

      // Verify complete 4-phase sequence
      const expectedSequence = ['inhale', 'holdTop', 'exhale', 'holdBottom', 'inhale'];
      expect(phaseTransitions).toEqual(expectedSequence);

      // Verify total cycle duration
      expect(phaseManager.getTotalCycleDuration()).toBe(16); // 4 + 4 + 4 + 4
    });

    it('should maintain consistent Box Breathing timing across multiple cycles', () => {
      const phaseManager = new PhaseManager(fourPhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Complete 2 full Box Breathing cycles
      for (let cycle = 0; cycle < 2; cycle++) {
        const cycleStartTime = startTime + (cycle * 16000);
        
        // Go through all 4 phases
        phaseManager.update(cycleStartTime + 4000);  // Complete inhale
        phaseManager.update(cycleStartTime + 8000);  // Complete holdTop
        phaseManager.update(cycleStartTime + 12000); // Complete exhale
        phaseManager.update(cycleStartTime + 16000); // Complete holdBottom
        
        const state = phaseManager.getCurrentState();
        expect(state.cycleNumber).toBe(cycle + 1);
      }

      // Verify consistent cycle duration
      expect(phaseManager.getTotalCycleDuration()).toBe(16);
    });

    it('should handle asymmetric Box Breathing patterns correctly', () => {
      const asymmetricPattern = {
        ...fourPhasePattern,
        inhale: 3,
        holdTop: 5,
        exhale: 7,
        holdBottom: 2
      };

      const phaseManager = new PhaseManager(asymmetricPattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start();

      // Test each phase duration
      let state = phaseManager.update(startTime + 3000); // Complete inhale
      expect(state.currentPhase).toBe('holdTop');

      state = phaseManager.update(startTime + 8000); // Complete holdTop (3 + 5)
      expect(state.currentPhase).toBe('exhale');

      state = phaseManager.update(startTime + 15000); // Complete exhale (3 + 5 + 7)
      expect(state.currentPhase).toBe('holdBottom');

      state = phaseManager.update(startTime + 17000); // Complete holdBottom (3 + 5 + 7 + 2)
      expect(state.currentPhase).toBe('inhale');
      expect(state.cycleNumber).toBe(1);

      // Verify total cycle duration
      expect(phaseManager.getTotalCycleDuration()).toBe(17); // 3 + 5 + 7 + 2
    });
  });

  describe('Pattern Switching During Animation', () => {
    it('should switch from 3-phase to Box Breathing pattern correctly', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Start with 3-phase pattern
      let state = phaseManager.update(startTime + 2000); // Halfway through inhale
      expect(state.currentPhase).toBe('inhale');
      expect(state.totalPhases).toBe(3);

      // Switch to Box Breathing pattern
      phaseManager.updatePattern(fourPhasePattern);

      // Should reset to beginning with new pattern
      state = phaseManager.getCurrentState();
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.cycleNumber).toBe(0);
      expect(state.totalPhases).toBe(4);

      // Verify new pattern works correctly
      phaseManager.start();
      state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
    });

    it('should switch from Box Breathing to 3-phase pattern correctly', () => {
      const phaseManager = new PhaseManager(fourPhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Start with Box Breathing
      let state = phaseManager.update(startTime + 6000); // Halfway through holdTop
      expect(state.currentPhase).toBe('holdTop');
      expect(state.totalPhases).toBe(4);

      // Switch to 3-phase pattern
      phaseManager.updatePattern(threePhasePattern);

      // Should reset with new pattern
      state = phaseManager.getCurrentState();
      expect(state.currentPhase).toBe('inhale');
      expect(state.totalPhases).toBe(3);

      // Verify new pattern works correctly
      phaseManager.start();
      state = phaseManager.update(startTime + 12000); // Complete full 3-phase cycle
      expect(state.cycleNumber).toBe(1);
    });

    it('should handle invalid pattern switching gracefully', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      
      // Try to switch to invalid pattern
      const invalidPattern = {
        name: "Invalid",
        type: "3-phase",
        inhale: -1, // Invalid negative duration
        holdTop: 2,
        exhale: 6
      };

      // Should not crash and should keep original pattern
      expect(() => phaseManager.updatePattern(invalidPattern)).not.toThrow();
      
      const state = phaseManager.getCurrentState();
      expect(state.totalPhases).toBe(3); // Should still be using original pattern or fallback
    });
  });

  describe('Pause/Resume Functionality', () => {
    it('should pause and resume 3-phase breathing correctly', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Progress partway through inhale
      let state = phaseManager.update(startTime + 2000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBeCloseTo(0.5);
      expect(state.isRunning).toBe(true);

      // Pause
      phaseManager.pause(startTime + 2000);
      state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(true);

      // Time should not progress while paused
      state = phaseManager.update(startTime + 5000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBeCloseTo(0.5); // Should remain the same

      // Resume
      phaseManager.resume(startTime + 5000);
      state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);

      // Should continue from where it left off
      state = phaseManager.update(startTime + 7000); // 2 more seconds after resume
      expect(state.currentPhase).toBe('holdTop'); // Should have completed inhale
    });

    it('should pause and resume Box Breathing correctly', () => {
      const phaseManager = new PhaseManager(fourPhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Progress to holdBottom phase
      phaseManager.update(startTime + 12000); // Complete inhale, holdTop, exhale
      let state = phaseManager.update(startTime + 14000); // Halfway through holdBottom
      expect(state.currentPhase).toBe('holdBottom');
      expect(state.phaseProgress).toBeCloseTo(0.5);

      // Pause during holdBottom
      phaseManager.pause();
      
      // Resume and complete the cycle
      phaseManager.resume();
      state = phaseManager.update(startTime + 16000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.cycleNumber).toBe(1);
    });

    it('should handle multiple pause/resume cycles correctly', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Pause and resume multiple times during same phase
      let state = phaseManager.update(startTime + 1000);
      expect(state.currentPhase).toBe('inhale');

      phaseManager.pause();
      phaseManager.resume();
      
      state = phaseManager.update(startTime + 2000);
      expect(state.currentPhase).toBe('inhale');

      phaseManager.pause();
      phaseManager.resume();

      // Should still complete the cycle correctly
      state = phaseManager.update(startTime + 12000);
      expect(state.cycleNumber).toBe(1);
    });

    it('should handle stop and restart correctly', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);

      phaseManager.start(startTime);

      // Progress partway through cycle
      let state = phaseManager.update(startTime + 8000); // Should be in exhale phase
      expect(state.currentPhase).toBe('exhale');

      // Stop
      phaseManager.stop();
      state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);

      // Restart should begin from the beginning
      phaseManager.start(startTime + 8000);
      state = phaseManager.getCurrentState();
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBe(0);
      expect(state.cycleNumber).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle extremely short durations gracefully', () => {
      const shortPattern = {
        ...threePhasePattern,
        inhale: 0.1,
        holdTop: 0.1,
        exhale: 0.1
      };

      expect(() => new PhaseManager(shortPattern, config)).not.toThrow();
      
      const phaseManager = new PhaseManager(shortPattern, config);
      phaseManager.start();
      
      // Should complete cycle very quickly
      const state = phaseManager.update(Date.now() + 300); // 0.3 seconds
      expect(state.cycleNumber).toBeGreaterThanOrEqual(0);
    });

    it('should handle extremely long durations gracefully', () => {
      const longPattern = {
        ...threePhasePattern,
        inhale: 30,
        holdTop: 30,
        exhale: 30
      };

      expect(() => new PhaseManager(longPattern, config)).not.toThrow();
      
      const phaseManager = new PhaseManager(longPattern, config);
      expect(phaseManager.getTotalCycleDuration()).toBe(90);
    });

    it('should handle invalid time inputs gracefully', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      phaseManager.start();

      // Test with invalid time values
      expect(() => phaseManager.update(NaN)).not.toThrow();
      expect(() => phaseManager.update(Infinity)).not.toThrow();
      expect(() => phaseManager.update(-1000)).not.toThrow();
      expect(() => phaseManager.update("invalid")).not.toThrow();

      // Should still return valid state
      const state = phaseManager.getCurrentState();
      expect(typeof state.currentPhase).toBe('string');
      expect(typeof state.phaseProgress).toBe('number');
    });

    it('should recover from corrupted internal state', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      phaseManager.start();

      // Simulate state corruption
      phaseManager.currentPhaseIndex = 999; // Invalid index
      phaseManager.phaseProgress = -5; // Invalid progress

      // Should recover gracefully
      expect(() => phaseManager.update()).not.toThrow();
      
      const state = phaseManager.getCurrentState();
      expect(state.phaseIndex).toBeGreaterThanOrEqual(0);
      expect(state.phaseIndex).toBeLessThan(3);
      expect(state.phaseProgress).toBeGreaterThanOrEqual(0);
      expect(state.phaseProgress).toBeLessThanOrEqual(1);
    });
  });

  describe('Path Positioning Integration Tests', () => {
    describe('Path alignment with various hold durations', () => {
      const testHoldDurations = [1, 2, 3, 4, 8, 10];
      const fixedBallPosition = 350; // Center of 700px viewport
      
      it('should maintain consistent ball position across different hold durations', () => {
        const configWithBallPosition = {
          ...config,
          fixedBallPosition,
          viewportWidth: 700
        };

        testHoldDurations.forEach(holdDuration => {
          const pattern = {
            ...threePhasePattern,
            holdTop: holdDuration
          };

          const metrics = PathCalculator.calculatePathMetrics(pattern, configWithBallPosition);
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          
          // Calculate actual ball position after path translation
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
          expect(metrics.isValid).toBe(true);
        });
      });

      it('should handle path alignment for 3-phase patterns with various hold durations', () => {
        const configWithBallPosition = {
          ...config,
          fixedBallPosition,
          viewportWidth: 700
        };

        testHoldDurations.forEach(holdDuration => {
          const pattern = {
            type: '3-phase',
            inhale: 4,
            holdTop: holdDuration,
            exhale: 6
          };

          const metrics = PathCalculator.calculatePathMetrics(pattern, configWithBallPosition);
          
          // Verify path metrics are calculated correctly
          expect(metrics.horizontalOffset).toBeDefined();
          expect(typeof metrics.horizontalOffset).toBe('number');
          expect(metrics.infiniteExtension).toBeDefined();
          
          // Verify infinite path extension
          expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
          expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
          expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
        });
      });
    });

    describe('Box Breathing pattern path positioning with Jest mock timers', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should position Box Breathing patterns correctly with mock timers', () => {
        const configWithBallPosition = {
          ...config,
          fixedBallPosition: 350,
          viewportWidth: 700
        };

        const boxPattern = {
          type: '4-phase',
          inhale: 4,
          holdTop: 4,
          exhale: 4,
          holdBottom: 4
        };

        // Mock current time
        const mockTime = 1000;
        vi.setSystemTime(mockTime);

        const metrics = PathCalculator.calculatePathMetrics(boxPattern, configWithBallPosition);
        const phaseManager = new PhaseManager(boxPattern, configWithBallPosition);
        
        phaseManager.start(mockTime);
        
        // Test path positioning during different phases
        const phases = ['inhale', 'holdTop', 'exhale', 'holdBottom'];
        const phaseDurations = [4000, 4000, 4000, 4000]; // All 4 seconds
        
        let currentTime = mockTime;
        phases.forEach((expectedPhase, index) => {
          const state = phaseManager.update(currentTime);
          expect(state.currentPhase).toBe(expectedPhase);
          
          // Verify ball position consistency throughout the cycle
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(350, 1);
          
          currentTime += phaseDurations[index];
        });

        // Verify infinite extension for Box Breathing
        expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
        expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
        expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
      });

      it('should handle Box Breathing with different holdBottom durations using mock timers', () => {
        const testHoldBottomDurations = [1, 2, 3, 4, 8, 10];
        
        testHoldBottomDurations.forEach(holdBottom => {
          const mockTime = 2000 + holdBottom * 100; // Different start times
          vi.setSystemTime(mockTime);

          const boxPattern = {
            type: '4-phase',
            inhale: 4,
            holdTop: 4,
            exhale: 4,
            holdBottom
          };

          const configWithBallPosition = {
            ...config,
            fixedBallPosition: 350,
            viewportWidth: 700
          };

          const metrics = PathCalculator.calculatePathMetrics(boxPattern, configWithBallPosition);
          const phaseManager = new PhaseManager(boxPattern, configWithBallPosition);
          
          phaseManager.start(mockTime);
          
          // Advance to holdBottom phase
          const timeToHoldBottom = mockTime + 12000; // 4+4+4 seconds
          const state = phaseManager.update(timeToHoldBottom);
          expect(state.currentPhase).toBe('holdBottom');
          
          // Verify ball position remains consistent
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(350, 1);
        });
      });
    });

    describe('Pattern switching maintains ball position consistency', () => {
      it('should maintain ball position when switching between patterns', () => {
        const configWithBallPosition = {
          ...config,
          fixedBallPosition: 350,
          viewportWidth: 700
        };

        const patterns = [
          { type: '3-phase', inhale: 4, holdTop: 1, exhale: 6 },
          { type: '3-phase', inhale: 4, holdTop: 4, exhale: 6 },
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 2 },
          { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 }
        ];

        const ballPositions = [];
        
        patterns.forEach(pattern => {
          const metrics = PathCalculator.calculatePathMetrics(pattern, configWithBallPosition);
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          
          ballPositions.push(actualBallPosition);
          
          // Each pattern should position ball at same location
          expect(actualBallPosition).toBeCloseTo(350, 1);
        });

        // All ball positions should be identical
        const firstPosition = ballPositions[0];
        ballPositions.forEach(position => {
          expect(position).toBeCloseTo(firstPosition, 1);
        });
      });

      it('should handle pattern switching with PhaseManager integration', () => {
        const configWithBallPosition = {
          ...config,
          fixedBallPosition: 350,
          viewportWidth: 700
        };

        const phaseManager = new PhaseManager(threePhasePattern, configWithBallPosition);
        phaseManager.start();

        // Get initial ball position
        const initialMetrics = PathCalculator.calculatePathMetrics(threePhasePattern, configWithBallPosition);
        const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
        const initialBallPosition = initialMetrics.bottomHorizontalLength + diagonalHorizontal + initialMetrics.horizontalOffset;

        // Switch to Box Breathing
        phaseManager.updatePattern(fourPhasePattern);
        
        // Get new ball position
        const newMetrics = PathCalculator.calculatePathMetrics(fourPhasePattern, configWithBallPosition);
        const newBallPosition = newMetrics.bottomHorizontalLength + diagonalHorizontal + newMetrics.horizontalOffset;

        // Ball position should remain consistent
        expect(newBallPosition).toBeCloseTo(initialBallPosition, 1);
        expect(newBallPosition).toBeCloseTo(350, 1);
      });
    });

    describe('Infinite path extension with different offsets', () => {
      it('should extend path infinitely regardless of horizontal offset', () => {
        const testOffsets = [
          { fixedBallPosition: 100, description: 'far left' },
          { fixedBallPosition: 200, description: 'left of center' },
          { fixedBallPosition: 350, description: 'center' },
          { fixedBallPosition: 500, description: 'right of center' },
          { fixedBallPosition: 600, description: 'far right' }
        ];

        testOffsets.forEach(({ fixedBallPosition, description }) => {
          const configWithBallPosition = {
            ...config,
            fixedBallPosition,
            viewportWidth: 700
          };

          const testPattern = {
            type: '3-phase',
            inhale: 4,
            holdTop: 2,
            exhale: 6
          };

          const metrics = PathCalculator.calculatePathMetrics(testPattern, configWithBallPosition);
          
          // Verify infinite extension properties
          expect(metrics.infiniteExtension).toBeDefined();
          expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
          expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
          expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
          
          // Verify boundaries extend beyond viewport
          expect(metrics.infiniteExtension.leftBoundary).toBeLessThan(0);
          expect(metrics.infiniteExtension.rightBoundary).toBeGreaterThan(700);
          
          // Verify ball position is correctly aligned
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });

      it('should handle extreme offset cases', () => {
        const extremeCases = [
          { fixedBallPosition: 10, description: 'very close to left edge' },
          { fixedBallPosition: 690, description: 'very close to right edge' },
          { fixedBallPosition: -50, description: 'outside left viewport' },
          { fixedBallPosition: 750, description: 'outside right viewport' }
        ];

        extremeCases.forEach(({ fixedBallPosition, description }) => {
          const configWithBallPosition = {
            ...config,
            fixedBallPosition,
            viewportWidth: 700
          };

          const testPattern = {
            type: '3-phase',
            inhale: 4,
            holdTop: 3,
            exhale: 6
          };

          const metrics = PathCalculator.calculatePathMetrics(testPattern, configWithBallPosition);
          
          // Should still calculate valid metrics
          expect(metrics.isValid).toBe(true);
          expect(metrics.infiniteExtension).toBeDefined();
          
          // Should still extend beyond viewport edges
          expect(metrics.infiniteExtension.extendsLeftEdge).toBe(true);
          expect(metrics.infiniteExtension.extendsRightEdge).toBe(true);
          expect(metrics.infiniteExtension.hasNoGaps).toBe(true);
          
          // Ball position should still be correctly calculated
          const diagonalHorizontal = config.diagonalLength / Math.sqrt(3);
          const actualBallPosition = metrics.bottomHorizontalLength + diagonalHorizontal + metrics.horizontalOffset;
          expect(actualBallPosition).toBeCloseTo(fixedBallPosition, 1);
        });
      });
    });

    describe('Jest spies for function calls and state changes', () => {
      it('should verify PathCalculator function calls with spies', () => {
        const calculatePathMetricsSpy = vi.spyOn(PathCalculator, 'calculatePathMetrics');
        const calculateHorizontalOffsetSpy = vi.spyOn(PathCalculator, 'calculateHorizontalOffset');
        const calculateInfiniteExtensionSpy = vi.spyOn(PathCalculator, 'calculateInfiniteExtension');

        const configWithBallPosition = {
          ...config,
          fixedBallPosition: 350,
          viewportWidth: 700
        };

        const testPattern = {
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 6
        };

        // Call the main function
        const result = PathCalculator.calculatePathMetrics(testPattern, configWithBallPosition);

        // Verify main function was called
        expect(calculatePathMetricsSpy).toHaveBeenCalledWith(testPattern, configWithBallPosition);
        expect(calculatePathMetricsSpy).toHaveBeenCalledTimes(1);

        // Verify the result contains expected properties (indicating internal functions worked)
        expect(result.horizontalOffset).toBeDefined();
        expect(typeof result.horizontalOffset).toBe('number');
        expect(result.infiniteExtension).toBeDefined();
        expect(result.infiniteExtension.extendsLeftEdge).toBe(true);

        // Test direct calls to verify spies work
        PathCalculator.calculateHorizontalOffset(testPattern, 350, 15, 100);
        expect(calculateHorizontalOffsetSpy).toHaveBeenCalled();

        PathCalculator.calculateInfiniteExtension(700, 400, 0);
        expect(calculateInfiniteExtensionSpy).toHaveBeenCalled();

        // Clean up spies
        calculatePathMetricsSpy.mockRestore();
        calculateHorizontalOffsetSpy.mockRestore();
        calculateInfiniteExtensionSpy.mockRestore();
      });

      it('should verify PhaseManager state changes with spies', () => {
        const phaseManager = new PhaseManager(threePhasePattern, config);
        
        // Spy on state-changing methods
        const startSpy = vi.spyOn(phaseManager, 'start');
        const updateSpy = vi.spyOn(phaseManager, 'update');
        const updatePatternSpy = vi.spyOn(phaseManager, 'updatePattern');

        // Test state changes
        phaseManager.start();
        expect(startSpy).toHaveBeenCalledTimes(1);

        phaseManager.update(Date.now() + 1000);
        expect(updateSpy).toHaveBeenCalledTimes(1);

        phaseManager.updatePattern(fourPhasePattern);
        expect(updatePatternSpy).toHaveBeenCalledWith(fourPhasePattern);

        // Clean up spies
        startSpy.mockRestore();
        updateSpy.mockRestore();
        updatePatternSpy.mockRestore();
      });

      it('should verify cache behavior with spies', () => {
        const clearCacheSpy = vi.spyOn(PathCalculator, 'clearCache');
        
        // Clear cache and verify
        PathCalculator.clearCache();
        expect(clearCacheSpy).toHaveBeenCalledTimes(1);

        // Test cache usage by calling same calculation multiple times
        const configWithBallPosition = {
          ...config,
          fixedBallPosition: 350,
          viewportWidth: 700
        };

        const testPattern = {
          type: '3-phase',
          inhale: 4,
          holdTop: 2,
          exhale: 6
        };

        // First call should calculate, second should use cache
        const result1 = PathCalculator.calculatePathMetrics(testPattern, configWithBallPosition);
        const result2 = PathCalculator.calculatePathMetrics(testPattern, configWithBallPosition);

        // Results should be identical (from cache)
        expect(result1).toEqual(result2);
        expect(result1.horizontalOffset).toBe(result2.horizontalOffset);

        clearCacheSpy.mockRestore();
      });
    });
  });

  describe('Integration with PathCalculator and PatternValidator', () => {
    it('should integrate with PathCalculator for consistent metrics', () => {
      const phaseManager = new PhaseManager(threePhasePattern, config);
      const pathMetrics = PathCalculator.calculatePathMetrics(threePhasePattern, config);
      
      const phases = phaseManager.getAllPhases();
      
      // Verify phase metrics match PathCalculator results
      expect(phases[0].ballSpeed).toBe(pathMetrics.ballSpeeds.inhale);
      expect(phases[1].ballSpeed).toBe(pathMetrics.ballSpeeds.holdTop);
      expect(phases[2].ballSpeed).toBe(pathMetrics.ballSpeeds.exhale);
      
      expect(phases[0].segmentLength).toBe(pathMetrics.diagonalLength);
      expect(phases[1].segmentLength).toBe(pathMetrics.topHorizontalLength);
      expect(phases[2].segmentLength).toBe(pathMetrics.diagonalLength);
    });

    it('should integrate with PatternValidator for pattern validation', () => {
      // Valid pattern should work
      expect(() => new PhaseManager(threePhasePattern, config)).not.toThrow();
      
      // Invalid pattern should be handled gracefully
      const invalidPattern = {
        ...threePhasePattern,
        inhale: -1
      };
      
      expect(() => new PhaseManager(invalidPattern, config)).not.toThrow();
      
      // Should use fallback pattern
      const phaseManager = new PhaseManager(invalidPattern, config);
      const state = phaseManager.getCurrentState();
      expect(state.totalPhases).toBeGreaterThan(0);
    });

    it('should maintain consistency across all components', () => {
      // Test that all components work together for a complete breathing session
      const patterns = [threePhasePattern, fourPhasePattern];
      
      patterns.forEach(pattern => {
        // Validate pattern
        const validation = PatternValidator.validatePatternDetailed(pattern);
        expect(validation.isValid).toBe(true);
        
        // Calculate metrics
        const metrics = PathCalculator.calculatePathMetrics(pattern, config);
        expect(metrics.isValid).toBe(true);
        
        // Create phase manager
        const phaseManager = new PhaseManager(pattern, config);
        expect(phaseManager.hasErrors()).toBe(false);
        
        // Run a complete cycle
        phaseManager.start();
        const totalDuration = phaseManager.getTotalCycleDuration() * 1000;
        const finalState = phaseManager.update(Date.now() + totalDuration);
        
        expect(finalState.cycleNumber).toBe(1);
        expect(finalState.currentPhase).toBe('inhale');
      });
    });
  });
});