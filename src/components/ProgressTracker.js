
const ProgressTracker = ({ timeLeft, sessionDuration, history }) => { // Define ProgressTracker component with props for time, duration, and history
  const progress = ((sessionDuration - timeLeft) / sessionDuration) * 100; // Calculate progress percentage

  return ( // JSX for progress tracker layout
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md mt-4"> // Container with Tailwind styling
      <h2 className="text-lg font-semibold text-gray-800">Session Progress</h2> // Section title
      <div className="w-full bg-gray-200 rounded-full h-4"> // Progress bar container
        <div 
          className="bg-blue-500 h-4 rounded-full" // Progress bar fill
          style={{ width: `${progress}%` }} // Dynamically set width based on progress
        ></div>
      </div>
      <p className="text-sm text-gray-700"> // Progress text
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} remaining // Display time left in MM:SS format
      </p>
      <h2 className="text-lg font-semibold text-gray-800">Daily Improvement</h2> // Visualization title
      <div className="flex items-end space-x-2 h-20"> // Container for bar visualization
        {history.slice(-5).map((session, index) => ( // Show last 5 sessions
          <div 
            key={index} // Unique key for each bar
            className="bg-blue-500 w-8 rounded-t" // Bar styling
            style={{ height: `${session.duration * 10}px` }} // Scale height by duration (10px per minute)
            title={`${session.date}: ${session.duration} min`} // Tooltip with date and duration
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker; // Export the component