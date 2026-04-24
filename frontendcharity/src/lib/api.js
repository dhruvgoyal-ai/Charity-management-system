const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://charity-management-system-2.onrender.com/api/v1";;

const STORAGE_KEY = "charityhub-auth";

/** Get token from localStorage */
function getStoredToken() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored).token : null;
  } catch {
    return null;
  }
}

/** Parse response + normalize output */
async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.message || payload.error?.message || "Request failed"
        : `Request failed with status ${response.status}`;

    const err = new Error(message);
    err.status = response.status;
    throw err;
  }

  // 🔥 IMPORTANT FIX: return ONLY data
  if (typeof payload === "object" && payload !== null) {
    return payload.data || payload;
  }

  return payload;
}

/**
 * apiFetch
 * - Adds token automatically
 * - Handles JSON
 * - Returns clean data
 */
export async function apiFetch(path, options = {}) {
  const token = getStoredToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export { API_BASE_URL };
