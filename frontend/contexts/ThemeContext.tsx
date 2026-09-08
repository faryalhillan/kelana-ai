"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuthToken } from "@/services/authService";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Load theme from localStorage and backend on mount
  useEffect(() => {
    const initializeTheme = async () => {
      // First, try to load from localStorage
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored && ["light", "dark"].includes(stored)) {
        setThemeState(stored);
      }

      // Then, if authenticated, sync with backend preference
      const token = getAuthToken();
      if (token) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.theme_preference && ["light", "dark"].includes(data.theme_preference)) {
              const userTheme = data.theme_preference as Theme;
              setThemeState(userTheme);
              localStorage.setItem("theme", userTheme);
            }
          }
        } catch (error) {
          console.error("Failed to load theme preference from backend:", error);
        }
      }

      setIsInitialized(true);
    };

    initializeTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
