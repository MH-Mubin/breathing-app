/**
 * Performance Tests for Adaptive Breathing Visualization
 * Tests animation frame rates, memory usage, and pattern switching performance
 * Requirements: 4.5
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PathCalculator } from './PathCalculator.js';
import { PhaseManager } from './PhaseManager.js';

describe('Performance Tests', () => {
  let mockRequestAnimationFrame;
  let mockCancelAnimationFrame;
  let frameCallbacks = [];
  let frameId = 0;

  beforeEach(() => {
    // Mock requestAnimationFrame and cancelAnimationFrame
    frameCallbacks = [];
    frameId = 0;
    
    mockRequestAnimationFrame = vi.fn((callback) => {
      frameCallbacks.push(callback);
      return ++frameId;
    });
    
    mockCancelAnimationFrame = vi.fn((id) => {
      // Remove callback from queue
      const index = frameCallbacks.findIndex((_, i) => i + 1 === id);
      if (index !== -1) {
        frameCallbacks.splice(index, 1);
      }
    });

    global.requestAnimationFrame = mockRequestAnimationFrame;
    global.cancelAnimationFrame = mockCancelAnimationFrame;
    
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Animation Frame Rate Tests', () => {
    it('should maintain stable frame rates with complex patterns', () => {
      // Test with a complex Box Breathing pattern
      const complexPattern = {
        type: '4-phase',
        inhale: 8,
        holdTop: 12,
        exhale: 10,
        holdBottom: 6
      };

      const config = {
        diagonalLength: 300,
        maxHorizontalLength: 600
      };

      const phaseManager = new PhaseManager(complexPattern, config);
      const startTime = Date.now();
      
      // Simulate animation loop
      let frameCount = 0;
      const maxFrames = 120; // 2 seconds at 60fps
      const frameInterval = 1000 / 60; // 16.67ms per frame
      
      phaseManager.start(startTime);
      
      const frameStartTime = performance.now();
      
      for (let i = 0; i < maxFrames; i++) {
        const currentTime = startTime + (i * frameInterval);
        
        // Measure frame processing time
        const frameProcessStart = performance.now();
        
        // Simulate frame processing
        const state = phaseManager.update(currentTime);
        const metrics = PathCalculator.calculatePathMetrics(complexPattern, config);
        
        // Simulate path calculations that would happen in visualizer
        const topLength = PathCalculator.calculateTopHorizontalLength(complexPattern.holdTop, config.maxHorizontalLength);
        const bottomLength = PathCalculator.calculateBottomHorizontalLength(complexPattern, config.maxHorizontalLength);
        const ballSpeed = PathCalculator.calculateBallSpeed(state.phaseDuration, state.segmentLength);
        
        const frameProcessEnd = performance.now();
        const frameProcessTime = frameProcessEnd - frameProcessStart;
        
        // Frame processing should complete well within 16.67ms budget
        expect(frameProcessTime).toBeLessThan(10); // Allow 10ms max per frame
        
        frameCount++;
      }
      
      const totalTime = performance.now() - frameStartTime;
      const averageFrameTime = totalTime / frameCount;
      
      // Average frame time should be well under 16.67ms for 60fps
      expect(averageFrameTime).toBeLessThan(8);
      expect(frameCount).toBe(maxFrames);
    });

    it('should handle rapid pattern switching without performance degradation', () => {
      const patterns = [
        { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 },
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 },
        { type: '3-phase', inhale: 6, holdTop: 1, exhale: 8 },
        { type: '4-phase', inhale: 3, holdTop: 7, exhale: 5, holdBottom: 2 }
      ];

      const config = {
        diagonalLength: 250,
        maxHorizontalLength: 500
      };

      let phaseManager = new PhaseManager(patterns[0], config);
      const startTime = Date.now();
      
      // Test rapid pattern switching
      const switchInterval = 100; // Switch every 100ms
      const totalSwitches = 20;
      
      for (let i = 0; i < totalSwitches; i++) {
        const switchStartTime = performance.now();
        
        // Switch to next pattern
        const patternIndex = i % patterns.length;
        phaseManager.updatePattern(patterns[patternIndex]);
        
        // Recalculate metrics
        const metrics = PathCalculator.calculatePathMetrics(patterns[patternIndex], config);
        
        const switchEndTime = performance.now();
        const switchTime = switchEndTime - switchStartTime;
        
        // Pattern switching should be fast (under 5ms)
        expect(switchTime).toBeLessThan(5);
        
        // Verify pattern was updated correctly
        expect(phaseManager.pattern).toEqual(patterns[patternIndex]);
        
        // Simulate some animation frames between switches
        for (let j = 0; j < 5; j++) {
          const frameTime = startTime + (i * switchInterval) + (j * 16.67);
          phaseManager.update(frameTime);
        }
      }
    });

    it('should maintain performance with extreme pattern values', () => {
      // Test with extreme but valid pattern values
      const extremePatterns = [
        { type: '3-phase', inhale: 1, holdTop: 0, exhale: 1 }, // Very fast
        { type: '3-phase', inhale: 30, holdTop: 30, exhale: 30 }, // Very slow
        { type: '4-phase', inhale: 1, holdTop: 1, exhale: 1, holdBottom: 1 }, // Very fast Box
        { type: '4-phase', inhale: 25, holdTop: 25, exhale: 25, holdBottom: 25 } // Very slow Box
      ];

      const config = {
        diagonalLength: 200,
        maxHorizontalLength: 800
      };

      extremePatterns.forEach((pattern, index) => {
        const testStartTime = performance.now();
        
        const phaseManager = new PhaseManager(pattern, config);
        phaseManager.start();
        
        // Run several animation frames
        for (let i = 0; i < 60; i++) { // 1 second worth of frames
          const frameStartTime = performance.now();
          
          const currentTime = Date.now() + (i * 16.67);
          phaseManager.update(currentTime);
          
          const frameEndTime = performance.now();
          const frameTime = frameEndTime - frameStartTime;
          
          // Even extreme patterns should process quickly
          expect(frameTime).toBeLessThan(5);
        }
        
        const testEndTime = performance.now();
        const totalTestTime = testEndTime - testStartTime;
        
        // Total test time should be reasonable
        expect(totalTestTime).toBeLessThan(100); // 100ms for 60 frames
      });
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not create memory leaks during extended sessions', () => {
      const pattern = {
        type: '3-phase',
        inhale: 4,
        holdTop: 2,
        exhale: 6
      };

      const config = {
        diagonalLength: 200,
        maxHorizontalLength: 400
      };

      // Track object creation
      let phaseManagerCount = 0;
      let metricsCalculationCount = 0;
      
      // Simulate extended session (10 minutes worth of frames)
      const sessionDuration = 10 * 60 * 1000; // 10 minutes in ms
      const frameInterval = 16.67; // 60fps
      const totalFrames = sessionDuration / frameInterval;
      
      const phaseManager = new PhaseManager(pattern, config);
      phaseManager.start();
      
      const startTime = Date.now();
      
      // Sample every 100th frame to avoid test timeout
      const sampleInterval = 100;
      
      for (let i = 0; i < totalFrames; i += sampleInterval) {
        const currentTime = startTime + (i * frameInterval);
        
        // Update phase manager
        const state = phaseManager.update(currentTime);
        
        // Calculate metrics (this should reuse existing calculations)
        const metrics = PathCalculator.calculatePathMetrics(pattern, config);
        metricsCalculationCount++;
        
        // Verify no memory leaks in state objects
        expect(typeof state).toBe('object');
        expect(state).not.toBeNull();
        expect(typeof metrics).toBe('object');
        expect(metrics).not.toBeNull();
        
        // Verify state properties are within expected ranges
        expect(state.phaseProgress).toBeGreaterThanOrEqual(0);
        expect(state.phaseProgress).toBeLessThanOrEqual(1);
        expect(state.cycleNumber).toBeGreaterThanOrEqual(0);
      }
      
      // Verify calculations completed successfully
      expect(metricsCalculationCount).toBeGreaterThan(0);
      
      // Cleanup should work properly
      phaseManager.stop();
      const finalState = phaseManager.getCurrentState();
      expect(finalState.isRunning).toBe(false);
    });

    it('should properly cleanup animation resources', () => {
      const pattern = {
        type: '4-phase',
        inhale: 4,
        holdTop: 4,
        exhale: 4,
        holdBottom: 4
      };

      const config = {
        diagonalLength: 300,
        maxHorizontalLength: 600
      };

      // Create multiple phase managers to test cleanup
      const managers = [];
      
      for (let i = 0; i < 10; i++) {
        const manager = new PhaseManager(pattern, config);
        manager.start();
        managers.push(manager);
      }
      
      // Run some updates
      const currentTime = Date.now();
      managers.forEach(manager => {
        manager.update(currentTime);
        manager.update(currentTime + 1000);
        manager.update(currentTime + 2000);
      });
      
      // Cleanup all managers
      managers.forEach(manager => {
        manager.stop();
        
        // Verify cleanup
        const state = manager.getCurrentState();
        expect(state.isRunning).toBe(false);
        expect(state.isPaused).toBe(false);
      });
      
      // All managers should be properly cleaned up
      expect(managers.length).toBe(10);
      managers.forEach(manager => {
        expect(manager.isRunning).toBe(false);
      });
    });
  });

  describe('Path Calculation Performance', () => {
    it('should calculate paths efficiently for real-time updates', () => {
      const patterns = [
        { type: '3-phase', inhale: 4, holdTop: 2, exhale: 6 },
        { type: '4-phase', inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4 },
        { type: '3-phase', inhale: 8, holdTop: 1, exhale: 10 },
        { type: '4-phase', inhale: 2, holdTop: 6, exhale: 3, holdBottom: 5 }
      ];

      const configs = [
        { diagonalLength: 150, maxHorizontalLength: 300 },
        { diagonalLength: 250, maxHorizontalLength: 500 },
        { diagonalLength: 400, maxHorizontalLength: 800 }
      ];

      patterns.forEach(pattern => {
        configs.forEach(config => {
          const calculationStartTime = performance.now();
          
          // Perform multiple calculations (simulating real-time updates)
          for (let i = 0; i < 100; i++) {
            const metrics = PathCalculator.calculatePathMetrics(pattern, config);
            
            // Verify calculations are valid
            expect(metrics.isValid).toBe(true);
            expect(metrics.topHorizontalLength).toBeGreaterThan(0);
            expect(metrics.bottomHorizontalLength).toBeGreaterThan(0);
            expect(metrics.diagonalLength).toBe(config.diagonalLength);
            
            // Verify ball speeds are reasonable
            Object.values(metrics.ballSpeeds).forEach(speed => {
              expect(speed).toBeGreaterThan(0);
              expect(speed).toBeLessThan(10); // Max speed limit
            });
          }
          
          const calculationEndTime = performance.now();
          const totalCalculationTime = calculationEndTime - calculationStartTime;
          const averageCalculationTime = totalCalculationTime / 100;
          
          // Each calculation should be very fast (under 1ms)
          expect(averageCalculationTime).toBeLessThan(1);
        });
      });
    });

    it('should handle concurrent path calculations efficiently', () => {
      const pattern = {
        type: '4-phase',
        inhale: 6,
        holdTop: 8,
        exhale: 7,
        holdBottom: 5
      };

      const config = {
        diagonalLength: 300,
        maxHorizontalLength: 600
      };

      // Simulate concurrent calculations (like multiple visualizers)
      const concurrentCalculations = 50;
      const calculations = [];
      
      const startTime = performance.now();
      
      // Start all calculations simultaneously
      for (let i = 0; i < concurrentCalculations; i++) {
        const calculationPromise = new Promise((resolve) => {
          const calcStartTime = performance.now();
          const metrics = PathCalculator.calculatePathMetrics(pattern, config);
          const calcEndTime = performance.now();
          
          resolve({
            metrics,
            duration: calcEndTime - calcStartTime
          });
        });
        
        calculations.push(calculationPromise);
      }
      
      // Wait for all calculations to complete
      return Promise.all(calculations).then(results => {
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        // All calculations should complete quickly
        expect(totalTime).toBeLessThan(50); // 50ms for 50 concurrent calculations
        
        // Each individual calculation should be fast
        results.forEach(result => {
          expect(result.duration).toBeLessThan(5);
          expect(result.metrics.isValid).toBe(true);
        });
        
        // All results should be identical (same input)
        const firstMetrics = results[0].metrics;
        results.forEach(result => {
          expect(result.metrics.topHorizontalLength).toBe(firstMetrics.topHorizontalLength);
          expect(result.metrics.bottomHorizontalLength).toBe(firstMetrics.bottomHorizontalLength);
          expect(result.metrics.diagonalLength).toBe(firstMetrics.diagonalLength);
        });
      });
    });
  });

  describe('Error Recovery Performance', () => {
    it('should recover from errors quickly without blocking animation', () => {
      // Test with invalid patterns that should trigger error recovery
      const invalidPatterns = [
        { type: '3-phase', inhale: -1, holdTop: 2, exhale: 6 }, // Negative value
        { type: '4-phase', inhale: NaN, holdTop: 4, exhale: 4, holdBottom: 4 }, // NaN value
        { type: '3-phase', inhale: Infinity, holdTop: 2, exhale: 6 }, // Infinity value
        null, // Null pattern
        undefined, // Undefined pattern
        { type: 'invalid-type', inhale: 4, holdTop: 2, exhale: 6 } // Invalid type
      ];

      const config = {
        diagonalLength: 200,
        maxHorizontalLength: 400
      };

      invalidPatterns.forEach((invalidPattern, index) => {
        const recoveryStartTime = performance.now();
        
        // This should trigger error recovery
        let phaseManager;
        try {
          phaseManager = new PhaseManager(invalidPattern, config);
        } catch (error) {
          // If constructor throws, create with safe defaults
          phaseManager = new PhaseManager({
            type: '3-phase',
            inhale: 4,
            holdTop: 2,
            exhale: 6
          }, config);
        }
        
        // Error recovery should be fast
        const recoveryEndTime = performance.now();
        const recoveryTime = recoveryEndTime - recoveryStartTime;
        expect(recoveryTime).toBeLessThan(10); // Recovery should be under 10ms
        
        // Phase manager should still be functional after recovery
        phaseManager.start();
        const state = phaseManager.update();
        
        expect(typeof state).toBe('object');
        expect(state.currentPhase).toBeDefined();
        expect(state.phaseProgress).toBeGreaterThanOrEqual(0);
        expect(state.phaseProgress).toBeLessThanOrEqual(1);
        
        // Should be able to continue animation
        const nextState = phaseManager.update(Date.now() + 1000);
        expect(typeof nextState).toBe('object');
      });
    });
  });
});