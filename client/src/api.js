// ─── Centralized API Configuration ───────────────────────────────────────────
// All client fetch calls go through this base URL.
// In development, Vite proxies /auth and /resume to the same origin,
// so API_BASE stays empty. In production, point to your deployed backend.

export const API_BASE = import.meta.env.VITE_API_BASE || "https://ai-resume-analyzer-backend-hs0f.onrender.com";

/**
 * Wrapper around native fetch that automatically prepends API_BASE.
 * Usage: apiFetch("/auth/login", { method: "POST", ... })
 */
export const apiFetch = (path, options = {}) => {
    const cleanBase = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${cleanBase}${cleanPath}`, options);
};
