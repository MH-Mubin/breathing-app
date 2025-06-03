
const ControlButtons = ({ isRunning, startSession, pauseSession, resetSession }) => { // Define ControlButtons component with props for state and functions
  return ( // JSX for button layout
    <div className="flex space-x-4 mt-4"> // Container with horizontal spacing using Tailwind
      <button 
        onClick={startSession} // Trigger startSession function on click
        disabled={isRunning} // Disable button when session is running
        className={`px-4 py-2 rounded-lg text-white font-semibold ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`} // Tailwind styles with conditional disabled state
      >
        Start // Button text
      </button>
      <button 
        onClick={pauseSession} // Trigger pauseSession function on click
        disabled={!isRunning} // Disable button when session is not running
        className={`px-4 py-2 rounded-lg text-white font-semibold ${!isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`} // Tailwind styles with conditional disabled state
      >
        Pause // Button text
      </button>
      <button 
        onClick={resetSession} // Trigger resetSession function on click
        className="px-4 py-2 rounded-lg text-white font-semibold bg-red-500 hover:bg-red-600" // Tailwind styles for reset button
      >
        Reset // Button text
      </button>
    </div>
  );
};

export default ControlButtons; // Export the component