
import React, { useEffect, useState, useRef } from 'react';

// Ball animates along three lines: up (inhale, 60deg), straight (hold), down (exhale, -60deg)
export default function BreathingVisualizer({ pattern, running, onCycle, onRemaining }) {
	const [phase, setPhase] = useState('idle');
	const [progress, setProgress] = useState(0);
	const [cycle, setCycle] = useState(0);
	const [remaining, setRemaining] = useState(0);
	const requestRef = useRef();

	useEffect(() => {
		let mounted = true;
		let totalCycles = 8;
		let phaseOrder = [
			{ name: 'inhale', time: pattern.inhale },
			{ name: 'hold', time: pattern.hold },
			{ name: 'exhale', time: pattern.exhale }
		];

		function runVisualizer() {
			if (!running) {
				setPhase('idle');
				setProgress(0);
				setCycle(0);
				setRemaining(totalCycles * (pattern.inhale + pattern.hold + pattern.exhale));
				if (onCycle) onCycle(0);
				if (onRemaining) onRemaining(totalCycles * (pattern.inhale + pattern.hold + pattern.exhale));
				return;
			}
			let phaseIdx = 0;
			let cycleNum = 1;

			function nextPhase() {
				if (!mounted) return;
				if (cycleNum > totalCycles) {
					setPhase('done');
					setProgress(1);
					setCycle(totalCycles);
					setRemaining(0);
					if (onCycle) onCycle(totalCycles);
					if (onRemaining) onRemaining(0);
					return;
				}
				let p = phaseOrder[phaseIdx];
				setPhase(p.name);
				let phaseStart = Date.now();
				let phaseDuration = p.time * 1000;
				let phaseProgress = 0;

				function animate() {
					if (!mounted) return;
					let elapsed = Date.now() - phaseStart;
					phaseProgress = Math.min(1, elapsed / phaseDuration);
					setProgress(phaseProgress);
					setCycle(cycleNum);
					let rem = (totalCycles - cycleNum) * (pattern.inhale + pattern.hold + pattern.exhale) + (p.time - elapsed/1000);
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
			nextPhase();
		}

		runVisualizer();
		return () => {
			mounted = false;
			if (requestRef.current) cancelAnimationFrame(requestRef.current);
		};
	}, [running, pattern, onCycle, onRemaining]);

	// Ball position logic for segmented path
	// Path: start at left, go up at 60deg (inhale), straight (hold), down at -60deg (exhale)
	// SVG coordinates: left (x0,y0), up (x1,y1), straight (x2,y2), down (x3,y3)
	const width = 440, height = 160;
	const x0 = 60, y0 = 120;
	const segment = 120;
	// 60deg up: dx=segment*cos(60deg)=50, dy=-segment*sin(60deg)= -86.6
	const x1 = x0 + segment * Math.cos(Math.PI/3), y1 = y0 - segment * Math.sin(Math.PI/3);
	// straight: dx=segment, dy=0
	const x2 = x1 + segment, y2 = y1;
	// 60deg down: dx=segment*cos(60deg)=50, dy=segment*sin(60deg)=86.6
	const x3 = x2 + segment * Math.cos(Math.PI/3), y3 = y2 + segment * Math.sin(Math.PI/3);

	// Ball position by phase (centered on the line)
	const ballRadius = 22;
	let ballX = x0, ballY = y0;
	let totalProgress = 0;
	// Calculate total progress (0 to 1) through the whole path
	if (phase === 'inhale') {
		totalProgress = (cycle-1 + progress) / (8);
		ballX = x0 + (x1-x0)*progress;
		ballY = y0 + (y1-y0)*progress;
	} else if (phase === 'hold') {
		totalProgress = (cycle-1 + 1 + progress) / (8);
		ballX = x1 + (x2-x1)*progress;
		ballY = y1;
	} else if (phase === 'exhale') {
		totalProgress = (cycle-1 + 2 + progress) / (8);
		ballX = x2 + (x3-x2)*progress;
		ballY = y2 + (y3-y2)*progress;
	} else {
		totalProgress = 0;
	}

	const getPhaseColor = () => {
		if (phase === 'inhale') return 'linear-gradient(180deg, #ffd5b8, #ffb07a)';
		if (phase === 'hold') return 'linear-gradient(180deg, #ffe7b8, #ffbf6a)';
		if (phase === 'exhale') return 'linear-gradient(180deg, #ffb07a, #ff7a1f)';
		return 'linear-gradient(180deg, #f0f0f0, #e7e7e7)';
	};

	// Path for static segmented line
	const pathD = `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;

	return (
		<div className="w-full flex flex-col items-center justify-center session-visualizer">
			<div className="relative w-full h-48 flex items-center justify-center mb-8">
				<svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{width:'100%',height:'160px',zIndex:1}}>
					{/* Static segmented line */}
					<path d={pathD} stroke="#ff6a00" strokeWidth="22" strokeLinecap="round" fill="none" />
					{/* Ball (centered on line) */}
					<circle cx={ballX} cy={ballY} r={ballRadius} fill="#fff" stroke="#ff8a1f" strokeWidth={5} filter="url(#shadow)" style={{zIndex:2}} />
					<defs>
						<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
							<feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#ffb07a" floodOpacity="0.22" />
						</filter>
					</defs>
				</svg>
				{/* Phase label */}
				<div className="absolute left-1/2 top-2/3 -translate-x-1/2 visualizer-label" style={{marginTop:'8px',zIndex:2}}>
					{phase==='idle'?'Ready':phase==='done'?'Done':phase.charAt(0).toUpperCase()+phase.slice(1)}
				</div>
			</div>
		</div>
	);
}
