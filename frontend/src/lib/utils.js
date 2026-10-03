import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Backend base URL. 23 call sites interpolate `${API_BASE}/user-api/...`, so it
// must stay a single origin. `.env.local` overrides the committed deployed URL.
export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
