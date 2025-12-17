# Implementation Plan

- [x] 1. Create path calculation utilities








  - Create PathCalculator utility class with pure functions for line length and speed calculations
  - Implement calculateTopHorizontalLength function with 4-second threshold logic
  - Implement calculateBottomHorizontalLength function for 3-phase vs Box Breathing patterns
  - Implement calculateBallSpeed function for timing accuracy
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 5.3_

- [x] 1.1 Write property test for horizontal line length calculation



  - **Property 1: Horizontal Line Length Proportionality**
  - **Validates: Requirements 1.1**

- [x] 1.2 Write property test for maximum line length constraint

  - **Property 2: Maximum Line Length Constraint**
  - **Validates: Requirements 1.2, 1.3**

- [x] 1.3 Write property test for ball speed calculation accuracy

  - **Property 3: Ball Timing Accuracy**
  - **Validates: Requirements 1.4, 1.5, 3.3**

- [x] 2. Enhance pattern data model




  - Update BreathingPattern interface to support holdTop and holdBottom phases
  - Add pattern type discrimination for 3-phase vs 4-phase patterns
  - Update existing pattern configurations to use holdTop instead of hold
  - Add Box Breathing pattern with 4-phase configuration
  - _Requirements: 5.1, 5.2_

- [x] 2.1 Write property test for pattern type validation

  - **Property 8: Phase Sequence Correctness**
  - **Validates: Requirements 5.1, 5.2**

- [x] 3. Create enhanced phase management system




  - Implement PhaseManager class to handle 3-phase and 4-phase cycles
  - Create createPhaseSequence function for dynamic phase generation
  - Add phase transition logic with proper timing
  - Implement phase state management with pause/resume support
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 3.1 Write property test for Box Breathing bottom line adaptation

  - **Property 4: Box Breathing Bottom Line Adaptation**
  - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 3.2 Write property test for three-phase bottom line consistency

  - **Property 5: Three-Phase Bottom Line Consistency**
  - **Validates: Requirements 2.1**

- [x] 4. Update BreathingVisualizer component










  - Integrate PathCalculator for dynamic line length calculations
  - Update SVG path generation to use calculated line lengths
  - Modify ball position calculation to use adaptive speeds
  - Ensure ball always starts from bottom of up-diagonal line
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.4_

- [x] 4.1 Write property test for diagonal line length invariance

  - **Property 6: Diagonal Line Length Invariance**
  - **Validates: Requirements 3.1, 3.2**

- [x] 4.2 Write property test for ball path adherence

  - **Property 7: Ball Path Adherence**
  - **Validates: Requirements 3.5, 4.1**

- [x] 5. Implement adaptive animation system




  - Update animation loop to handle variable phase durations
  - Implement speed-adjusted ball movement for each phase type
  - Add support for 4th phase (holdBottom) in Box Breathing
  - Ensure smooth transitions between phases with different speeds
  - _Requirements: 1.4, 1.5, 2.5, 3.2, 3.3_

- [x] 5.1 Write property test for ball starting position consistency

  - **Property 9: Ball Starting Position Consistency**
  - **Validates: Requirements 4.1, 4.4**

- [x] 5.2 Write property test for visualizer dimension stability

  - **Property 10: Visualizer Dimension Stability**
  - **Validates: Requirements 4.2**

- [x] 6. Update pattern selection interface






  - Modify pattern data to include Box Breathing with holdBottom
  - Update pattern display to show 4-phase timing for Box Breathing
  - Ensure pattern switching recalculates paths correctly
  - Add validation for pattern configuration integrity
  - _Requirements: 4.5, 5.5_

- [x] 6.1 Write unit tests for pattern validation

  - Test invalid phase durations rejection
  - Test missing required phases detection
  - Test Box Breathing validation logic
  - _Requirements: 5.5_

- [x] 7. Add error handling and validation





  - Implement pattern validation with duration limits
  - Add fallback mechanisms for calculation failures
  - Handle edge cases for extremely short or long durations
  - Add graceful degradation for performance issues
  - _Requirements: 5.5_

- [x] 7.1 Write integration tests for complete breathing cycles


  - Test 3-phase pattern complete cycles
  - Test Box Breathing 4-phase complete cycles
  - Test pattern switching during animation
  - Test pause/resume functionality
  - _Requirements: 4.4, 4.5, 5.4_

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Performance optimization and final integration







  - Optimize path calculation performance for real-time updates
  - Implement efficient SVG path updates without full re-renders
  - Add animation frame optimization for smooth 60fps performance
  - Test memory usage and cleanup animation resources properly
  - _Requirements: 4.2, 4.5_

- [x] 9.1 Write performance tests

  - Test animation frame rates with complex patterns
  - Test memory usage during extended sessions
  - Test pattern switching performance
  - _Requirements: 4.5_

- [x] 10. Implement path horizontal positioning system






  - Add calculateHorizontalOffset function to PathCalculator
  - Implement path translation logic to align bottom-of-up-diagonal with fixed ball position
  - Update SVG path rendering to apply horizontal offset
  - Ensure infinite path extension after translation for all 24 patterns
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10.1 Write Jest unit tests for fixed ball position consistency


  - **Property 11: Fixed Ball Position Consistency**
  - Test ball appears at same pixel coordinates for all 24 patterns
  - Test with various hold durations (1s, 2s, 3s, 4s, 8s, 15s)
  - Test both 3-phase and Box Breathing patterns
  - **Validates: Requirements 4.1**

- [x] 10.2 Write Jest unit tests for path alignment accuracy


  - **Property 12: Path Alignment Accuracy**
  - Test bottom-of-up-diagonal aligns with fixed ball position after translation
  - Test horizontal offset calculation for different line lengths
  - Test alignment with various pattern configurations
  - **Validates: Requirements 5.1, 5.2**

- [x] 10.3 Write Jest unit tests for infinite path extension





  - **Property 13: Infinite Path Extension**
  - Test path extends beyond viewport edges after translation
  - Test no empty spaces at left or right edges
  - Test with different horizontal offsets
  - **Validates: Requirements 5.3**

- [x] 11. Update BreathingVisualizer for path positioning





  - Integrate horizontal offset calculation into existing path generation
  - Apply path translation while maintaining existing line length logic
  - Update ball position calculation to work with translated paths
  - Test with all 24 breathing patterns to ensure consistent alignment
  - _Requirements: 4.1, 4.5, 5.4, 5.5_

- [x] 11.1 Write Jest integration tests for path positioning


  - Test path alignment with various hold durations (1s, 2s, 3s, 4s, 8s, 10s) using Jest
  - Test Box Breathing pattern path positioning with Jest mock timers
  - Test pattern switching maintains ball position consistency
  - Test infinite path extension with different offsets
  - Use Jest spies to verify function calls and state changes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12. Final Checkpoint - Ensure all tests pass





  - Ensure all tests pass, ask the user if questions arise.