import { useEffect, useRef, useState } from "react";

export default function BreathingVisualizer({
  pattern,
  running,
  onCycle,
}) {
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const requestRef = useRef();
  const runningRef = useRef(running);
  const previousRunningRef = useRef(false);
  const pausedStateRef = useRef({
    phase: "idle",
    progress: 0,
    phaseIdx: 0,
    cycleNum: 1,
  });

  // Update running ref whenever running prop changes
  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    let mounted = true;
    let totalCycles = 8;
    let phaseOrder = [
      { name: "inhale", time: pattern.inhale },
      { name: "hold", time: pattern.hold },
      { name: "exhale", time: pattern.exhale },
    ];

    function runVisualizer() {
      if (!runningRef.current) return;

      // Check if we're resuming from pause or starting fresh
      const isResuming = previousRunningRef.current === false && pausedStateRef.current.progress > 0;
      
      let phaseIdx = isResuming ? pausedStateRef.current.phaseIdx : 0;
      let cycleNum = isResuming ? pausedStateRef.current.cycleNum : 1;
      let resumeProgress = isResuming ? pausedStateRef.current.progress : 0;
      
      previousRunningRef.current = true;

      function nextPhase(skipToResume = false) {
        if (!mounted) return;
        if (cycleNum > totalCycles) {
          setPhase("done");
          setProgress(1);
          if (onCycle) onCycle(totalCycles);
          return;
        }
        let p = phaseOrder[phaseIdx];
        setPhase(p.name);

        let phaseDuration = p.time * 1000;
        // Only skip to resume if we're actually resuming AND have progress
        let shouldSkip = skipToResume && isResuming && resumeProgress > 0;
        let phaseStart = Date.now() - (shouldSkip ? resumeProgress * phaseDuration : 0);
        let phaseProgress = shouldSkip ? resumeProgress : 0;

        function animate() {
          if (!mounted || !runningRef.current) return;
          let elapsed = Date.now() - phaseStart;
          phaseProgress = Math.min(1, elapsed / phaseDuration);
          setProgress(phaseProgress);
          pausedStateRef.current = {
            phase: p.name,
            progress: phaseProgress,
            phaseIdx,
            cycleNum,
          };
          
          if (onCycle) onCycle(cycleNum);
          
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
      nextPhase(true);
    }

    if (!running) {
      previousRunningRef.current = false;
    }
    
    runVisualizer();
    return () => {
      mounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [running, pattern, onCycle]);

  // Zigzag wave path with 60-degree diagonals
  const viewWidth = 700;
  const viewHeight = 260;
  const padding = 40;
  const availableHeight = viewHeight - (2 * padding);
  const topY = padding;
  const bottomY = viewHeight - padding;
  
  const diagonalHorizontal = availableHeight / Math.sqrt(3);
  const diagonalLength = Math.sqrt(diagonalHorizontal ** 2 + availableHeight ** 2);
  const topHorizontalLength = diagonalLength * 0.5;
  const bottomHorizontalLength = 15;
  
  const cycleWidth = bottomHorizontalLength + diagonalHorizontal + topHorizontalLength + diagonalHorizontal;
  const numCycles = Math.ceil(viewWidth / cycleWidth) + 2;
  
  // Build zigzag path
  const points = [];
  let currentX = 0;
  
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
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  // Calculate animation offset for scrolling path
  const totalPhaseDuration = pattern.inhale + pattern.hold + pattern.exhale;
  let cycleProgress = 0;

  if (phase === "inhale") {
    cycleProgress = (progress * pattern.inhale) / totalPhaseDuration;
  } else if (phase === "hold") {
    cycleProgress = (pattern.inhale + progress * pattern.hold) / totalPhaseDuration;
  } else if (phase === "exhale") {
    cycleProgress = (pattern.inhale + pattern.hold + progress * pattern.exhale) / totalPhaseDuration;
  }

  const animationOffset = cycleProgress * cycleWidth;
  
  // Calculate ball Y position - find where the line is at the center of viewport
  let circleY = bottomY;
  const centerX = viewWidth / 2;
  
  // The X position on the path that's currently at the center of the viewport
  const pathXAtCenter = centerX + (animationOffset % cycleWidth);
  
  // Find which segment of the path contains this X position
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    if (pathXAtCenter >= p1.x && pathXAtCenter <= p2.x) {
      // Interpolate Y position within this segment
      const segmentProgress = (pathXAtCenter - p1.x) / (p2.x - p1.x);
      circleY = p1.y + (p2.y - p1.y) * segmentProgress;
      break;
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center session-visualizer">
      <div className="flex flex-col items-center justify-center mb-8 mt-12">
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
            <path
              d={pathD}
              stroke="#ff6a00"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>

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
