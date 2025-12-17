import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PhaseManager } from './PhaseManager.js';

describe('PhaseManager', () => {
  let threePhasePattern;
  let fourPhasePattern;
  let config;

  beforeEach(() => {
    threePhasePattern = {
      type: '3-phase',
      inhale: 4,
      holdTop: 2,
      exhale: 6
    };

    fourPhasePattern = {
      type: '4-phase',
      inhale: 4,
      holdTop: 4,
      exhale: 4,
      holdBottom: 4
    };

    config = {
      diagonalLength: 200,
      maxHorizontalLength: 400
    };
  });

  describe('createPhaseSequence', () => {
    it('should create correct 3-phase sequence', () => {
      const phases = PhaseManager.createPhaseSequence(threePhasePattern, config);
      
      expect(phases).toHaveLength(3);
      expect(phases[0].name).toBe('inhale');
      expect(phases[1].name).toBe('holdTop');
      expect(phases[2].name).toBe('exhale');
      
      // Check durations match pattern
      expect(phases[0].duration).toBe(4);
      expect(phases[1].duration).toBe(2);
      expect(phases[2].duration).toBe(6);
    });

    it('should create correct 4-phase sequence for Box Breathing', () => {
      const phases = PhaseManager.createPhaseSequence(fourPhasePattern, config);
      
      expect(phases).toHaveLength(4);
      expect(phases[0].name).toBe('inhale');
      expect(phases[1].name).toBe('holdTop');
      expect(phases[2].name).toBe('exhale');
      expect(phases[3].name).toBe('holdBottom');
      
      // Check durations match pattern
      expect(phases[0].duration).toBe(4);
      expect(phases[1].duration).toBe(4);
      expect(phases[2].duration).toBe(4);
      expect(phases[3].duration).toBe(4);
    });

    it('should calculate correct segment lengths and ball speeds', () => {
      const phases = PhaseManager.createPhaseSequence(threePhasePattern, config);
      
      // Diagonal phases should use diagonal length
      expect(phases[0].segmentLength).toBe(200); // inhale
      expect(phases[2].segmentLength).toBe(200); // exhale
      
      // Hold phase should use calculated horizontal length
      expect(phases[1].segmentLength).toBe(200); // holdTop: 2s -> 50% of 400px = 200px
      
      // Ball speeds should be calculated correctly
      expect(phases[0].ballSpeed).toBe(200 / (4 * 1000)); // 200px / 4000ms
      expect(phases[1].ballSpeed).toBe(200 / (2 * 1000)); // 200px / 2000ms
      expect(phases[2].ballSpeed).toBe(200 / (6 * 1000)); // 200px / 6000ms
    });
  });

  describe('PhaseManager instance', () => {
    let phaseManager;

    beforeEach(() => {
      phaseManager = new PhaseManager(threePhasePattern, config);
    });

    it('should initialize with correct default state', () => {
      const state = phaseManager.getCurrentState();
      
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.phaseProgress).toBe(0);
      expect(state.cycleNumber).toBe(0);
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.totalPhases).toBe(3);
    });

    it('should start correctly', () => {
      phaseManager.start();
      const state = phaseManager.getCurrentState();
      
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should pause and resume correctly', () => {
      phaseManager.start();
      phaseManager.pause();
      
      let state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(true);
      
      phaseManager.resume();
      state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should stop correctly', () => {
      phaseManager.start();
      phaseManager.stop();
      
      const state = phaseManager.getCurrentState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
    });

    it('should reset to initial state', () => {
      phaseManager.start();
      phaseManager.currentPhaseIndex = 2;
      phaseManager.cycleNumber = 3;
      
      phaseManager.reset();
      const state = phaseManager.getCurrentState();
      
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.cycleNumber).toBe(0);
      expect(state.isRunning).toBe(false);
    });

    it('should calculate total cycle duration correctly', () => {
      expect(phaseManager.getTotalCycleDuration()).toBe(12); // 4 + 2 + 6
      
      const boxPhaseManager = new PhaseManager(fourPhasePattern, config);
      expect(boxPhaseManager.getTotalCycleDuration()).toBe(16); // 4 + 4 + 4 + 4
    });

    it('should update pattern correctly', () => {
      const newPattern = {
        type: '3-phase',
        inhale: 6,
        holdTop: 3,
        exhale: 9
      };
      
      phaseManager.updatePattern(newPattern);
      
      expect(phaseManager.getTotalCycleDuration()).toBe(18); // 6 + 3 + 9
      const state = phaseManager.getCurrentState();
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
    });
  });

  describe('phase transitions', () => {
    let phaseManager;

    beforeEach(() => {
      phaseManager = new PhaseManager(threePhasePattern, config);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should transition through phases correctly', () => {
      const startTime = 1000;
      vi.setSystemTime(startTime);
      
      phaseManager.start();
      
      // Initially in inhale phase
      let state = phaseManager.update(startTime);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBe(0);
      
      // Halfway through inhale (2 seconds)
      state = phaseManager.update(startTime + 2000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseProgress).toBe(0.5);
      
      // Complete inhale phase (4 seconds) - should transition to holdTop
      state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
      expect(state.phaseIndex).toBe(1);
      expect(state.phaseProgress).toBe(0);
      
      // Complete holdTop phase (2 more seconds) - should transition to exhale
      state = phaseManager.update(startTime + 6000);
      expect(state.currentPhase).toBe('exhale');
      expect(state.phaseIndex).toBe(2);
      
      // Complete exhale phase (6 more seconds) - should start new cycle
      state = phaseManager.update(startTime + 12000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.phaseIndex).toBe(0);
      expect(state.cycleNumber).toBe(1);
    });

    it('should handle Box Breathing 4-phase transitions', () => {
      phaseManager = new PhaseManager(fourPhasePattern, config);
      const startTime = 1000;
      vi.setSystemTime(startTime);
      
      phaseManager.start();
      
      // Complete all 4 phases (4s each = 16s total)
      let state = phaseManager.update(startTime + 4000);
      expect(state.currentPhase).toBe('holdTop');
      
      state = phaseManager.update(startTime + 8000);
      expect(state.currentPhase).toBe('exhale');
      
      state = phaseManager.update(startTime + 12000);
      expect(state.currentPhase).toBe('holdBottom');
      
      // Complete cycle
      state = phaseManager.update(startTime + 16000);
      expect(state.currentPhase).toBe('inhale');
      expect(state.cycleNumber).toBe(1);
    });

    it('should calculate cycle progress correctly', () => {
      const startTime = 1000;
      vi.setSystemTime(startTime);
      
      phaseManager.start();
      
      // At start of cycle
      phaseManager.update(startTime);
      expect(phaseManager.getCycleProgress()).toBe(0);
      
      // Halfway through first phase (2s out of 12s total)
      phaseManager.update(startTime + 2000);
      expect(phaseManager.getCycleProgress()).toBeCloseTo(2/12);
      
      // End of first phase (4s out of 12s total)
      phaseManager.update(startTime + 4000);
      expect(phaseManager.getCycleProgress()).toBeCloseTo(4/12);
      
      // End of second phase (6s out of 12s total)
      phaseManager.update(startTime + 6000);
      expect(phaseManager.getCycleProgress()).toBeCloseTo(6/12);
      
      // End of cycle
      phaseManager.update(startTime + 12000);
      expect(phaseManager.getCycleProgress()).toBe(0); // New cycle starts
    });
  });
});