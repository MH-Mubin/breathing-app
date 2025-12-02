import { useState } from "react";
import BreathingVisualizer from "./BreathingVisualizer";

const patterns = [
  {
    name: "4-4-4 Balanced",
    inhale: 4,
    hold: 4,
    exhale: 4,
    desc: "Equal timing promotes harmony",
  },
  {
    name: "Extended Calm",
    inhale: 4,
    hold: 7,
    exhale: 8,
    desc: "Extended exhale for calm",
  },
  {
    name: "4-4-4 Box",
    inhale: 4,
    hold: 4,
    exhale: 4,
    desc: "Navy SEAL technique",
  },
];

const durations = [3, 5, 8, 10];

export default function BreathingSession() {
  const [selectedPattern, setSelectedPattern] = useState(patterns[0]);
  const [duration, setDuration] = useState(5);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(5 * 60);
  const [paused, setPaused] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [customDurationValue, setCustomDurationValue] = useState(null);
  const [validationError, setValidationError] = useState("");

  const handleStart = () => {
    setRunning(true);
    setPaused(false);
    setCycle(1);
    setRemaining(duration * 60);
  };
  const handlePause = () => {
    setPaused(true);
    setRunning(false);
  };
  const handleResume = () => {
    setPaused(false);
    setRunning(true);
  };
  const handleReset = () => {
    setRunning(false);
    setPaused(false);
    setCycle(0);
    setRemaining(duration * 60);
  };

  const validateInput = (value) => {
    if (!value || value.trim() === "") {
      setValidationError("");
      return false;
    }

    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0 || numValue > 60) {
      setValidationError("Please enter a valid number between 1-60");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleCustomDuration = () => {
    const customValue = parseInt(customDuration, 10);

    if (isNaN(customValue) || customValue <= 0 || customValue > 60) {
      setValidationError("Please enter a valid number between 1-60");
      return;
    }

    // Valid input - create custom duration button
    setCustomDurationValue(customValue);
    setDuration(customValue);
    if (!running) setRemaining(customValue * 60);
    setCustomDuration("");
    setShowCustomInput(false);
    setValidationError("");
  };

  return (
    <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mt-4 px-2 md:px-0">
      {/* Left Panel */}
      <aside className="md:col-span-1">
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="orange text-2xl">🔥</span>
            <span className="font-semibold">Current Streak</span>
          </div>
          <div className="text-xl font-bold">7 days</div>
          <div className="mt-2 btn-outline px-2 py-1 text-xs">
            Completed Today
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="stat-card">
            <div className="font-bold">24</div>
            <div className="text-xs">Sessions</div>
          </div>
          <div className="stat-card">
            <div className="font-bold">120</div>
            <div className="text-xs">Minutes</div>
          </div>
        </div>
        <div className="card p-4 mb-4">
          <div className="orange text-xl mb-1">🧡</div>
          <div className="font-semibold">Reduces Stress</div>
          <div className="text-xs text-gray-500">Lowers cortisol</div>
        </div>
        <div className="card p-4 mb-4">
          <div className="orange text-xl mb-1">🧠</div>
          <div className="font-semibold">Improves Focus</div>
          <div className="text-xs text-gray-500">Mental clarity</div>
        </div>
        <div className="card p-4 mb-4">
          <div className="orange text-xl mb-1">⚡</div>
          <div className="font-semibold">Boosts Energy</div>
          <div className="text-xs text-gray-500">Oxygen flow</div>
        </div>
      </aside>

      {/* Center Visualizer */}
      <section className="md:col-span-3 flex flex-col items-center justify-center">
        <div
          className="card w-full p-8 md:p-12 flex flex-col items-center"
          style={{ minHeight: "480px" }}
        >
          <div className="mb-4 text-center">
            <span className="session-badge">Practice Session</span>
            <h2 className="session-title">
              Find your rhythm, one breath at a time
            </h2>
          </div>
          <BreathingVisualizer
            pattern={selectedPattern}
            running={running}
            onCycle={setCycle}
            onRemaining={setRemaining}
          />
          <div className="flex gap-8 mt-8 mb-4 justify-center">
            <div className="text-center">
              <div className="count">{cycle}</div>
              <div className="label">Cycles</div>
            </div>
            <div className="text-center">
              <div className="count">
                {Math.floor((duration * 60 - remaining) / 60)}:
                {((duration * 60 - remaining) % 60).toString().padStart(2, "0")}
              </div>
              <div className="label">Time</div>
            </div>
            <div className="text-center">
              <div className="count">
                {Math.floor(remaining / 60)}:
                {(remaining % 60).toString().padStart(2, "0")}
              </div>
              <div className="label">Remaining</div>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {!running && !paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2"
                onClick={handleStart}
                aria-label="Start session"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3v18l15-9L5 3z" fill="#fff" />
                </svg>{" "}
                Start
              </button>
            )}
            {running && !paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2"
                onClick={handlePause}
                aria-label="Pause session"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="6" y="4" width="4" height="16" fill="#fff" />
                  <rect x="14" y="4" width="4" height="16" fill="#fff" />
                </svg>{" "}
                Pause
              </button>
            )}
            {paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2"
                onClick={handleResume}
                aria-label="Resume session"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M5 3v18l15-9L5 3z" fill="#fff" />
                </svg>{" "}
                Resume
              </button>
            )}
            <button
              className="btn-outline reset-btn px-6 py-2 flex items-center justify-center"
              onClick={handleReset}
              aria-label="Reset session"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Right Panel */}
      <aside className="md:col-span-1">
        <div className="card p-4 mb-4">
          <div className="font-semibold mb-3">Duration</div>
          
          {/* 2x2 Grid for preset durations */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {durations.map((d) => (
              <button
                key={d}
                className={
                  duration === d && !showCustomInput
                    ? "px-3 py-2 rounded bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition"
                    : "px-3 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition"
                }
                onClick={() => {
                  setDuration(d);
                  setShowCustomInput(false);
                  if (!running) setRemaining(d * 60);
                }}
                aria-pressed={duration === d && !showCustomInput}
              >
                {d} min
              </button>
            ))}
          </div>
          
          {/* Customize button - always visible */}
          <button
            className={
              showCustomInput
                ? "w-full px-3 py-2 rounded bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition"
                : "w-full px-3 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition"
            }
            onClick={() => {
              setShowCustomInput(true);
            }}
          >
            Customize
          </button>
          
          {/* Custom input field or Custom duration button */}
          {showCustomInput ? (
            <div className="w-full mt-2">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  inputMode="numeric"
                  value={customDuration}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setCustomDuration(value);
                    validateInput(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && customDuration && !validationError) {
                      handleCustomDuration();
                    }
                  }}
                  placeholder="1-60"
                  className={`flex-1 min-w-0 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                    validationError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                />
                <button
                  onClick={handleCustomDuration}
                  disabled={!customDuration || !!validationError}
                  className={`px-4 py-2 rounded text-sm font-semibold transition whitespace-nowrap ${
                    !customDuration || validationError
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  Apply
                </button>
              </div>
              {validationError && (
                <p className="text-red-500 text-xs mt-1">{validationError}</p>
              )}
            </div>
          ) : customDurationValue ? (
            <button
              className={
                duration === customDurationValue
                  ? "w-full px-3 py-2 rounded bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 transition mt-2"
                  : "w-full px-3 py-2 rounded bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition mt-2"
              }
              onClick={() => {
                setDuration(customDurationValue);
                if (!running) setRemaining(customDurationValue * 60);
              }}
            >
              {customDurationValue} min
            </button>
          ) : null}
        </div>
        
        <div className="card p-4 mb-4">
          <div className="font-semibold mb-2">Pattern</div>
          {patterns.map((p) => (
            <div
              key={p.name}
              className={
                selectedPattern.name === p.name
                  ? "btn-primary px-3 py-2 mb-2 flex flex-col"
                  : "btn-outline px-3 py-2 mb-2 flex flex-col"
              }
              onClick={() => setSelectedPattern(p)}
              style={{ cursor: "pointer" }}
            >
              <span>{p.name}</span>
              <span className="text-xs text-gray-600">{p.desc}</span>
              <span className="text-xs mt-1">
                In: {p.inhale}s Hold: {p.hold}s Out: {p.exhale}s
              </span>
            </div>
          ))}
        </div>
        <div className="card p-4 mb-4">
          <div className="font-semibold mb-2">Quick Tips</div>
          <div className="text-xs mb-1">Find Your Rhythm</div>
          <div className="text-xs mb-1">Start slow</div>
          <div className="text-xs mb-1">Nose Breathing</div>
        </div>
      </aside>
    </div>
  );
}
