const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...fetchOptions, headers });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(endpoint: string, token?: string) => fetchAPI<T>(endpoint, { method: "GET", token }),
  post: <T>(endpoint: string, body: unknown, token?: string) => fetchAPI<T>(endpoint, { method: "POST", body: JSON.stringify(body), token }),
  put: <T>(endpoint: string, body: unknown, token?: string) => fetchAPI<T>(endpoint, { method: "PUT", body: JSON.stringify(body), token }),
  patch: <T>(endpoint: string, body: unknown, token?: string) => fetchAPI<T>(endpoint, { method: "PATCH", body: JSON.stringify(body), token }),
  delete: <T>(endpoint: string, token?: string) => fetchAPI<T>(endpoint, { method: "DELETE", token }),
};

export default api;
