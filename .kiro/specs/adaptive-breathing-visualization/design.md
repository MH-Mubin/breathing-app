# Design Document

## Overview

This design implements adaptive breathing visualization that dynamically adjusts horizontal line lengths and ball movement speeds based on breathing pattern configurations. The system supports both 3-phase patterns (inhale-holdTop-exhale) and 4-phase Box Breathing patterns (inhale-holdTop-exhale-holdBottom) while maintaining fixed diagonal line lengths and consistent visual structure.

## Architecture

### Component Structure
```
BreathingSession
├── BreathingVisualizer (Enhanced)
│   ├── PathCalculator (New)
│   ├── BallAnimator (Enhanced)
│   └── PhaseManager (Enhanced)
└── PatternSelector (Existing)
```

### Data Flow
1. **Pattern Selection** → PatternSelector updates selected pattern
2. **Pattern Processing** → PathCalculator computes line lengths and speeds
3. **Animation Control** → PhaseManager orchestrates 3 or 4-phase cycles
4. **Ball Movement** → BallAnimator handles speed-adjusted movement along path
5. **Visual Rendering** → BreathingVisualizer renders adaptive path and ball

## Components and Interfaces

### Enhanced BreathingVisualizer Component

**Props Interface:**
```typescript
interface BreathingVisualizerProps {
  pattern: BreathingPattern;
  running: boolean;
  onCycle: (cycle: number) => void;
}

interface BreathingPattern {
  name: string;
  inhale: number;
  holdTop: number;
  exhale: number;
  holdBottom?: number; // Only for Box Breathing
}
```

**Key Enhancements:**
- Support for 4-phase Box Breathing patterns
- Dynamic horizontal line length calculation
- Speed-adjusted ball movement for all phases
- Fixed diagonal line lengths with variable speeds

### New PathCalculator Utility

**Purpose:** Calculate adaptive line lengths, ball speeds, and path positioning based on pattern configuration

**Interface:**
```typescript
interface PathMetrics {
  topHorizontalLength: number;
  bottomHorizontalLength: number;
  diagonalLength: number; // Always fixed
  horizontalOffset: number; // New: for path positioning
  ballSpeeds: {
    inhale: number;
    holdTop: number;
    exhale: number;
    holdBottom?: number;
  };
}

function calculatePathMetrics(pattern: BreathingPattern, fixedBallPosition: number): PathMetrics
```

**Logic:**
```typescript
// Top horizontal line length calculation
function calculateTopHorizontalLength(holdTop: number, maxLength: number): number {
  if (holdTop <= 4) {
    return maxLength * (holdTop / 4); // 25%, 50%, 75%, 100%
  }
  return maxLength; // 100% for holdTop > 4s
}

// Bottom horizontal line length calculation  
function calculateBottomHorizontalLength(pattern: BreathingPattern): number {
  if (!pattern.holdBottom) {
    return 15; // Fixed 15px for 3-phase patterns
  }
  
  // Box Breathing: same logic as top line
  const maxLength = getCurrentTopHorizontalLength(); // Get current top line max length
  if (pattern.holdBottom <= 4) {
    return maxLength * (pattern.holdBottom / 4);
  }
  return maxLength;
}

// Ball speed calculation
function calculateBallSpeed(phaseDuration: number, segmentLength: number): number {
  return segmentLength / (phaseDuration * 1000); // pixels per millisecond
}

// NEW: Horizontal offset calculation for path positioning
function calculateHorizontalOffset(
  pattern: BreathingPattern, 
  fixedBallPosition: number,
  bottomHorizontalLength: number,
  diagonalHorizontal: number
): number {
  // Calculate where the bottom of up-diagonal would be in the default path
  const defaultBottomOfUpDiagonal = bottomHorizontalLength + diagonalHorizontal;
  
  // Calculate offset needed to align with fixed ball position
  return fixedBallPosition - defaultBottomOfUpDiagonal;
}
```

### Enhanced PhaseManager

**Purpose:** Manage 3-phase vs 4-phase breathing cycles

**Interface:**
```typescript
interface PhaseConfig {
  name: 'inhale' | 'holdTop' | 'exhale' | 'holdBottom';
  duration: number; // in seconds
  segmentLength: number; // in pixels
  ballSpeed: number; // pixels per millisecond
}

function createPhaseSequence(pattern: BreathingPattern): PhaseConfig[]
```

**Implementation:**
```typescript
function createPhaseSequence(pattern: BreathingPattern): PhaseConfig[] {
  const metrics = calculatePathMetrics(pattern);
  
  const phases: PhaseConfig[] = [
    {
      name: 'inhale',
      duration: pattern.inhale,
      segmentLength: metrics.diagonalLength,
      ballSpeed: metrics.ballSpeeds.inhale
    },
    {
      name: 'holdTop', 
      duration: pattern.holdTop,
      segmentLength: metrics.topHorizontalLength,
      ballSpeed: metrics.ballSpeeds.holdTop
    },
    {
      name: 'exhale',
      duration: pattern.exhale, 
      segmentLength: metrics.diagonalLength,
      ballSpeed: metrics.ballSpeeds.exhale
    }
  ];
  
  // Add 4th phase for Box Breathing
  if (pattern.holdBottom !== undefined) {
    phases.push({
      name: 'holdBottom',
      duration: pattern.holdBottom,
      segmentLength: metrics.bottomHorizontalLength,
      ballSpeed: metrics.ballSpeeds.holdBottom!
    });
  }
  
  return phases;
}
```

