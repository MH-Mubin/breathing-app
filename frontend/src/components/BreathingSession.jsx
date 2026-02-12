import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import api from "../utils/api";
import { PatternValidator } from "../utils/PatternValidator";
import BreathingVisualizer from "./BreathingVisualizer";

const categories = [
  { id: "focus", name: "Focus & Concentration" },
  { id: "stress", name: "Stress Relief" },
  { id: "sleep", name: "Sleep & Rest" },
  { id: "energy", name: "Energy Boost" },
  { id: "health", name: "Health & Recovery" },
  { id: "emotional", name: "Emotional Balance" },
];

const patternsByCategory = {
  focus: [
    { level: "Beginner", name: "5-2-7", type: "3-phase", inhale: 5, holdTop: 2, exhale: 7, category: "focus", description: "Balances focus + calm" },
    { level: "Intermediate", name: "4-4-6", type: "3-phase", inhale: 4, holdTop: 4, exhale: 6, category: "focus", description: "Regulates attention and reduces distractions" },
    { level: "Advanced", name: "5-3-9", type: "3-phase", inhale: 5, holdTop: 3, exhale: 9, category: "focus", description: "Longer exhale deepens focus and mental clarity" },
    { level: "Pro", name: "6-2-10", type: "3-phase", inhale: 6, holdTop: 2, exhale: 10, category: "focus", description: "Used by elite performers for stable concentration" },
  ],
  stress: [
    { level: "Beginner", name: "4-0-6", type: "3-phase", inhale: 4, holdTop: 0, exhale: 6, category: "stress", description: "Immediately reduces stress" },
    { level: "Intermediate", name: "Box Breathing", type: "4-phase", inhale: 4, holdTop: 4, exhale: 4, holdBottom: 4, category: "stress", description: "Navy SEAL technique - Creates calm under pressure" },
    { level: "Advanced", name: "4-7-8", type: "3-phase", inhale: 4, holdTop: 7, exhale: 8, category: "stress", description: "Andrew Weil Method - Deeply relaxes nervous system" },
    { level: "Pro", name: "Coherent 6-0-6", type: "3-phase", inhale: 6, holdTop: 0, exhale: 6, category: "stress", description: "Balances heart and brain waves" },
  ],
  sleep: [
    { level: "Beginner", name: "4-0-6", type: "3-phase", inhale: 4, holdTop: 0, exhale: 6, category: "sleep", description: "Slows heart rate" },
    { level: "Intermediate", name: "4-7-8", type: "3-phase", inhale: 4, holdTop: 7, exhale: 8, category: "sleep", description: "Scientifically shown to reduce anxiety and induce sleep" },
    { level: "Advanced", name: "5-0-10", type: "3-phase", inhale: 5, holdTop: 0, exhale: 10, category: "sleep", description: "Long exhale signals brain to release melatonin" },
    { level: "Pro", name: "6-0-10", type: "3-phase", inhale: 6, holdTop: 0, exhale: 10, category: "sleep", description: "Used by meditation experts for deep rest" },
  ],
  energy: [
    { level: "Beginner", name: "3-1-3", type: "3-phase", inhale: 3, holdTop: 1, exhale: 3, category: "energy", description: "Gentle stimulation without hyperventilation" },
    { level: "Intermediate", name: "Fast Paced 2-0-2", type: "3-phase", inhale: 2, holdTop: 0, exhale: 2, category: "energy", description: "Boosts alertness quickly" },
    { level: "Advanced", name: "Kapalabhati 1-0-1", type: "3-phase", inhale: 1, holdTop: 0, exhale: 1, category: "energy", description: "Sharp inhale/exhale × 20 cycles (gentle)" },
    { level: "Pro", name: "Sharp 6 + Deep", type: "3-phase", inhale: 6, holdTop: 0, exhale: 6, category: "energy", description: "6 sharp exhales then deep breath - Used by performers" },
  ],
  health: [
    { level: "Beginner", name: "Nasal 6-0-6", type: "3-phase", inhale: 6, holdTop: 0, exhale: 6, category: "health", description: "Trains lungs and improves HRV (nasal breathing only)" },
    { level: "Intermediate", name: "6-3-6", type: "3-phase", inhale: 6, holdTop: 3, exhale: 6, category: "health", description: "Promotes optimal oxygen + CO₂ balance" },
    { level: "Advanced", name: "Cadence 5-0-7", type: "3-phase", inhale: 5, holdTop: 0, exhale: 7, category: "health", description: "5-7 breaths/min ideal for heart-lung sync" },
    { level: "Pro", name: "CO₂ Training 4-0-12", type: "3-phase", inhale: 4, holdTop: 0, exhale: 12, category: "health", description: "Develops strong CO₂ tolerance" },
  ],
  emotional: [
    { level: "Beginner", name: "Physiological Sigh", type: "3-phase", inhale: 2, holdTop: 2, exhale: 6, category: "emotional", description: "2s inhale + 2s top-up inhale + 6s exhale - Stops panic instantly" },
    { level: "Intermediate", name: "4-2-6", type: "3-phase", inhale: 4, holdTop: 2, exhale: 6, category: "emotional", description: "Balances mood" },
    { level: "Advanced", name: "3-3-6", type: "3-phase", inhale: 3, holdTop: 3, exhale: 6, category: "emotional", description: "Used in trauma-informed breathing therapy" },
    { level: "Pro", name: "Vagal Toning 5-0-8", type: "3-phase", inhale: 5, holdTop: 0, exhale: 8, category: "emotional", description: "Slow nasal inhale + humming exhale - Stimulates vagus nerve" },
  ],
};

