import React, { useState, useEffect } from 'react'; // Import React and hooks for state and lifecycle management
import { Howl } from 'howler'; // Import Howler for sound effects
import BreathingCircle from './components/breathingCircle'; // Import BreathingCircle component for animation
import ControlButtons from './components/ControlButtons'; // Import ControlButtons for start/pause/reset
import DurationButtons from './components/DurationButtons'; // Import DurationButtons for session duration selection
import SidePanel from './components/SidePanel'; // Import SidePanel for streak and stats
import ProgressTracker from './components/ProgressTracker'; // Import ProgressTracker for session progress visualization
import './app.css'; // Import CSS for custom styles (used alongside Tailwind)

const App = () => { // Define the main App component
  const [phase, setPhase] = useState('idle'); // State for current breathing phase (idle, inhale, hold, exhale)
  const [countdown, setCountdown] = useState(0); // State for countdown timer in each phase
  const [sessionDuration, setSessionDuration] = useState(2 * 60); // State for session duration in seconds (default: 2 minutes)
  const [timeLeft, setTimeLeft] = useState(sessionDuration); // State for remaining session time
  const [isRunning, setIsRunning] = useState(false); // State to track if session is running
  const [sessionComplete, setSessionComplete] = useState(false); // State for session completion status
  const [streak, setStreak] = useState(0); // State for daily streak count
  const [history, setHistory] = useState([]); // State for session history (date and duration)

  const sounds = { // Object to store Howler sound instances
    inhale: new Howl({ src: ['/sounds/inhale.mp3'] }), // Sound anny for breath in phase
    hold: new Howl({ src: ['/sounds/hold.mp3'] }), // Sound for hold phase
    exhale: new Howl({ src: ['/sounds/exhale.mp3'] }), // Sound for breath out phase
  };

  useEffect(() => { // Effect to load streak and history from LocalStorage on mount
    const savedStreak = localStorage.getItem('streak') || 0; // Get streak from LocalStorage
    const savedHistory = JSON.parse(localStorage.getItem('history') || '[]'); // Get history from LocalStorage
    setStreak(parseInt(savedStreak)); // Set streak state
    setHistory(savedHistory); // Set history state
  }, []); // Empty dependency array to run once on mount

  useEffect(() => { // Effect to handle breathing animation and session timing
    let timer;
    if (isRunning && timeLeft > 0) { // If session is running and time remains
      if (phase === 'idle') { // Start with inhale phase if idle
        setPhase('inhale');
        setCountdown(5);
        sounds.inhale.play(); // Play inhale sound
      }
      timer = setInterval(() => { // Set interval for countdown and phase changes
        setCountdown((prev) => { // Update countdown
          if (prev === 1) { // When countdown reaches 1, switch phases
            if (phase === 'inhale') { // Transition to hold
              setPhase('hold');
              setCountdown(2);
              sounds.hold.play();
            } else if (phase === 'hold') { // Transition to exhale
              setPhase('exhale');
              setCountdown(7);
              sounds.exhale.play();
            } else if (phase === 'exhale') { // Transition to inhale
              setPhase('inhale');
              setCountdown(5);
              sounds.inhale.play();
            }
            return prev;
          }
          return prev - 1; // Decrease countdown
        });
        setTimeLeft((prev) => prev - 1); // Decrease session time
        if (timeLeft <= 1) { // If session time is up
          setPhase('idle'); // Reset phase
          setIsRunning(false); // Stop session
          setSessionComplete(true); // Show completion message
          updateStreakAndHistory(); // Update streak and history
        }
      }, 1000); // Run every second
    }
    return () => clearInterval(timer); // Cleanup interval on unmount or phase change
  }, [isRunning, phase, timeLeft]); // Dependencies for effect

  const updateStreakAndHistory = () => { // Function to update streak and history
    const today = new Date().toDateString(); // Get current date
    const lastSession = localStorage.getItem('lastSession'); // Get last session date
    let newStreak = streak; // Initialize new streak
    if (lastSession !== today) { // If session is on a new day
      newStreak = lastSession && new Date(lastSession).toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()
        ? streak + 1 // Increment streak if last session was yesterday
        : 1; // Reset streak to 1 if not consecutive
      localStorage.setItem('streak', newStreak); // Save new streak
      setStreak(newStreak); // Update streak state
      const newHistory = [...history, { date: today, duration: sessionDuration / 60 }]; // Add session to history
      setHistory(newHistory); // Update history state
      localStorage.setItem('history', JSON.stringify(newHistory)); // Save history
      localStorage.setItem('lastSession', today); // Update last session date
    }
  };

  const startSession = () => { // Function to start session
    setIsRunning(true); // Set running state to true
    setSessionComplete(false); // Reset completion status
    setTimeLeft(sessionDuration); // Set session time
    setPhase('inhale'); // Start with inhale phase
    setCountdown(5); // Set initial countdown
  };

  const pauseSession = () => { // Function to pause session
    setIsRunning(false); // Stop session
    sounds[phase].pause(); // Pause current sound
  };

  const resetSession = () => { // Function to reset session
    setIsRunning(false); // Stop session
    setPhase('idle'); // Reset phase
    setCountdown(0); // Reset countdown
    setTimeLeft(sessionDuration); // Reset session time
    setSessionComplete(false); // Reset completion status
    sounds[phase].stop(); // Stop any playing sound
  };

  const setDuration = (minutes) => { // Function to set session duration
    const seconds = minutes * 60; // Convert minutes to seconds
    setSessionDuration(seconds); // Update session duration
    setTimeLeft(seconds); // Update remaining time
    resetSession(); // Reset session
  };

  return ( // JSX for the app layout
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-100 to-purple-100 animate-gradient"> {/* Main container with gradient background */}
      <div className="flex-1 flex flex-col items-center space-y-6"> {/* Center column for circle and buttons */}
        <h1 className="text-3xl font-bold text-gray-800">Breathing App</h1> {/* App title */}
        <BreathingCircle phase={phase} countdown={countdown} /> {/* Breathing circle component */}
        <ControlButtons 
          isRunning={isRunning} 
          startSession={startSession} 
          pauseSession={pauseSession} 
          resetSession={resetSession} 
        /> {/* Control buttons component */}
        {sessionComplete && ( // Conditional session complete message */}
          <div className="text-xl text-green-600 font-semibold animate-pulse"> {/* Animated completion message */}
            Session Complete! Great Job!
          </div>
        )}
      </div>
      <div className="w-full md:w-64 p-4"> {/* Left sidebar for duration buttons */}
        <DurationButtons setDuration={setDuration} currentDuration={sessionDuration / 60} /> {/* Duration buttons component */}
      </div>
      <div className="w-full md:w-64 p-4"> {/* Right sidebar for side panel and progress */}
        <SidePanel streak={streak} history={history} /> {/* Side panel with streak and benefits text */}
        <ProgressTracker timeLeft={timeLeft} sessionDuration={sessionDuration} history={history} /> {/* Progress tracker component */}
      </div>
    </div>
  );
};

export default App; // Export the App component