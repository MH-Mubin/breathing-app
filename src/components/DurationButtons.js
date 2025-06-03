import React from 'react'; // Import React for component creation

const DurationButtons = ({ setDuration, currentDuration }) => { // Define DurationButtons component with props for setting duration and current duration
  const durations = [2, 5, 10]; // Array of available session durations in minutes

  return ( // JSX for button layout
    <div className="flex flex-col space-y-2"> // Container with vertical spacing using Tailwind
      <h2 className="text-lg font-semibold text-gray-800">Session Duration</h2> // Section title
      {durations.map((minutes) => ( // Map over durations to create buttons
        <button 
          key={minutes} // Unique key for each button
          onClick={() => setDuration(minutes)} // Call setDuration with selected minutes
          className={`px-4 py-2 rounded-lg text-white font-semibold ${currentDuration === minutes ? 'bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}`} // Tailwind styles with active state
        >
          {minutes} Minutes // Button text
        </button>
      ))}
    </div>
  );
};

export default DurationButtons; // Export the component