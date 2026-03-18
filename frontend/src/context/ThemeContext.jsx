import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(() => {
    try {
      return localStorage.getItem("respira_theme") || "system";
    } catch {
      return "system";
    }
  });

  // Compute actual resolved theme (light or dark)
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;

      if (themePreference === "dark") {
        isDark = true;
      } else if (themePreference === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      // "light" → isDark stays false

      const root = document.documentElement;
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      setResolvedTheme(isDark ? "dark" : "light");
    };

    applyTheme();

    // Persist preference
    try {
      localStorage.setItem("respira_theme", themePreference);
    } catch {
      // ignore
    }

    // Listen to system theme changes when set to "system"
    if (themePreference === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [themePreference]);

  const isDark = resolvedTheme === "dark";

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, isDark, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
