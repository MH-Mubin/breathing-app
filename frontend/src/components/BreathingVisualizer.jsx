import { useEffect, useRef, useState } from "react";

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

  // Zigzag wave path with 60-degree diagonals and proper proportions
  const viewWidth = 700;
  const viewHeight = 260;
  const padding = 40;
  
  // Calculate dimensions for 60-degree angle
  const availableHeight = viewHeight - (2 * padding); // 180px
  const topY = padding;
  const bottomY = viewHeight - padding;
  
  // For 60-degree angle: horizontal distance = height / tan(60°)
  // tan(60°) = √3 ≈ 1.732
  const diagonalHorizontal = availableHeight / Math.sqrt(3); // ~104px
  const diagonalLength = Math.sqrt(diagonalHorizontal ** 2 + availableHeight ** 2); // ~208px
  
  // Top horizontal line = 50% of diagonal length
  const topHorizontalLength = diagonalLength * 0.5; // ~104px
  
  // Bottom horizontal line (small connector)
  const bottomHorizontalLength = 15; // Small line at valleys
  
  // One complete wave cycle width
  const cycleWidth = bottomHorizontalLength + diagonalHorizontal + topHorizontalLength + diagonalHorizontal;
  
  // Calculate how many complete cycles fit, then add extra for seamless loop
  const numCycles = Math.ceil(viewWidth / cycleWidth) + 2;
  
  // Build the zigzag path
  const points = [];
  let currentX = 0;
  
  for (let i = 0; i < numCycles; i++) {
    // Start at bottom
    points.push({ x: currentX, y: bottomY });
    
    // Small horizontal line at bottom
    currentX += bottomHorizontalLength;
    points.push({ x: currentX, y: bottomY });
    
    // Diagonal up (45 degrees)
    currentX += diagonalHorizontal;
    points.push({ x: currentX, y: topY });
    
    // Horizontal line at top
    currentX += topHorizontalLength;
    points.push({ x: currentX, y: topY });
    
    // Diagonal down (45 degrees)
    currentX += diagonalHorizontal;
    points.push({ x: currentX, y: bottomY });
  }
  
  // Create path string
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Calculate animation offset
  const totalPhaseDuration = pattern.inhale + pattern.hold + pattern.exhale;
  let cycleProgress = 0;

  if (phase === "inhale") {
    cycleProgress = (progress * pattern.inhale) / totalPhaseDuration;
  } else if (phase === "hold") {
    cycleProgress = (pattern.inhale + progress * pattern.hold) / totalPhaseDuration;
  } else if (phase === "exhale") {
    cycleProgress = (pattern.inhale + pattern.hold + progress * pattern.exhale) / totalPhaseDuration;
  }

  // Animation moves by one complete cycle width
  const animationOffset = cycleProgress * cycleWidth;
  const centerX = viewWidth / 2;
  
  // Find ball position along the path
  const pathPosition = (centerX + animationOffset) % cycleWidth;
  
  // Calculate ball Y position based on where we are in the cycle
  let circleY = bottomY;
  
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    // Normalize positions to cycle width for comparison
    const p1X = p1.x % cycleWidth;
    const p2X = p2.x % cycleWidth;
    
    if (pathPosition >= p1X && pathPosition <= p2X) {
      const segmentProgress = (pathPosition - p1X) / (p2X - p1X);
      circleY = p1.y + (p2.y - p1.y) * segmentProgress;
      break;
    }
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
            width={currentX}
            height={viewHeight}
            viewBox={`0 0 ${currentX} ${viewHeight}`}
            style={{
              display: "block",
              transform: `translateX(-${animationOffset % cycleWidth}px)`,
              willChange: "transform",
            }}
          >
            {/* Render the continuous zigzag path */}
            <path
              d={pathD}
              stroke="#ff6a00"
              strokeWidth="20"
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

          {/* Circle that stays horizontally centered but moves vertically along the zigzag */}
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
              transition: "top 0.05s linear",
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
