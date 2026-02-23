// ─── Centralized API Configuration ───────────────────────────────────────────
// All client fetch calls go through this base URL.
// In development, Vite proxies /auth and /resume to the same origin,
// so API_BASE stays empty. In production, point to your deployed backend.

export const API_BASE = "https://ai-resume-analyzer-backend-2x79.onrender.com";

/**
 * Wrapper around native fetch that automatically prepends API_BASE.
 * Usage: apiFetch("/auth/login", { method: "POST", ... })
 */
export const apiFetch = (path, options = {}) =>
    fetch(`${API_BASE}${path}`, options);
