// Simple WebAudio-based utilities for phase sounds
let audioCtx = null;
let masterGain = null;
let enabled = true;

function getAudioCtx() {
	if (!audioCtx) {
		audioCtx = new (window.AudioContext || window.webkitAudioContext)();
		masterGain = audioCtx.createGain();
		masterGain.gain.value = 0.15;
		masterGain.connect(audioCtx.destination);
	}
	return audioCtx;
}

export function setEnabled(v) {
	enabled = !!v;
	localStorage.setItem('breathing_sound_enabled', enabled ? '1' : '0');
}

export function isEnabled() {
	const stored = localStorage.getItem('breathing_sound_enabled');
	if (stored === null) return true;
	return stored === '1';
}

export async function playTone(freq = 440, duration = 400) {
	if (!isEnabled()) return;
	try {
		const ctx = getAudioCtx();
		// resume context on some browsers if suspended
		if (ctx.state === 'suspended') await ctx.resume();

		const osc = ctx.createOscillator();
		osc.type = 'sine';
		osc.frequency.value = freq;
		const g = ctx.createGain();
		g.gain.setValueAtTime(0, ctx.currentTime);
		g.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01);
		g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration / 1000);
		osc.connect(g);
		g.connect(masterGain || ctx.destination);
		osc.start();
		osc.stop(ctx.currentTime + duration / 1000 + 0.02);
	} catch (err) {
		console.warn('Sound play error', err);
	}
}

export function playPhaseSound(phase) {
	// frequencies chosen to be pleasant
	if (!isEnabled()) return;
	if (phase === 'inhale') return playTone(440, 450);
	if (phase === 'hold') return playTone(523.25, 350);
	if (phase === 'exhale') return playTone(349.23, 450);
	return null;
}

export default { playTone, playPhaseSound, setEnabled, isEnabled };

