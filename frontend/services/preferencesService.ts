const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function updateThemePreference(theme: "light" | "dark"): Promise<void> {
  // Use the same key as authService
  const token = localStorage.getItem("kelana_token");
  if (!token) {
    // Silently fail if not authenticated - user can still use local theme preference
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/preferences`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ theme_preference: theme }),
    });

    if (!response.ok) {
      // Silently handle errors (401 invalid token, network errors, etc)
      // Theme is still saved locally, so user experience isn't affected
      return;
    }
  } catch (error) {
    // Silently handle network errors
    return;
  }
}
