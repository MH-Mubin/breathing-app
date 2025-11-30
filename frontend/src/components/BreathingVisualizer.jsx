import React, { useEffect, useState, useRef } from "react";

// Ball animates along three lines: up (inhale, 60deg), straight (hold), down (exhale, -60deg)
export default function BreathingVisualizer({
  pattern,
  running,
  onCycle,
  onRemaining,
}) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const requestRef = useRef();
  const pausedStateRef = useRef({
    phase: "idle",
    progress: 0,
    phaseIdx: 0,
    cycleNum: 1,
  }); // Store paused state

  useEffect(() => {
    let mounted = true;
    let totalCycles = 8;
    let phaseOrder = [
      { name: "inhale", time: pattern.inhale },
      { name: "hold", time: pattern.hold },
      { name: "exhale", time: pattern.exhale },
    ];

    function runVisualizer() {
      if (!running) {
        // Don't reset - keep current position when paused
        return;
      }

      // Resume from paused state
      let phaseIdx = pausedStateRef.current.phaseIdx || 0;
      let cycleNum = pausedStateRef.current.cycleNum || 1;
      let resumeProgress = pausedStateRef.current.progress || 0;

      function nextPhase(skipToResume = false) {
        if (!mounted) return;
        if (cycleNum > totalCycles) {
          setPhase("done");
          setProgress(1);
          setCycle(totalCycles);
          setRemaining(0);
          if (onCycle) onCycle(totalCycles);
          if (onRemaining) onRemaining(0);
          return;
        }
        let p = phaseOrder[phaseIdx];
        setPhase(p.name);

        // Calculate start time considering resume progress
        let phaseDuration = p.time * 1000;
        let phaseStart =
          Date.now() - (skipToResume ? resumeProgress * phaseDuration : 0);
        let phaseProgress = skipToResume ? resumeProgress : 0;

        function animate() {
          if (!mounted || !running) return; // Stop animating when paused
          let elapsed = Date.now() - phaseStart;
          phaseProgress = Math.min(1, elapsed / phaseDuration);
          setProgress(phaseProgress);
          pausedStateRef.current = {
            phase: p.name,
            progress: phaseProgress,
            phaseIdx,
            cycleNum,
          }; // Save state
          setCycle(cycleNum);
          let rem =
            (totalCycles - cycleNum) *
              (pattern.inhale + pattern.hold + pattern.exhale) +
            (p.time - elapsed / 1000);
          setRemaining(Math.max(0, Math.round(rem)));
          if (onCycle) onCycle(cycleNum);
          if (onRemaining) onRemaining(Math.max(0, Math.round(rem)));
          if (elapsed < phaseDuration) {
            requestRef.current = requestAnimationFrame(animate);
          } else {
            phaseIdx++;
            if (phaseIdx >= phaseOrder.length) {
              phaseIdx = 0;
              cycleNum++;
            }
            nextPhase();
          }
        }
        animate();
      }
      nextPhase(true); // Start with resume flag
    }

    runVisualizer();
    return () => {
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [running, pattern, onCycle, onRemaining]);

  // Ball position logic for segmented path
  // Path: left leg up, top straight line (hold), right leg down
  // SVG coordinates: centered shape with flat top - tight viewBox
  const viewWidth = 700,
    viewHeight = 260;
  const centerX = viewWidth / 2; // Center horizontally
  const bottomY = 220; // Bottom position (with clearance)
  const topY = 40; // Top position (with clearance)
  const legWidth = 240; // Width of each leg from center
  const topWidth = 170; // Width of flat top section

  // Left leg bottom, left top, right top, right leg bottom
  const x1 = centerX - topWidth / 2,
    y1 = topY; // Left top
  const x2 = centerX + topWidth / 2,
    y2 = topY; // Right top
  const x3 = centerX + legWidth,
    y3 = bottomY; // Right leg bottom
  const x0 = centerX - legWidth,
    y0 = bottomY; // Left leg bottom

  // Add horizontal straight lines extending outward from both leg bottoms
  // Calculate how much space is available on each side
  const leftSpace = x0; // Space from left edge (0) to x0
  const rightSpace = viewWidth - x3; // Space from x3 to right edge (viewWidth)

  // Extend as much as possible without going outside the container
  const x0Left = 0; // Extend to the left edge
  const x3Right = viewWidth; // Extend to the right edge

  // Calculate animation offset based on phase and progress
  // The shape moves left continuously with seamless looping
  const totalCycleWidth = viewWidth; // One complete cycle moves exactly one viewWidth

  // Calculate total progress through one complete breathing cycle (0 to 1)
  const totalPhaseDuration = pattern.inhale + pattern.hold + pattern.exhale;
  let cycleProgress = 0;

  if (phase === "inhale") {
    cycleProgress = (progress * pattern.inhale) / totalPhaseDuration;
  } else if (phase === "hold") {
    cycleProgress =
      (pattern.inhale + progress * pattern.hold) / totalPhaseDuration;
  } else if (phase === "exhale") {
    cycleProgress =
      (pattern.inhale + pattern.hold + progress * pattern.exhale) /
      totalPhaseDuration;
  }

  // Move one full viewWidth per cycle for seamless loop
  // This keeps the position even when paused (doesn't reset to 0)
  const animationOffset = cycleProgress * totalCycleWidth;

  // Path: Start from far left, go to left leg bottom, up to left top, across top, down to right leg bottom, extend right
  const pathD = `M ${x0Left} ${y0} L ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x3Right} ${y3}`;

  // Calculate circle Y position based on where the line is at center X
  // The shape repeats every viewWidth, so we work with positions relative to one shape cycle
  const offset = animationOffset % viewWidth;

  // Calculate the X position in the "virtual" coordinate space where the shape at centerX is located
  // Since the shape moves left, we need to find the local X within the shape that's currently at centerX
  const localX = (centerX + offset) % viewWidth;

  // Now determine Y based on which segment localX falls into
  let circleY;

  // Check which segment localX is in
  if (localX <= x0) {
    // Left horizontal segment
    circleY = y0;
  } else if (localX <= x1) {
    // Left diagonal (going up from y0 to y1)
    const segmentProgress = (localX - x0) / (x1 - x0);
    circleY = y0 + (y1 - y0) * segmentProgress;
  } else if (localX <= x2) {
    // Top flat segment
    circleY = y1;
  } else if (localX <= x3) {
    // Right diagonal (going down from y2 to y3)
    const segmentProgress = (localX - x2) / (x3 - x2);
    circleY = y2 + (y3 - y2) * segmentProgress;
  } else {
    // Right horizontal segment
    circleY = y3;
  }

  return (
    <div className="w-full flex flex-col items-center justify-center session-visualizer">
      <div className="flex flex-col items-center justify-center mb-8 mt-12">
        {/* Bordered container with overflow hidden for flowing effect */}
        <div
          className="relative border-2 border-orange-300 rounded-lg"
          style={{
            width: viewWidth,
            height: viewHeight,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <svg
            width={viewWidth * 3}
            height={viewHeight}
            viewBox={`0 0 ${viewWidth * 3} ${viewHeight}`}
            style={{
              display: "block",
              transform: `translateX(-${animationOffset % viewWidth}px)`,
              willChange: "transform",
            }}
          >
            {/* First instance of shape */}
            <path
              d={pathD}
              stroke="#ff6a00"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Second instance (for seamless loop) - offset by shape width */}
            <path
              d={`M ${x0Left + viewWidth} ${y0} L ${x0 + viewWidth} ${y0} L ${
                x1 + viewWidth
              } ${y1} L ${x2 + viewWidth} ${y2} L ${x3 + viewWidth} ${y3} L ${
                x3Right + viewWidth
              } ${y3}`}
              stroke="#ff6a00"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {/* Third instance (for seamless loop) */}
            <path
              d={`M ${x0Left + viewWidth * 2} ${y0} L ${
                x0 + viewWidth * 2
              } ${y0} L ${x1 + viewWidth * 2} ${y1} L ${
                x2 + viewWidth * 2
              } ${y2} L ${x3 + viewWidth * 2} ${y3} L ${
                x3Right + viewWidth * 2
              } ${y3}`}
              stroke="#ff6a00"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="8"
                  stdDeviation="8"
                  floodColor="#ffb07a"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>
          </svg>

          {/* Circle that stays horizontally centered but moves vertically with the line */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: `${circleY}px`,
              transform: "translate(-50%, -50%)",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "#ff6a00",
              boxShadow: "0 6px 20px rgba(255, 106, 0, 0.6)",
              border: "3px solid #fff",
              zIndex: 10,
            }}
          />
        </div>
        {/* Phase label - outside the bordered div */}
        <div className="text-xl font-semibold text-orange-600 mt-1 text-center">
          {phase === "idle"
            ? "Ready"
            : phase === "done"
            ? "Done"
            : phase.charAt(0).toUpperCase() + phase.slice(1)}
        </div>
      </div>
    </div>
  );
}
