"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { updateThemePreference } from "@/services/preferencesService";
import { getAuthToken } from "@/services/authService";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);

    // Save to backend if authenticated
    if (isAuthenticated) {
      try {
        updateThemePreference(newTheme);
      } catch (error) {
        console.debug("Theme saved locally");
      }
    }
  };

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  );
}