const durations = [3, 5, 8, 10];

// Benefits data mapped to categories
const benefitsByCategory = {
  focus: [
    { emoji: "🎯", title: "Boosts Clarity"},
    { emoji: "🧠", title: "Sharpens Attention"},
    { emoji: "💡", title: "Enhances Memory"},
    { emoji: "🎓", title: "Steadies Thoughts"},
    { emoji: "⚡", title: "Improves Control"},
  ],
  stress: [
    { emoji: "😌", title: "Calms Nerves"},
    { emoji: "🧘", title: "Lowers Cortisol"},
    { emoji: "💆", title: "Relaxes Muscles"},
    { emoji: "🌊", title: "Eases Tension"},
    { emoji: "☮️", title: "Stabilizes Mood"},
  ],
  sleep: [
    { emoji: "💤", title: "Slows Heartbeat"},
    { emoji: "🛌", title: "Relaxes Body"},
    { emoji: "🌙", title: "Clears Mind"},
    { emoji: "😴", title: "Deepens Rest"},
    { emoji: "🌟", title: "Reduces Stress"},
  ],
  energy: [
    { emoji: "🫁", title: "Increases Oxygen"},
    { emoji: "⚡", title: "Elevates Alertness"},
    { emoji: "🔋", title: "Activates Body"},
    { emoji: "💪", title: "Improves Stamina"},
    { emoji: "☀️", title: "Reduces Fatigue"},
  ],
  health: [
    { emoji: "🫁", title: "Strengthens Lungs"},
    { emoji: "❤️", title: "Enhances Circulation"},
    { emoji: "🩺", title: "Supports Healing"},
    { emoji: "⚖️", title: "Balances Breath"},
    { emoji: "🛡️", title: "Builds Resilience"},
  ],
  emotional: [
    { emoji: "🧘‍♀️", title: "Reduces Anxiety"},
    { emoji: "💚", title: "Steadies Emotions"},
    { emoji: "🌈", title: "Lowers Stress"},
    { emoji: "🎭", title: "Improves Control"},
    { emoji: "✨", title: "Clears Thoughts"},
  ],
};

// Preview benefits (one from each category)
const previewBenefits = [
  { emoji: "😌", title: "Reduces Stress"},
  { emoji: "🎯", title: "Improves Focus"},
  { emoji: "⚡", title: "Boosts Energy"},
  { emoji: "💤", title: "Better Sleep"},
  { emoji: "❤️", title: "Health & Recovery"},
  { emoji: "🧘♀️", title: "Emotional Balance"},
];

