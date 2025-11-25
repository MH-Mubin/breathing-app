
import React from 'react';

export default function Dashboard() {
	return (
		<div className="max-w-6xl mx-auto mt-8">
			<div className="card bg-dark text-light p-8 mb-8">
				<h2 className="text-2xl font-bold mb-2">Your Dashboard</h2>
				<p className="mb-6 text-gray-300">Track your breathing journey and progress</p>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<div className="stat-card">
						<div className="orange text-2xl mb-1">🧡</div>
						<div className="font-bold text-xl">48</div>
						<div className="text-xs">Total Sessions</div>
						<div className="text-xs text-orange-400 mt-1">+12 this week</div>
					</div>
					<div className="stat-card">
						<div className="orange text-2xl mb-1">🧡</div>
						<div className="font-bold text-xl">240</div>
						<div className="text-xs">Total Minutes</div>
						<div className="text-xs text-orange-400 mt-1">+80 this week</div>
					</div>
					<div className="stat-card">
						<div className="orange text-2xl mb-1">🧡</div>
						<div className="font-bold text-xl">14</div>
						<div className="text-xs">Longest Streak</div>
						<div className="text-xs text-orange-400 mt-1">Personal best</div>
					</div>
					<div className="stat-card">
						<div className="orange text-2xl mb-1">🧡</div>
						<div className="font-bold text-xl">12.0</div>
						<div className="text-xs">Avg per Week</div>
						<div className="text-xs text-orange-400 mt-1">Consistent!</div>
					</div>
				</div>
				<div className="card p-6 mb-8">
					<h3 className="font-semibold mb-2">Activity History</h3>
					<div className="w-full h-32 bg-gray-100 rounded mb-2 flex items-end">
						<svg width="100%" height="100%" viewBox="0 0 400 100">
							<polyline points="10,90 50,80 90,70 130,60 170,50 210,40 250,30 290,20 330,10 370,10" stroke="#ff8800" strokeWidth="4" fill="none" />
						</svg>
					</div>
					<div className="flex gap-4 text-xs text-gray-500">
						<span>Sessions</span>
						<span>Minutes</span>
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<div className="card p-6">
						<h4 className="font-semibold mb-2">Achievements</h4>
						<div className="grid grid-cols-2 gap-2">
							<div className="bg-orange-400 rounded p-2 text-center text-light">First Breath<br /><span className="text-xs">Complete your first session</span></div>
							<div className="bg-orange-400 rounded p-2 text-center text-light">Week Warrior<br /><span className="text-xs">7 consecutive days</span></div>
							<div className="bg-orange-400 rounded p-2 text-center text-light">Century Club<br /><span className="text-xs">Complete 100 minutes</span></div>
							<div className="bg-gray-200 rounded p-2 text-center text-gray-400">Consistency King<br /><span className="text-xs">Complete 50 sessions</span></div>
							<div className="bg-gray-200 rounded p-2 text-center text-gray-400">Power Hour<br /><span className="text-xs">10 minute session</span></div>
							<div className="bg-gray-200 rounded p-2 text-center text-gray-400">Master Breather<br /><span className="text-xs">30 consecutive days</span></div>
						</div>
					</div>
					<div className="card p-6">
						<h4 className="font-semibold mb-2">Recent Sessions</h4>
						<div className="flex flex-col gap-2">
							<div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
								<span>Today</span><span className="orange">5 min</span>
							</div>
							<div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
								<span>Yesterday</span><span className="orange">8 min</span>
							</div>
							<div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
								<span>Nov 22</span><span className="orange">5 min</span>
							</div>
							<div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
								<span>Nov 21</span><span className="orange">8 min</span>
							</div>
							<div className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
								<span>Nov 20</span><span className="orange">10 min</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

