import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import api from "../utils/api";

export default function PreferencesCard({ user, onUpdate }) {
  const { themePreference, setThemePreference } = useTheme();

  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    dailyReminders: user?.preferences?.dailyReminders ?? true,
    emailUpdates: user?.preferences?.emailUpdates ?? false,
  });
  
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  // Handle toggle change with optimistic UI update
  const handleToggle = async (preferenceName) => {
    // Store previous state for potential revert
    const previousValue = preferences[preferenceName];
    const newValue = !previousValue;

    // Optimistic UI update - immediately reflect the change
    setPreferences(prev => ({
      ...prev,
      [preferenceName]: newValue,
    }));

    // Clear any previous errors
    setError(null);

    // Set loading state for this specific toggle
    setLoading(prev => ({ ...prev, [preferenceName]: true }));

    try {
      // Make API call to persist the change
      const response = await api.put("/user/preferences", {
        ...preferences,
        [preferenceName]: newValue,
      });

      // Call parent callback with updated data
      if (onUpdate) {
        onUpdate(response.data.data);
      }
      
      // Show success toast
      toast.success("Preference updated successfully");
    } catch (err) {
      console.error("Error updating preferences:", err);

      // Revert the toggle state on error
      setPreferences(prev => ({
        ...prev,
        [preferenceName]: previousValue,
      }));

      // Check if it's a network error
      if (!err.response) {
        const errorMsg = "Network error. Please check your connection and try again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => setError(null), 5000);
        return;
      }

      // If it's a 401 error, the global interceptor will handle it
      if (err.response?.status === 401) {
        const errorMsg = "Authentication error. Please log in again.";
        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Check for server errors (5xx)
      if (err.response?.status >= 500) {
        const errorMsg = "Server error. Please try again later.";
        setError(errorMsg);
        toast.error(errorMsg);
        setTimeout(() => setError(null), 5000);
        return;
      }

      // Show error message
      const errorMsg = err.response?.data?.message || "Failed to update preference. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);

      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      // Clear loading state for this toggle
      setLoading(prev => ({ ...prev, [preferenceName]: false }));
    }
  };

  // Theme labels for the dropdown
  const themeOptions = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  if (!user) {
    return (
      <div className="card p-6">
        <h4 className="font-semibold mb-2">Preferences</h4>
        <p className="text-sm text-gray-500">No user data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center gap-2 mb-6">
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h3>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {/* Appearance (Theme) - Dropdown at top */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Appearance</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Choose your preferred theme
              </div>
            </div>
          </div>
          <select
            value={themePreference}
            onChange={(e) => {
              setThemePreference(e.target.value);
              toast.success(`Theme set to ${themeOptions.find(o => o.value === e.target.value)?.label}`);
            }}
            className="bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 text-gray-800 dark:text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer transition-colors"
          >
            {themeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications toggle */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Notifications</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Manage your notification settings
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={preferences.notifications}
            onChange={() => handleToggle("notifications")}
            disabled={loading.notifications}
          />
        </div>

        {/* Daily Reminders toggle */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Daily Reminders</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Set reminders for practice sessions
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={preferences.dailyReminders}
            onChange={() => handleToggle("dailyReminders")}
            disabled={loading.dailyReminders}
          />
        </div>

        {/* Email Updates toggle */}
        <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Email Updates</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Receive weekly progress reports
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={preferences.emailUpdates}
            onChange={() => handleToggle("emailUpdates")}
            disabled={loading.emailUpdates}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Animated toggle switch component
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked ? "bg-primary" : "bg-gray-300 dark:bg-slate-500"}
      `}
    >
      <motion.span
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
      />
    </motion.button>
  );
}
