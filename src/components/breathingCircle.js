import { useEffect, useRef } from 'react'; // Import React and hooks for refs and lifecycle management

const BreathingCircle = ({ phase, countdown }) => { // Define BreathingCircle component with phase and countdown props
  const canvasRef = useRef(null); // Create ref for canvas element

  useEffect(() => { // Effect to handle canvas animation
    const canvas = canvasRef.current; // Get canvas element
    const ctx = canvas.getContext('2d'); // Get 2D rendering context
    const centerX = canvas.width / 2; // Center X coordinate
    const centerY = canvas.height / 2; // Center Y coordinate
    const maxRadius = 100; // Maximum radius for the breathing circle
    const borderRadius = 110; // Fixed outer border radius (slightly larger)

    const draw = () => { // Function to draw circle and text
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas for redraw

      // Draw fixed outer border
      ctx.beginPath(); // Start new path
      ctx.arc(centerX, centerY, borderRadius, 0, 2 * Math.PI); // Draw outer circle
      ctx.strokeStyle = '#4b5563'; // Gray color for border
      ctx.lineWidth = 2; // Border thickness
      ctx.stroke(); // Render border

      // Calculate dynamic radius based on phase and countdown
      let radius;
      if (phase === 'inhale') { // Inhale: expand over 5 seconds
        radius = maxRadius * (1 - countdown / 5); // Scale radius based on countdown
      } else if (phase === 'hold') { // Hold: stay at max radius
        radius = maxRadius;
      } else if (phase === 'exhale') { // Exhale: shrink over 7 seconds
        radius = maxRadius * (countdown / 7); // Scale radius based on countdown
      } else { // Idle: small circle
        radius = maxRadius * 0.2;
      }

      // Draw breathing circle
      ctx.beginPath(); // Start new path
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Draw dynamic circle
      ctx.fillStyle = '#60a5fa'; // Blue fill for calming effect
      ctx.fill(); // Fill circle

      // Draw countdown text
      ctx.font = '24px Arial'; // Set font for countdown
      ctx.fillStyle = '#1f2937'; // Dark text color
      ctx.textAlign = 'center'; // Center text
      ctx.textBaseline = 'middle'; // Vertically center text
      ctx.fillText(phase === 'idle' ? 'Start' : `${phase}: ${countdown}`, centerX, centerY); // Display phase and countdown
    };

    draw(); // Initial draw
    const animationFrame = requestAnimationFrame(() => draw()); // Request animation frame for smooth updates

    return () => cancelAnimationFrame(animationFrame); // Cleanup animation on unmount
  }, [phase, countdown]); // Re-run effect when phase or countdown changes

  return ( // JSX for canvas element
    <canvas 
      ref={canvasRef} 
      width={300} 
      height={300} 
      className="border rounded-full shadow-lg" // Tailwind classes for styling
    />
  );
};

export default BreathingCircle; // Export the component