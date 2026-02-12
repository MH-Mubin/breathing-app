/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary colors (teal-based)
        primary: {
          DEFAULT: '#0D7C7B', // Darkened for WCAG AA compliance (4.5:1 contrast on white)
          dark: '#0F766E',
          light: '#CCFBF1',
        },
        // Secondary colors (soft backgrounds)
        secondary: {
          DEFAULT: '#F1F5F9',
        },
        // Accent colors (interactive elements)
        accent: {
          DEFAULT: '#22D3EE',
        },
        // Neutral scale
        background: '#FFFFFF',
        surface: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          light: '#FFFFFF', // For light text on dark backgrounds
        },
        muted: '#94A3B8',
        error: '#ef4444', // Standard error color
        // Legacy colors (for backward compatibility during migration)
        'bg-dark': '#1f2428',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
