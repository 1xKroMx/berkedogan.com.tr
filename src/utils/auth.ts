// Auth utility functions
export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch("https://www.berkedogan.com.tr/api/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    if (res.ok) {
      console.log("✓ Token refreshed successfully");
      return true;
    } else {
      const data = await res.json().catch(() => ({}));
      console.log("✗ Token refresh failed:", data.error || res.status);
      return false;
    }
  } catch (err) {
    console.error("✗ Token refresh error:", err);
    return false;
  }
}

export async function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
  // First attempt with existing credentials
  let res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  // If unauthorized, try to refresh
  if (res.status === 401) {
    const refreshed = await checkAuth();
    if (refreshed) {
      // Retry the original request
      res = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return res;
}
