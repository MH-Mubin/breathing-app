import React from 'react';

export default function RightPanel({ onStart }) {
	return (
		<div className="bg-white p-4 rounded shadow-sm w-full">
			<h3 className="font-semibold">Controls</h3>
			<div className="mt-3">
				<button onClick={onStart} className="px-3 py-2 bg-cyan-500 text-white rounded">Start Session</button>
			</div>
		</div>
	);
}