## Data Models

### Pattern Configuration Model

```typescript
// Base pattern interface
interface BaseBreathingPattern {
  name: string;
  inhale: number;
  holdTop: number; // Renamed from 'hold' for clarity
  exhale: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  category: 'focus' | 'stress' | 'sleep' | 'energy' | 'health' | 'emotional';
  description: string;
}

// 3-phase pattern (23 patterns)
interface ThreePhasePattern extends BaseBreathingPattern {
  type: '3-phase';
  holdBottom?: never;
}

// 4-phase Box Breathing pattern (1 pattern)
interface FourPhasePattern extends BaseBreathingPattern {
  type: '4-phase';
  holdBottom: number;
}

type BreathingPattern = ThreePhasePattern | FourPhasePattern;
```

### Animation State Model

```typescript
interface AnimationState {
  currentPhase: 'inhale' | 'holdTop' | 'exhale' | 'holdBottom' | 'idle' | 'done';
  phaseProgress: number; // 0-1
  cycleNumber: number;
  totalCycles: number;
  isRunning: boolean;
  isPaused: boolean;
  ballPosition: {
    x: number;
    y: number;
  };
  pathMetrics: PathMetrics;
}
```

### Visual Configuration Model

```typescript
interface VisualizerConfig {
  viewWidth: number; // Fixed: 700px
  viewHeight: number; // Fixed: 260px
  padding: number; // Fixed: 40px
  ballSize: number; // Fixed: 50px
  strokeWidth: number; // Fixed: 20px
  colors: {
    path: string; // '#ff6a00'
    ball: string; // '#ff6a00'
    ballShadow: string; // 'rgba(255, 106, 0, 0.6)'
  };
  diagonalAngle: number; // Fixed: 60 degrees
  minBottomLineLength: number; // Fixed: 15px
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Horizontal Line Length Proportionality
*For any* breathing pattern with holdTop duration of 1, 2, or 3 seconds, the top horizontal line length should be exactly 25%, 50%, or 75% respectively of the maximum line length
**Validates: Requirements 1.1**

### Property 2: Maximum Line Length Constraint  
*For any* breathing pattern with holdTop duration of 4 seconds or more, the top horizontal line length should be exactly 100% of the maximum line length
**Validates: Requirements 1.2, 1.3**

### Property 3: Ball Timing Accuracy
*For any* phase in any breathing pattern, the ball should take exactly the specified phase duration (in seconds) to traverse the corresponding line segment
**Validates: Requirements 1.4, 1.5**

### Property 4: Box Breathing Bottom Line Adaptation
*For any* Box Breathing pattern, the bottom horizontal line length should follow the same proportionality rules as the top horizontal line based on holdBottom duration
**Validates: Requirements 2.2, 2.3, 2.4, 2.5**

### Property 5: Three-Phase Bottom Line Consistency
*For any* 3-phase breathing pattern, the bottom horizontal line length should always be exactly 15 pixels regardless of other pattern parameters
**Validates: Requirements 2.1**

### Property 6: Diagonal Line Length Invariance
*For any* breathing pattern change, the diagonal line segment lengths should remain unchanged while only ball speed adjusts
**Validates: Requirements 3.1, 3.2**

### Property 7: Ball Path Adherence
*For any* animation frame during any breathing pattern, the ball position should lie exactly on the calculated path line and never outside it
**Validates: Requirements 3.5, 4.1**

### Property 8: Phase Sequence Correctness
*For any* 3-phase pattern, the phase sequence should be exactly [inhale, holdTop, exhale], and for Box Breathing, exactly [inhale, holdTop, exhale, holdBottom]
**Validates: Requirements 5.1, 5.2**

### Property 9: Ball Starting Position Consistency
*For any* breathing pattern and any animation cycle, the ball should always start from the bottom of the up-diagonal line position
**Validates: Requirements 4.1, 4.4**

### Property 10: Visualizer Dimension Stability
*For any* pattern change or animation state, the visualizer box width and height should remain exactly 700px and 260px respectively
**Validates: Requirements 4.2**

### Property 11: Fixed Ball Position Consistency
*For any* of the 24 breathing patterns, the ball should always appear at the exact same pixel coordinates in the viewport
**Validates: Requirements 4.1**

### Property 12: Path Alignment Accuracy
*For any* breathing pattern, the bottom of the up-diagonal line should be positioned exactly at the fixed ball position after path translation
**Validates: Requirements 5.1, 5.2**

### Property 13: Infinite Path Extension
*For any* path translation, the zigzag pattern should extend beyond both left and right viewport edges with no empty spaces
**Validates: Requirements 5.3**

## Error Handling

### Pattern Validation
- **Invalid Phase Durations**: Reject patterns with negative or zero durations
- **Missing Required Phases**: Ensure all patterns have inhale and exhale phases
- **Box Breathing Validation**: Verify holdBottom is present only for Box Breathing patterns
- **Duration Limits**: Warn for extremely long durations (>30 seconds per phase)

### Animation Error Recovery
- **Path Calculation Failures**: Fallback to default line lengths if calculation fails
- **Ball Position Errors**: Reset ball to starting position if position becomes invalid
- **Phase Transition Errors**: Skip to next valid phase if transition fails
- **Performance Degradation**: Reduce animation frame rate if performance drops

### State Management Errors
- **Pattern Switch During Animation**: Gracefully transition to new pattern without jarring stops
- **Pause/Resume State Corruption**: Maintain consistent state across pause/resume cycles
- **Memory Leaks**: Properly cleanup animation frames and event listeners

## Testing Strategy

### Unit Testing Approach
Unit tests will verify specific calculations and state transitions:
- Path calculation functions with known inputs
- Phase sequence generation for different pattern types
- Ball speed calculations for various durations
- Error handling for invalid inputs

### Jest Testing Approach
All tests will use **Jest** testing framework for unit tests, integration tests, and comprehensive behavior verification:

**Test Configuration:**
```javascript
// Jest configuration for breathing pattern testing
describe('PathCalculator', () => {
  beforeEach(() => {
    // Setup test environment
  });
  
  afterEach(() => {
    // Cleanup after tests
  });
});

