import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PathCalculator } from "../utils/PathCalculator.js";
import { PhaseManager } from "../utils/PhaseManager.js";

/**
 * Given a world-space X coordinate, find the Y coordinate on the zigzag path.
 * Works by iterating through consecutive point pairs in the path and
 * linearly interpolating Y on the segment that contains worldX.
 * This is pattern-agnostic — it works for any zigzag path geometry.
 */
function getYOnPath(worldX, points) {
  if (!points || points.length < 2) return 0;

  // Clamp to path bounds
  if (worldX <= points[0].x) return points[0].y;
  if (worldX >= points[points.length - 1].x) return points[points.length - 1].y;

  // Find the segment containing worldX
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    // Skip zero-width segments (shouldn't happen but be safe)
    if (p1.x === p2.x) continue;

    if (worldX >= p1.x && worldX <= p2.x) {
      // Linear interpolation: t goes from 0 to 1 across this segment
      const t = (worldX - p1.x) / (p2.x - p1.x);
      return p1.y + t * (p2.y - p1.y);
    }
  }

  // Fallback (should not be reached)
  return points[points.length - 1].y;
}

export default function BreathingVisualizer({
  pattern,
  running,
  onCycle,
  duration, // Add duration prop
  onPhaseChange // Prop to notify parent of phase changes (bridge phases)
}) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [errorState, setErrorState] = useState(null);
  const [performanceWarnings, setPerformanceWarnings] = useState([]);
  const requestRef = useRef();
  const runningRef = useRef(running);
  const previousRunningRef = useRef(false);
  const pausedStateRef = useRef({
    phase: "idle",
    progress: 0,
    phaseIdx: 0,
    cycleNum: 1,
  });
  const frameCount = useRef(0);
  const lastFrameTime = useRef(Date.now());
  const phaseManagerRef = useRef(null);
  const pathMetricsCache = useRef(null);
  const pathDCache = useRef(null);
  const lastPatternHash = useRef(null);

  // Update running ref whenever running prop changes
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  // Memoize pattern hash for cache invalidation
  const patternHash = useMemo(() => {
    if (!pattern) return 'null';
    return JSON.stringify({
      type: pattern.type,
      inhale: pattern.inhale,
      holdTop: pattern.holdTop,
      exhale: pattern.exhale,
      holdBottom: pattern.holdBottom
    });
  }, [pattern]);

  // Memoize configuration constants for performance
  const viewConfig = useMemo(() => ({
    viewWidth: 700,
    viewHeight: 260,
    padding: 40
  }), []);

  const { viewWidth, viewHeight, padding } = viewConfig;
  const availableHeight = viewHeight - (2 * padding);
  
  const config = useMemo(() => {
    try {
      const diagonalLength = Math.sqrt((availableHeight / Math.sqrt(3)) ** 2 + availableHeight ** 2);
      const maxHorizontalLength = diagonalLength * 0.5;
      
      // Validate calculated values
      if (!isFinite(diagonalLength) || !isFinite(maxHorizontalLength)) {
        throw new Error('Invalid calculated dimensions');
      }
      
      return { 
        diagonalLength, 
        maxHorizontalLength,
        fixedBallPosition: viewWidth / 2, // Fixed ball position at center of viewport
        viewportWidth: viewWidth
      };
    } catch (error) {
      console.warn('BreathingVisualizer: Using safe defaults', error);
      return {
        diagonalLength: PathCalculator.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
        maxHorizontalLength: PathCalculator.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH,
        fixedBallPosition: viewWidth / 2,
        viewportWidth: viewWidth
      };
    }
  }, [availableHeight, viewWidth]);

  // Optimized path metrics calculation with caching
  const getPathMetrics = useCallback(() => {
    // Check if we can use cached metrics
    if (pathMetricsCache.current && lastPatternHash.current === patternHash) {
      return pathMetricsCache.current;
    }

    // Calculate new metrics
    try {
      const metrics = PathCalculator.calculatePathMetrics(pattern, config);
      
      // Cache the results
      pathMetricsCache.current = metrics;
      lastPatternHash.current = patternHash;
      
      return metrics;
    } catch (error) {
      console.error('BreathingVisualizer: Error calculating path metrics', error);
      // Return safe fallback
      return {
        topHorizontalLength: PathCalculator.SAFE_DEFAULTS.DEFAULT_MAX_HORIZONTAL_LENGTH,
        bottomHorizontalLength: PathCalculator.SAFE_DEFAULTS.MIN_LINE_LENGTH,
        diagonalLength: PathCalculator.SAFE_DEFAULTS.DEFAULT_DIAGONAL_LENGTH,
        ballSpeeds: {
          inhale: PathCalculator.SAFE_DEFAULTS.MIN_BALL_SPEED,
          holdTop: PathCalculator.SAFE_DEFAULTS.MIN_BALL_SPEED,
          exhale: PathCalculator.SAFE_DEFAULTS.MIN_BALL_SPEED
        },
        isValid: false
      };
    }
  }, [pattern, config, patternHash]);

  // Effect to notify parent of phase change (especially for bridge phases)
  useEffect(() => {
    if (phaseManagerRef.current && onPhaseChange) {
      const phases = phaseManagerRef.current.getAllPhases();
      // Find current phase object to check isBridge status
      const currentPhaseObj = phases.find(p => p.name === phase);
      if (currentPhaseObj) {
        onPhaseChange(currentPhaseObj);
      }
    }
  }, [phase, onPhaseChange]);

  useEffect(() => {
    let mounted = true;
    
    // Calculate total cycles based on duration and pattern
    // Each cycle duration = inhale + holdTop + exhale + (holdBottom if 4-phase)
    const cycleDuration = pattern.inhale + (pattern.holdTop || 0) + pattern.exhale + (pattern.holdBottom || 0);
    const totalCycles = duration ? Math.ceil((duration * 60) / cycleDuration) : 999999; // Use very large number if no duration
    
    // Validate pattern before creating PhaseManager (with performance optimization)
    let patternValidation;
    try {
      patternValidation = PatternValidator?.validatePatternDetailed?.(pattern) || { isValid: true, warnings: [] };
    } catch (error) {
      console.warn('BreathingVisualizer: PatternValidator not available, proceeding with pattern as-is');
      patternValidation = { isValid: true, warnings: [] };
    }
    
    if (!patternValidation.isValid) {
      console.warn('BreathingVisualizer: Invalid pattern detected', patternValidation.errors);
      setErrorState({
        type: 'pattern_validation',
        message: 'Invalid breathing pattern configuration',
        errors: patternValidation.errors
      });
    } else {
      setErrorState(null);
    }

    if (patternValidation.warnings && patternValidation.warnings.length > 0) {
      setPerformanceWarnings(patternValidation.warnings);
    }
    
    // Reuse or create PhaseManager with performance optimization
    let phaseManager = phaseManagerRef.current;
    
    if (!phaseManager || lastPatternHash.current !== patternHash) {
      try {
        phaseManager = new PhaseManager(pattern, config);
        phaseManagerRef.current = phaseManager;
        
        // Check for PhaseManager errors
        if (phaseManager.hasErrors()) {
          const phaseError = phaseManager.getErrorState();
          console.warn('BreathingVisualizer: PhaseManager has errors', phaseError);
          setErrorState({
            type: 'phase_manager',
            message: phaseError.message,
            originalError: phaseError
          });
        }
      } catch (error) {
        console.error('BreathingVisualizer: Failed to create PhaseManager', error);
        setErrorState({
          type: 'initialization',
          message: 'Failed to initialize breathing animation',
          originalError: error.message
        });
        return;
      }
    } else if (phaseManager && lastPatternHash.current !== patternHash) {
      // Update existing phase manager with new pattern
      try {
        phaseManager.updatePattern(pattern);
      } catch (error) {
        console.error('BreathingVisualizer: Failed to update PhaseManager pattern', error);
        // Create new phase manager as fallback
        phaseManager = new PhaseManager(pattern, config);
        phaseManagerRef.current = phaseManager;
      }
    }

    function runVisualizer() {
      if (!runningRef.current) return;

      // Check if we're resuming from pause or starting fresh
      const isResuming = previousRunningRef.current === false && pausedStateRef.current.progress > 0;
      
      if (isResuming) {
        // Restore phase manager state from pause
        phaseManager.currentPhaseIndex = pausedStateRef.current.phaseIdx;
        phaseManager.phaseProgress = pausedStateRef.current.progress;
        phaseManager.cycleNumber = pausedStateRef.current.cycleNum;
        phaseManager.resume();
      } else {
        // Start fresh
        phaseManager.reset();
        phaseManager.start();
      }
      
      previousRunningRef.current = true;

      function animate() {
        if (!mounted || !runningRef.current) return;

        try {
          // Performance monitoring with optimized frequency
          const currentTime = Date.now();
          frameCount.current++;
          
          // Check frame rate every 120 frames (approximately 2 seconds at 60fps) for better performance
          if (frameCount.current % 120 === 0) {
            const timeDiff = currentTime - lastFrameTime.current;
            const fps = 120000 / timeDiff; // Calculate FPS over 2 seconds
            
            if (fps < 45) { // More lenient threshold for performance warnings
              console.warn(`BreathingVisualizer: Low frame rate detected: ${fps.toFixed(1)} FPS`);
              setPerformanceWarnings(prev => {
                // Limit warning array size to prevent memory leaks
                const newWarnings = [...prev, {
                  type: 'performance',
                  message: `Low frame rate: ${fps.toFixed(1)} FPS`,
                  timestamp: currentTime
                }];
                return newWarnings.slice(-5); // Keep only last 5 warnings
              });
            }
            
            lastFrameTime.current = currentTime;
          }

          // Update phase manager state with error handling
          const state = phaseManager.update(currentTime);
          
          // Check for PhaseManager errors during update
          if (phaseManager.hasErrors()) {
            const phaseError = phaseManager.getErrorState();
            console.warn('BreathingVisualizer: PhaseManager error during update', phaseError);
            setErrorState({
              type: 'runtime',
              message: 'Animation error occurred',
              originalError: phaseError
            });
            
            // Try to continue with safe state
            setPhase("idle");
            setProgress(0);
            return;
          }
          
          // Validate state before using it
          if (!state || typeof state.currentPhase !== 'string' || typeof state.phaseProgress !== 'number') {
            console.error('BreathingVisualizer: Invalid state returned from PhaseManager', state);
            setErrorState({
              type: 'state_corruption',
              message: 'Invalid animation state detected'
            });
            return;
          }
          
          // Check if we've completed all cycles
          if (state.cycleNumber >= totalCycles) {
            setPhase("done");
            setProgress(1);
            if (onCycle) onCycle(totalCycles);
            return;
          }

          // Batch state updates for better performance
          const newPhase = state.currentPhase;
          const newProgress = Math.max(0, Math.min(1, state.phaseProgress)); // Clamp progress
          
          // Only update state if values actually changed
          if (newPhase !== phase || Math.abs(newProgress - progress) > 0.001) {
            setPhase(newPhase);
            setProgress(newProgress);
          }
          
          // Save state for pause/resume
          pausedStateRef.current = {
            phase: state.currentPhase,
            progress: state.phaseProgress,
            phaseIdx: state.phaseIndex,
            cycleNum: state.cycleNumber,
          };
          
          // Only call onCycle when cycle number actually changes
          if (onCycle && state.cycleNumber !== pausedStateRef.current.cycleNum) {
            onCycle(state.cycleNumber);
          }
          
          // Continue animation with optimized scheduling
          requestRef.current = requestAnimationFrame(animate);
        } catch (error) {
          console.error('BreathingVisualizer: Error in animation loop', error);
          setErrorState({
            type: 'animation_loop',
            message: 'Animation loop error',
            originalError: error.message
          });
          
          // Stop animation on critical error
          setPhase("idle");
          setProgress(0);
        }
      }
      
      animate();
    }

    if (!running) {
      previousRunningRef.current = false;
      // Pause the phase manager when not running
      if (phaseManager) {
        phaseManager.pause();
      }
    }
    
    runVisualizer();
    return () => {
      mounted = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
      // Clear performance monitoring
      frameCount.current = 0;
      lastFrameTime.current = Date.now();
    };
  }, [running, pattern, onCycle, patternHash, duration]); // Add duration to dependencies

  // Memoize path calculations for performance
  const pathData = useMemo(() => {
    const topY = padding;
    const bottomY = viewHeight - padding;
    const diagonalHorizontal = availableHeight / Math.sqrt(3);
    
    // Get cached or calculate path metrics
    const pathMetrics = getPathMetrics();
    
    // Validate metrics and handle errors
    if (!pathMetrics.isValid && pathMetrics.errors) {
      console.warn('BreathingVisualizer: Path calculation errors', pathMetrics.errors);
      setErrorState(prev => prev || {
        type: 'path_calculation',
        message: 'Path calculation errors detected',
        errors: pathMetrics.errors
      });
    }
    
    // Check performance warnings
    try {
      const perfValidation = PathCalculator.validatePerformance(pathMetrics);
      if (!perfValidation.isPerformant) {
        setPerformanceWarnings(prev => {
          const newWarnings = [...prev, ...perfValidation.warnings];
          return newWarnings.slice(-10); // Limit to last 10 warnings
        });
      }
    } catch (error) {
      console.warn('BreathingVisualizer: Error validating performance', error);
    }
    
    const topHorizontalLength = pathMetrics.topHorizontalLength;
    const bottomHorizontalLength = pathMetrics.bottomHorizontalLength;
    const horizontalOffset = pathMetrics.horizontalOffset || 0;
    
    const cycleWidth = bottomHorizontalLength + diagonalHorizontal + topHorizontalLength + diagonalHorizontal;
    
    // Use infinite extension parameters if available, otherwise fallback to original logic
    let numCycles, totalWidth;
    if (pathMetrics.infiniteExtension) {
      const extension = pathMetrics.infiniteExtension;
      numCycles = extension.patternsNeeded + 4; // Add extra for safety
      totalWidth = extension.rightBoundary - extension.leftBoundary + Math.abs(horizontalOffset);
    } else {
      // Fallback to original logic
      numCycles = Math.ceil(viewWidth / cycleWidth) + 6; // Extra cycles for safety
      totalWidth = numCycles * cycleWidth;
    }
    
    // ========================================================================
    // ALIGNMENT LOGIC: Ensure ball at center (350px) is at bottom of upward diagonal
    // ========================================================================
    // Pattern sequence per cycle: bottom-line → up-diagonal → top-line → down-diagonal
    //
    // Upward diagonal bottoms occur at positions:
    //   startX + bottomHorizontalLength + 0*cycleWidth
    //   startX + bottomHorizontalLength + 1*cycleWidth
    //   startX + bottomHorizontalLength + 2*cycleWidth
    //   ... etc
    //
    // We want ONE of these to equal fixedBallX (350px):
    //   startX + bottomHorizontalLength + n*cycleWidth = 350
    //   startX = 350 - bottomHorizontalLength - n*cycleWidth
    //
    // Choose n such that startX is slightly negative (covers left viewport edge)
    const fixedBallX = config.fixedBallPosition; // 350px
    
    // Calculate n: we want startX to be around -cycleWidth to -2*cycleWidth
    // n = ceil((fixedBallX - bottomHorizontalLength + cycleWidth) / cycleWidth)
    const n = Math.ceil((fixedBallX - bottomHorizontalLength + cycleWidth) / cycleWidth);
    
    // Calculate the aligned start position
    const alignedStartX = fixedBallX - bottomHorizontalLength - (n * cycleWidth);
    
    // Build zigzag path with proper alignment
    const points = [];
    let currentX = alignedStartX;
    
    for (let i = 0; i < numCycles; i++) {
      points.push({ x: currentX, y: bottomY });
      currentX += bottomHorizontalLength;
      points.push({ x: currentX, y: bottomY });
      currentX += diagonalHorizontal;
      points.push({ x: currentX, y: topY });
      currentX += topHorizontalLength;
      points.push({ x: currentX, y: topY });
      currentX += diagonalHorizontal;
      points.push({ x: currentX, y: bottomY });
    }
    
    return {
      points,
      pathD: points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '),
      cycleWidth,
      totalWidth,
      topY,
      bottomY,
      diagonalHorizontal,
      topHorizontalLength,
      bottomHorizontalLength,
      pathMetrics,
      horizontalOffset,
      fixedBallPosition: config.fixedBallPosition
    };
  }, [viewWidth, viewHeight, padding, availableHeight, getPathMetrics, config.fixedBallPosition]);
  
  // Memoize animation calculations for performance
  const animationData = useMemo(() => {
    if (!phaseManagerRef.current) {
      return { animationOffset: 0, ballY: pathData.bottomY };
    }

    const phases = phaseManagerRef.current.getAllPhases();

    // ====================================================================
    // SEGMENT-BASED OFFSET: each phase maps to its actual path segment
    // This ensures each phase takes exactly its specified seconds.
    // ====================================================================
    // Phase → segment horizontal length mapping:
    //   inhale    → diagonalHorizontal  (up-diagonal)
    //   holdTop   → topHorizontalLength (top flat line)
    //   exhale    → diagonalHorizontal  (down-diagonal)
    //   holdBottom→ bottomHorizontalLength (bottom flat line)
    const segmentHLengths = {
      inhale: pathData.diagonalHorizontal,
      holdTop: pathData.topHorizontalLength,
      exhale: pathData.diagonalHorizontal,
      holdBottom: pathData.bottomHorizontalLength
    };

    // Find current phase index
    let phaseIndex = phases.findIndex(p => p.name === phase);
    if (phaseIndex === -1) phaseIndex = 0;

    // Calculate offset as sum of completed segment lengths + partial current segment
    let animationOffset = 0;
    for (let i = 0; i < phaseIndex; i++) {
      animationOffset += segmentHLengths[phases[i].name] || 0;
    }
    animationOffset += progress * (segmentHLengths[phases[phaseIndex].name] || 0);

    // ====================================================================
    // PIXEL-PERFECT BALL Y: derive from the actual green line path geometry
    // ====================================================================
    const worldX = pathData.fixedBallPosition + animationOffset;
    const ballY = getYOnPath(worldX, pathData.points);

    return { animationOffset, ballY };
  }, [phase, progress, pathData]);


  // Error state display
  if (errorState && errorState.type === 'critical_path_error') {
    return (
      <div className="w-full flex flex-col items-center justify-center session-visualizer">
        <div className="flex flex-col items-center justify-center mb-8 mt-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">Animation Error</div>
            <div className="text-red-700 text-sm mb-4">{errorState.message}</div>
            <div className="text-red-600 text-xs">Please refresh the page or try a different pattern</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center session-visualizer">
      {/* Error and Warning Display */}
      {errorState && errorState.type !== 'critical_path_error' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm max-w-md text-center">
          <div className="font-semibold">Warning:</div>
          <div>{errorState.message}</div>
        </div>
      )}
      
      {/* Only show performance warnings in development mode */}
      {process.env.NODE_ENV === 'development' && performanceWarnings.length > 0 && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-xs max-w-md text-center">
          Performance: {performanceWarnings[performanceWarnings.length - 1].message}
        </div>
      )}
      
      <div className="flex flex-col items-center justify-center mb-8 mt-12">
        <div
          className="relative border-2 border-primary rounded-lg"
          style={{
            width: viewWidth,
            height: viewHeight,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <svg
            width={pathData.totalWidth}
            height={viewHeight}
            viewBox={`0 0 ${pathData.totalWidth} ${viewHeight}`}
            style={{
              display: "block",
              transform: `translateX(-${animationData.animationOffset % pathData.cycleWidth}px)`,
              willChange: "transform",
            }}
          >
            {/* Single breathing path line */}
            <path
              d={pathData.pathD}
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

          {/* Transparent Circle with Border - Smaller */}
          <div
            style={{
              position: "absolute",
              left: `${pathData.fixedBallPosition}px`,
              top: `${animationData.ballY}px`,
              transform: "translate(-50%, -50%)",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundColor: "transparent",
              border: "3px solid var(--primary)",
              zIndex: 10,
            }}
          >
            {/* Center Point - 2px - Made more visible for debugging */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#FF0000",
                zIndex: 20,
              }}
            />
          </div>
        </div>
        <div className="text-xl font-heading font-semibold text-primary-dark mt-1 text-center">
          {phase === "idle"
            ? "Ready"
            : phase === "done"
            ? "Done"
            : (() => {
                // Determine label based on bridge status
                if (!phaseManagerRef.current) return "";
                const phases = phaseManagerRef.current.getAllPhases();
                const currentPhaseObj = phases.find(p => p.name === phase);
                const isBridge = currentPhaseObj?.isBridge;

                if (phase === "holdTop") {
                  return isBridge ? "Exhale" : "Hold";
                }
                if (phase === "holdBottom") {
                  return isBridge ? "Inhale" : "Hold";
                }
                return phase.charAt(0).toUpperCase() + phase.slice(1);
              })()}
        </div>
      </div>
    </div>
  );
}
