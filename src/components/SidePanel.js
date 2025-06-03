import React from 'react'; // Import React for component creation

const SidePanel = ({ streak, history }) => { // Define SidePanel component with props for streak and history
  return ( // JSX for side panel layout
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-md"> // Container with Tailwind styling for a clean, card-like appearance
      <h2 className="text-lg font-semibold text-gray-800">Your Progress</h2> // Section title
      <div className="text-gray-700"> // Streak display
        <span className="font-bold">Daily Streak: </span>{streak} {streak === 1 ? 'day' : 'days'} // Show streak count with singular/plural
      </div>
      <div className="text-gray-700"> // Breathing benefits text
        <h3 className="font-semibold">Why Rhythmic Breathing?</h3> // Subsection title
        <p className="text-sm"> // Informative text
          Rhythmic breathing calms the mind, reduces stress, and enhances focus. It promotes relaxation and improves brain function by increasing oxygen flow.
        </p>
      </div>
      <div className="text-gray-700"> // Session history
        <h3 className="font-semibold">Session History</h3> // Subsection title
        <ul className="text-sm max-h-40 overflow-y-auto"> // Scrollable list for history
          {history.length === 0 ? ( // Check if history is empty
            <li>No sessions yet</li> // Placeholder for empty history
          ) : (
            history.map((session, index) => ( // Map over history to display sessions
              <li key={index}> // Unique key for each session
                {session.date}: {session.duration} min // Display date and duration
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default SidePanel; // Export the component