# Requirements Document

## Introduction

This feature enhances the breathing exercise visualizer by making the horizontal line lengths and ball movement speed dynamically adapt to different breathing patterns. The system supports both 3-phase patterns (inhale-holdTop-exhale) and 4-phase Box Breathing patterns (inhale-holdTop-exhale-holdBottom). The horizontal line lengths will adjust based on hold phase durations, while diagonal line lengths remain fixed with only ball speed adjustments.

## Glossary

- **Breathing Pattern**: A configuration defining the duration (in seconds) of breathing phases - either 3-phase or 4-phase
- **3-Phase Pattern**: Standard breathing with inhale, holdTop, and exhale phases (23 patterns total)
- **4-Phase Pattern**: Box Breathing with inhale, holdTop, exhale, and holdBottom phases (1 pattern total)
- **Horizontal Line**: The flat segments at top and bottom of the breathing path where hold phases occur
- **Diagonal Line**: The angled segments representing inhale (up) and exhale (down) phases
- **Visualizer**: The BreathingVisualizer component that displays the animated breathing guide
- **Ball Starting Position**: The bottom of the up-diagonal line where the ball always begins each cycle
- **holdTop**: The hold phase after inhale (at the top horizontal line)
- **holdBottom**: The hold phase after exhale (at the bottom horizontal line, Box Breathing only)

## Requirements

### Requirement 1

**User Story:** As a user practicing breathing exercises, I want the top horizontal line length to adapt to my holdTop duration, so that I can visually understand the timing of the hold phase.

#### Acceptance Criteria

1. WHEN holdTop duration is 1, 2, or 3 seconds THEN the Visualizer SHALL reduce the top horizontal line length to 25%, 50%, or 75% respectively
2. WHEN holdTop duration is exactly 4 seconds THEN the Visualizer SHALL display the top horizontal line at 100% of current length
3. WHEN holdTop duration is more than 4 seconds THEN the Visualizer SHALL keep the top horizontal line at 100% length
4. WHEN the top horizontal line length changes THEN the Visualizer SHALL adjust ball speed to match the exact holdTop duration
5. WHEN the ball moves along the top horizontal line THEN the Visualizer SHALL ensure the ball takes exactly the specified holdTop seconds to traverse it

### Requirement 2

**User Story:** As a user practicing Box Breathing, I want the bottom horizontal line to adapt to my holdBottom duration, so that I can follow the complete 4-phase breathing cycle.

#### Acceptance Criteria

1. WHEN using 3-phase patterns THEN the Visualizer SHALL keep the bottom horizontal line at 15px minimum length
2. WHEN using Box Breathing pattern THEN the Visualizer SHALL apply the same length rules to the bottom horizontal line as the top line
3. WHEN holdBottom duration is 1, 2, or 3 seconds THEN the Visualizer SHALL reduce the bottom horizontal line length to 25%, 50%, or 75% respectively
4. WHEN holdBottom duration is exactly 4 seconds THEN the Visualizer SHALL display the bottom horizontal line at 100% of current length
5. WHEN holdBottom duration is more than 4 seconds THEN the Visualizer SHALL keep the bottom horizontal line at 100% length with adjusted ball speed

### Requirement 3

**User Story:** As a user, I want the diagonal line segments to maintain consistent visual appearance while adapting timing to my breathing pattern, so that the animation remains clear and predictable.

#### Acceptance Criteria

1. WHEN any breathing pattern is selected THEN the Visualizer SHALL never change the length of diagonal line segments
2. WHEN inhale or exhale durations change THEN the Visualizer SHALL adjust only the ball speed along diagonal segments
3. WHEN the ball moves along diagonal segments THEN the Visualizer SHALL ensure the ball takes exactly the specified phase duration to traverse each segment
4. WHEN transitioning between phases THEN the Visualizer SHALL maintain smooth ball movement without acceleration or deceleration
5. WHEN the animation runs THEN the Visualizer SHALL ensure the ball always moves along the line path and never outside it

### Requirement 4

**User Story:** As a user, I want the ball to always appear at the same visual position regardless of breathing pattern, so that I have a consistent reference point for all breathing exercises.

#### Acceptance Criteria

1. WHEN any breathing pattern is selected THEN the Visualizer SHALL maintain the ball at a fixed pixel position in the viewport
2. WHEN the visualizer box is rendered THEN the Visualizer SHALL maintain fixed height and width dimensions
3. WHEN horizontal lines are drawn THEN the Visualizer SHALL ensure they extend from the left side to the right side of the box
4. WHEN the animation cycle completes THEN the Visualizer SHALL return the ball to the fixed starting position for the next cycle
5. WHEN switching between patterns THEN the Visualizer SHALL recalculate line lengths and ball speeds without changing the ball's visual position

### Requirement 5

**User Story:** As a user, I want the breathing path to automatically align with the ball position for every pattern, so that the ball always starts at the bottom of the up-diagonal line regardless of pattern configuration.

#### Acceptance Criteria

1. WHEN any of the 24 breathing patterns is selected THEN the Visualizer SHALL calculate the horizontal offset needed to align the bottom of the up-diagonal line with the fixed ball position
2. WHEN the path is positioned THEN the Visualizer SHALL translate the entire zigzag path horizontally so the bottom of the up-diagonal line coincides with the ball position
3. WHEN the path is translated THEN the Visualizer SHALL extend the path infinitely in both directions to ensure no empty spaces at viewport edges
4. WHEN switching between patterns THEN the Visualizer SHALL recalculate and apply the appropriate horizontal offset for the new pattern
5. WHEN the ball moves during animation THEN the Visualizer SHALL ensure the ball follows the translated path correctly

### Requirement 6

**User Story:** As a developer, I want the pattern adaptation logic to handle both 3-phase and 4-phase breathing patterns correctly, so that the system supports all breathing techniques.

#### Acceptance Criteria

1. WHEN processing 3-phase patterns THEN the system SHALL handle inhale, holdTop, and exhale phases only
2. WHEN processing Box Breathing pattern THEN the system SHALL handle inhale, holdTop, exhale, and holdBottom phases
3. WHEN calculating line lengths and path positioning THEN the system SHALL use pure functions that take pattern phase durations as input
4. WHEN pattern types change THEN the system SHALL recalculate line geometry, ball timing, and path positioning without side effects
5. WHEN validating patterns THEN the system SHALL ensure proper phase sequencing and duration constraints