// Jest test helpers for common test scenarios
function createTestPattern(inhale, holdTop, exhale, holdBottom = null) {
  return {
    type: holdBottom ? '4-phase' : '3-phase',
    inhale,
    holdTop,
    exhale,
    ...(holdBottom && { holdBottom })
  };
}

function testMultiplePatterns(testFn, patterns) {
  patterns.forEach((pattern, index) => {
    test(`should work correctly for pattern ${index + 1}`, () => {
      testFn(pattern);
    });
  });
}
```

**Jest Test Examples:**
```javascript
// **Feature: adaptive-breathing-visualization, Property 1: Horizontal Line Length Proportionality**
describe('Horizontal Line Length Calculation', () => {
  test('should return 25% length for 1 second hold', () => {
    const result = PathCalculator.calculateTopHorizontalLength(1, 400);
    expect(result).toBe(100); // 25% of 400
  });
  
  test('should return 50% length for 2 second hold', () => {
    const result = PathCalculator.calculateTopHorizontalLength(2, 400);
    expect(result).toBe(200); // 50% of 400
  });
  
  test('should return 75% length for 3 second hold', () => {
    const result = PathCalculator.calculateTopHorizontalLength(3, 400);
    expect(result).toBe(300); // 75% of 400
  });
  
  test('should return 100% length for 4+ second hold', () => {
    [4, 8, 15, 30].forEach(holdDuration => {
      const result = PathCalculator.calculateTopHorizontalLength(holdDuration, 400);
      expect(result).toBe(400); // 100% of 400
    });
  });
});

// **Feature: adaptive-breathing-visualization, Property 3: Ball Timing Accuracy**
describe('Ball Speed and Timing', () => {
  test('should calculate speed for exact timing', () => {
    const testCases = [
      { duration: 4, length: 200, expected: 200 / 4000 },
      { duration: 2, length: 100, expected: 100 / 2000 },
      { duration: 8, length: 400, expected: 400 / 8000 }
    ];
    
    testCases.forEach(({ duration, length, expected }) => {
      const speed = PathCalculator.calculateBallSpeed(duration, length);
      expect(speed).toBe(expected);
    });
  });
  
  test('should ensure traversal time matches phase duration', () => {
    const testPatterns = [
      createTestPattern(4, 2, 6),
      createTestPattern(5, 3, 7),
      createTestPattern(4, 4, 4, 4) // Box Breathing
    ];
    
    testPatterns.forEach(pattern => {
      const phases = createPhaseSequence(pattern);
      phases.forEach(phase => {
        const ballSpeed = PathCalculator.calculateBallSpeed(phase.duration, phase.segmentLength);
        const actualTraversalTime = phase.segmentLength / ballSpeed;
        const expectedTraversalTime = phase.duration * 1000;
        expect(actualTraversalTime).toBe(expectedTraversalTime);
      });
    });
  });
});
```

### Integration Testing with Jest
- Test complete breathing cycles with various patterns using Jest test suites
- Verify smooth transitions between 3-phase and 4-phase patterns with Jest mocks
- Test pause/resume functionality during different phases with Jest fake timers (`jest.useFakeTimers()`)
- Validate visual rendering matches calculated metrics using Jest DOM testing utilities
- Test path positioning and ball alignment with Jest spies and assertions

### Performance Testing with Jest
- Measure animation frame rates with complex patterns using Jest performance timing (`performance.now()`)
- Test memory usage during extended sessions with Jest memory monitoring
- Verify smooth performance with rapid pattern switching using Jest timing utilities
- Benchmark path calculation performance with edge cases using Jest's built-in timing functions
- Test animation frame cleanup and memory leak prevention with Jest lifecycle hooks