export default function BreathingSession() {
  const { token, user, reloadUser } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [lastCategory, setLastCategory] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(patternsByCategory.focus[0]);
  const [duration, setDuration] = useState(5);
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(5 * 60);
  const [paused, setPaused] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customDuration, setCustomDuration] = useState("");
  const [customDurationValue, setCustomDurationValue] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [patternValidationError, setPatternValidationError] = useState("");
  const [sessionId, setSessionId] = useState(null);

  // Validate all patterns on component mount
  useEffect(() => {
    const validateAllPatterns = () => {
      let hasInvalidPatterns = false;
      
      Object.entries(patternsByCategory).forEach(([category, patterns]) => {
        patterns.forEach(pattern => {
          if (!PatternValidator.validatePattern(pattern)) {
            console.error(`Invalid pattern found in ${category}:`, pattern);
            hasInvalidPatterns = true;
          }
        });
      });
      
      if (hasInvalidPatterns) {
        setPatternValidationError("Some patterns have invalid configurations. Check console for details.");
      }
    };
    
    validateAllPatterns();
  }, []);

  // Timer effect - manages countdown independently
  useEffect(() => {
    if (!running || remaining <= 0) {
      // Session completed
      if (remaining === 0 && sessionId && token) {
        // Complete session
        const completeSessionAsync = async () => {
          try {
            const totalDuration = duration * 60;
            const pattern = {
              inhale: selectedPattern.inhale,
              hold: selectedPattern.holdTop || 0,
              exhale: selectedPattern.exhale,
            };

            const response = await api.post("/session/complete", {
              sessionId,
              duration: totalDuration,
              pattern,
            });

            if (response.data.success) {
              const { streak, totalSessions, newAchievements } = response.data.data;
              
              toast.success(`Session completed! 🎉 Streak: ${streak} days`);
              
              if (newAchievements && newAchievements.length > 0) {
                newAchievements.forEach(achievement => {
                  toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                    duration: 5000,
                  });
                });
              }
              
              setSessionId(null);
              // Refresh user stats (streak) immediately
              reloadUser();
            }
          } catch (error) {
            console.error("Failed to save session:", error);
            toast.error("Session completed but failed to save. Please check your connection.");
          }
        };
        
        completeSessionAsync();
      }
      return;
    }
    
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [running, remaining, sessionId, token, duration, selectedPattern]);

  const handleStart = async () => {
    // Start session in database if user is logged in
    if (token) {
      try {
        const pattern = {
          inhale: selectedPattern.inhale,
          hold: selectedPattern.holdTop || 0,
          exhale: selectedPattern.exhale,
        };

        const response = await api.post("/session/start", {
          duration: duration * 60,
          pattern,
        });

        if (response.data.success) {
          setSessionId(response.data.data._id);
        }
      } catch (error) {
        console.error("Failed to start session:", error);
        // Continue anyway - session will work offline
      }
    }

    setRunning(true);
    setPaused(false);
    setCycle(1);
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
    setResetKey(prev => prev + 1); // Force visualizer to remount
    setSessionId(null); // Clear session ID
  };

  const handlePatternSelection = (pattern) => {
    // Validate pattern configuration integrity
    if (!PatternValidator.validatePattern(pattern)) {
      setPatternValidationError(`Invalid pattern configuration: ${pattern.name}`);
      console.error('Pattern validation failed:', pattern);
      return;
    }
    
    // Clear any previous validation errors
    setPatternValidationError("");
    
    // Set the validated pattern
    setSelectedPattern(pattern);
    
    // Reset animation if running to recalculate paths
    if (running) {
      setRunning(false);
      setTimeout(() => {
        setResetKey(prev => prev + 1); // Force visualizer to remount with new pattern
      }, 100);
    } else {
      setResetKey(prev => prev + 1); // Force visualizer to remount with new pattern
    }
  };

  const handleCustomDuration = () => {
    // Validate only when Apply is clicked
    if (!customDuration || customDuration.trim() === "") {
      setValidationError("Please enter a duration");
      return;
    }

    const customValue = parseInt(customDuration, 10);

    // Check if it's a valid number
    if (isNaN(customValue)) {
      setValidationError("Enter a number between 1-60");
      return;
    }

    // Check if it's in range
    if (customValue <= 0 || customValue > 60) {
      setValidationError("Please enter a number between 1-60");
      return;
    }

    // If session is running or paused, reset it completely
    if (running || paused) {
      setRunning(false);
      setPaused(false);
      setCycle(0);
      setSessionId(null);
      setResetKey(prev => prev + 1); // Force visualizer remount
    }

    // Check if the value matches a preset duration (3, 5, 8, 10)
    if (durations.includes(customValue)) {
      // Just select the preset button, don't create custom button
      setDuration(customValue);
      setCustomDurationValue(null); // Clear custom value
      setRemaining(customValue * 60); // Always update remaining time
      setCustomDuration("");
      setShowCustomInput(false);
      setValidationError("");
    } else {
      // Create custom duration button for other values
      setCustomDurationValue(customValue);
      setDuration(customValue);
      setRemaining(customValue * 60); // Always update remaining time
      setCustomDuration("");
      setShowCustomInput(false);
      setValidationError("");
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mt-4 px-2 md:px-0 md:items-start">
      {/* Left Panel */}
      <aside className="md:col-span-1 self-start">
        {/* Streak Card - Enhanced Design (Smaller) */}


        {/* Quick Tips */}
        {/* Quick Tips - Styled */}
        <div className="card p-4 mb-3 bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <div className="font-bold text-gray-800">Quick Tips</div>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span className="text-sm text-gray-700">Breathe through your nose</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span className="text-sm text-gray-700">Start slow & relaxed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span className="text-sm text-gray-700 italic">"If you're a beginner, start with a simple pattern like 5-2-7."</span>
            </li>
          </ul>
        </div>

        {/* Benefits Section */}
        {!selectedCategory ? (
          // Show preview of all 6 categories
          <>
            {previewBenefits.map((benefit, index) => (
              <div
                key={index}
                className="card p-3 mb-2 hover:shadow-md hover:border-primary transition-all duration-200 cursor-pointer flex items-center gap-3"
              >
                <div className="text-2xl">{benefit.emoji}</div>
                <div className="font-semibold text-sm text-gray-800">{benefit.title}</div>
              </div>
            ))}
          </>
        ) : (
          // Show 5 benefits for selected category
          <>
            {benefitsByCategory[selectedCategory].map((benefit, index) => (
              <div
                key={index}
                className="card p-3 mb-2 hover:shadow-md hover:border-primary transition-all duration-200 flex items-center gap-3"
              >
                <div className="text-2xl">{benefit.emoji}</div>
                <div className="font-semibold text-sm text-gray-800">{benefit.title}</div>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* Center Visualizer */}
      <section className="md:col-span-3 flex flex-col items-center justify-center self-start">
        <div
          className="card w-full p-8 md:p-12 flex flex-col items-center relative"
          style={{ minHeight: "480px" }}
        >
          {/* Top Left Streak Badge */}
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-primary-light px-3 py-1.5 rounded-xl border border-primary shadow-sm">
            <span className="text-2xl">🔥</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">Streak</span>
              <div className="flex items-center gap-2">
                 <span className="text-lg font-bold text-primary-dark leading-none">{user?.stats?.streak || 0} days</span>
                 {user?.stats?.streak > 0 && (
                  <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    Active
                  </span>
                 )}
              </div>
            </div>
          </div>
          <div className="mb-4 text-center">
            <span className="session-badge">Practice Session</span>
            <h2 className="session-title mb-2">
              Find your rhythm, one breath at a time
            </h2>
            <p className="text-gray-1500 text-lg font-medium animate-pulse">
              ✨ Breathe through your chest, not the belly ✨
            </p>
          </div>
          {(() => {
            try {
              return (
                <BreathingVisualizer
                  key={resetKey}
                  pattern={selectedPattern}
                  running={running}
                  onCycle={setCycle}
                  duration={duration}
                />
              );
            } catch (error) {
              console.error('BreathingVisualizer error:', error);
              return (
                <div className="w-full h-64 bg-red-50 rounded-lg flex items-center justify-center border-2 border-red-300">
                  <div className="text-center">
                    <div className="text-red-600 mb-2">Visualizer Error</div>
                    <div className="text-sm text-red-500 mb-4">{error.message}</div>
                    <button 
                      onClick={() => setResetKey(prev => prev + 1)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              );
            }
          })()}
          <div className="flex gap-12 mt-8 mb-4 justify-center items-center">
            <div className="text-center bg-gradient-to-br from-primary-light to-white px-6 py-3 rounded-xl shadow-sm border border-primary">
              <div className="text-xs font-medium text-primary-dark mb-1">Time Elapsed</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.floor((duration * 60 - remaining) / 60)}:
                {((duration * 60 - remaining) % 60).toString().padStart(2, "0")}
              </div>
            </div>
            <div className="text-center bg-gradient-to-br from-primary-light to-white px-6 py-3 rounded-xl shadow-sm border border-primary">
              <div className="text-xs font-medium text-primary-dark mb-1">Time Remaining</div>
              <div className="text-2xl font-bold text-gray-800">
                {Math.floor(remaining / 60)}:
                {(remaining % 60).toString().padStart(2, "0")}
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            {!running && !paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-heading"
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
                  <path d="M5 3v18l15-9L5 3z" fill="white" />
                </svg>{" "}
                Start
              </button>
            )}
            {running && !paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-heading"
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
                  <rect x="6" y="4" width="4" height="16" fill="white" />
                  <rect x="14" y="4" width="4" height="16" fill="white" />
                </svg>{" "}
                Pause
              </button>
            )}
            {paused && (
              <button
                className="btn-primary start-btn px-6 py-2 flex items-center gap-2 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-heading"
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
                  <path d="M5 3v18l15-9L5 3z" fill="white" />
                </svg>{" "}
                Resume
              </button>
            )}
            <button
              className="btn-outline reset-btn px-6 py-2 flex items-center justify-center hover:bg-primary-light hover:border-primary transition-all duration-200"
              onClick={handleReset}
              aria-label="Reset session"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Right Panel */}
      <aside className="md:col-span-1 self-start">
        {/* Pattern Section - Now at TOP */}
        <div className="card p-4 mb-4">
          {/* Pattern Validation Error Display */}
          {patternValidationError && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {patternValidationError}
            </div>
          )}
          {/* Layer 1: Category Selection */}
          {!selectedCategory && (
            <>
              <div className="font-semibold mb-3">What's your goal?</div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`w-full px-3 py-2 mb-2 rounded font-heading font-semibold text-sm transition-all duration-200 text-left border ${
                    lastCategory === cat.id
                      ? "bg-primary-light text-primary-dark border-primary shadow-sm"
                      : "bg-gray-100 text-gray-700 border-transparent hover:bg-primary-light hover:border-primary"
                  }`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setLastCategory(cat.id);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </>
          )}

          {/* Layer 2: Pattern Selection */}
          {selectedCategory && (
            <>
              <div className="flex items-center mb-3">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mr-2 text-primary hover:text-primary-dark hover:bg-primary-light rounded p-1 transition-all duration-200"
                  aria-label="Back to categories"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="font-heading font-semibold">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </div>
              </div>
              {patternsByCategory[selectedCategory].map((p) => (
                <div
                  key={p.name}
                  className={
                    selectedPattern.name === p.name
                      ? "relative px-3 py-3 mb-2 rounded-lg transition-all duration-300 bg-primary text-white shadow-lg overflow-hidden"
                      : "relative px-3 py-3 mb-2 rounded-lg transition-all duration-300 bg-white border-2 border-gray-200 hover:border-primary hover:shadow-md overflow-hidden"
                  }
                >
                  {/* Clickable Header Area */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => handlePatternSelection(p)}
                  >
                    {/* Level Badge - Top Left Corner (Small) */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        selectedPattern.name === p.name 
                          ? "bg-white bg-opacity-30 text-white"
                          : p.level === "Beginner" ? "bg-green-100 text-green-700" :
                            p.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
                            p.level === "Advanced" ? "bg-purple-100 text-purple-700" :
                            "bg-primary-light text-primary-dark"
                      }`}>
                        {p.level}
                      </span>
                    </div>

                    {/* Pattern Name - Title (Large and Centered) */}
                    <div className="text-center mt-4 mb-2">
                      <div className={`text-xl font-bold ${
                        selectedPattern.name === p.name ? "text-white" : "text-gray-800"
                      }`}>
                        {p.name}
                      </div>
                    </div>

                    {/* Timing - Bottom in Primary or White */}
                    <div className={`text-center text-xs font-semibold mb-1 ${
                      selectedPattern.name === p.name ? "text-white" : "text-primary"
                    }`}>
                      {p.type === "4-phase" 
                        ? `In: ${p.inhale}s - Hold: ${p.holdTop}s - Out: ${p.exhale}s - Hold: ${p.holdBottom}s`
                        : `In: ${p.inhale}s - Hold: ${p.holdTop}s - Out: ${p.exhale}s`
                      }
                    </div>
                  </div>

                  {/* See Benefits Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPattern(expandedPattern === p.name ? null : p.name);
                    }}
                    className={`w-full flex items-center justify-center gap-1 text-xs font-medium py-1.5 transition-all duration-200 ${
                      selectedPattern.name === p.name
                        ? "text-white hover:bg-white hover:bg-opacity-10"
                        : "text-primary hover:bg-primary-light"
                    } rounded`}
                  >
                    <span>See Benefits</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transition-transform duration-300 ${
                        expandedPattern === p.name ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Expandable Description Area */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      expandedPattern === p.name
                        ? "max-h-40 opacity-100 mt-2 pt-3 border-t"
                        : "max-h-0 opacity-0"
                    } ${
                      selectedPattern.name === p.name
                        ? "border-white border-opacity-30"
                        : "border-gray-200"
                    }`}
                  >
                    <div className={`text-sm ${
                      selectedPattern.name === p.name ? "text-white text-opacity-90" : "text-gray-600"
                    }`}>
                      {p.description}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Duration Section - Now at BOTTOM */}
        <div className="card p-4 mb-4">
          <div className="font-semibold mb-3">Duration</div>
          
          {/* 2x2 Grid for preset durations */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {durations.map((d) => (
              <button
                key={d}
                className={
                  duration === d && !showCustomInput
                    ? "px-3 py-2 rounded bg-primary text-white font-heading font-semibold text-sm hover:bg-primary-dark transition-all duration-200 transform hover:scale-105"
                    : "px-3 py-2 rounded bg-gray-100 text-gray-700 font-heading font-semibold text-sm hover:bg-primary-light hover:border-primary transition-all duration-200 border border-transparent"
                }
                onClick={() => {
                  // If session is running or paused, reset it completely
                  if (running || paused) {
                    setRunning(false);
                    setPaused(false);
                    setCycle(0);
                    setSessionId(null);
                    setResetKey(prev => prev + 1); // Force visualizer remount
                  }
                  setDuration(d);
                  setShowCustomInput(false);
                  setRemaining(d * 60); // Always update remaining time
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
                ? "w-full px-3 py-2 rounded bg-primary text-white font-heading font-semibold text-sm hover:bg-primary-dark transition-all duration-200"
                : "w-full px-3 py-2 rounded bg-gray-100 text-gray-700 font-heading font-semibold text-sm hover:bg-primary-light hover:border-primary transition-all duration-200 border border-transparent"
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
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value);
                    setValidationError(""); // Clear error when typing
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCustomDuration();
                    }
                  }}
                  placeholder="Enter minutes"
                  className={`flex-1 min-w-0 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 ${
                    validationError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-primary"
                  }`}
                />
                <button
                  onClick={handleCustomDuration}
                  disabled={!customDuration}
                  className={`px-4 py-2 rounded text-sm font-heading font-semibold transition whitespace-nowrap ${
                    !customDuration
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-primary-dark"
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
                  ? "w-full px-3 py-2 rounded bg-primary text-white font-heading font-semibold text-sm hover:bg-primary-dark transition-all duration-200 mt-2"
                  : "w-full px-3 py-2 rounded bg-gray-100 text-gray-700 font-heading font-semibold text-sm hover:bg-primary-light hover:border-primary transition-all duration-200 border border-transparent mt-2"
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

      </aside>
    </div>
  );
}
