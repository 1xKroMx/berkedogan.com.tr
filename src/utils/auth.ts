// Auth utility functions
export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch("https://www.berkedogan.com.tr/api/refresh", {
      method: "POST",
      credentials: "include",
    });
    return res.ok;
  } catch {
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
