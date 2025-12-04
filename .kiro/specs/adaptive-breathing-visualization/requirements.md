# Requirements Document

## Introduction

This feature enhances the breathing exercise visualizer by making the wave path animation dynamically adapt to different breathing patterns. Currently, the zigzag wave path has fixed proportions regardless of the breathing pattern selected. This feature will adjust the path geometry to visually represent the timing of each breathing phase (inhale, hold, exhale), making the visualization more intuitive and aligned with the actual breathing rhythm.

## Glossary

- **Breathing Pattern**: A configuration defining the duration (in seconds) of three phases: inhale, hold, and exhale
- **Wave Path**: The zigzag line that the breathing ball follows during animation
- **Phase Segment**: A portion of the wave path corresponding to one breathing phase (inhale, hold, or exhale)
- **Visualizer**: The BreathingVisualizer component that displays the animated breathing guide
- **Path Geometry**: The mathematical definition of the wave path including segment lengths and angles

## Requirements

### Requirement 1

**User Story:** As a user practicing breathing exercises, I want the wave path to visually reflect the timing of my selected breathing pattern, so that I can better understand and follow the rhythm of each phase.

#### Acceptance Criteria

1. WHEN a breathing pattern is selected THEN the Visualizer SHALL calculate segment lengths proportional to each phase duration
2. WHEN the inhale phase is longer than other phases THEN the Visualizer SHALL display a longer ascending diagonal segment
3. WHEN the hold phase is longer than other phases THEN the Visualizer SHALL display a longer horizontal segment at the top
4. WHEN the exhale phase is longer than other phases THEN the Visualizer SHALL display a longer descending diagonal segment
5. WHEN phase durations are equal THEN the Visualizer SHALL display segments of equal length

### Requirement 2

**User Story:** As a user, I want the breathing ball to move at a consistent speed throughout all phases, so that the animation feels smooth and natural.

#### Acceptance Criteria

1. WHEN the animation is running THEN the Visualizer SHALL move the ball at constant velocity along the path
2. WHEN transitioning between phases THEN the Visualizer SHALL maintain smooth motion without acceleration or deceleration
3. WHEN the path geometry changes due to pattern selection THEN the Visualizer SHALL recalculate ball velocity to maintain consistent timing

### Requirement 3

**User Story:** As a user, I want the wave path to maintain visual clarity regardless of the breathing pattern, so that I can easily follow the animation.

#### Acceptance Criteria

1. WHEN segment lengths are calculated THEN the Visualizer SHALL ensure the path remains within the viewport boundaries
2. WHEN very long phase durations are used THEN the Visualizer SHALL scale the path appropriately to fit the display area
3. WHEN very short phase durations are used THEN the Visualizer SHALL ensure segments remain visually distinguishable
4. WHEN the path is rendered THEN the Visualizer SHALL maintain the 60-degree angle for diagonal segments

### Requirement 4

**User Story:** As a developer, I want the path calculation logic to be maintainable and testable, so that future modifications are straightforward.

#### Acceptance Criteria

1. WHEN calculating path geometry THEN the system SHALL use a pure function that takes pattern durations as input
2. WHEN the pattern changes THEN the system SHALL recalculate the path without side effects
3. WHEN testing path calculations THEN the system SHALL provide predictable outputs for given inputs
