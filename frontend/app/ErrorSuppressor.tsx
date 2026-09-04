"use client";

import { useEffect } from "react";

export default function ErrorSuppressor() {
  useEffect(() => {
    // Suppress Web Vitals errors in console
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      const errorString = String(args[0]);
      
      // Suppress Web Vitals errors
      if (
        errorString.includes("startTime") ||
        errorString.includes("reportAllChanges") ||
        errorString.includes("Cannot read properties of undefined")
      ) {
        return;
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
