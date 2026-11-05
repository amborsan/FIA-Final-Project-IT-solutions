// Central API client. It adds cookies and the CSRF header to every request.
const API_BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  const fromCookie = readCookie("orbit_csrf");
  if (fromCookie) {
    csrfToken = fromCookie;
    return fromCookie;
  }
  if (csrfToken) return csrfToken;

  const response = await fetch(`${API_BASE}/auth/csrf`, {
    credentials: "include",
  });
  if (!response.ok) throw new ApiError(response.status, "Could not start a secure session.");
  const data = (await response.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
  return data.csrfToken;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { ...options.headers };
  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers["X-CSRF-Token"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    let details: unknown;
    try {
      const data = await response.json();
      message = data.error || message;
      details = data.details;
    } catch {
      // The server did not return JSON (e.g. a network proxy error).
    }
    throw new ApiError(response.status, message, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Download a protected file (privacy export or report attachment). */
export async function downloadFile(path: string, fallbackName: string) {
  const response = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!response.ok) {
    let message = "Download failed.";
    try {
      message = (await response.json()).error || message;
    } catch {
      // ignore
    }
    throw new ApiError(response.status, message);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/);
  const name = match?.[1] || fallbackName;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
