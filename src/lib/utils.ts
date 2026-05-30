import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://e-comstore-3.onrender.com";
if (!BASE_URL || BASE_URL.includes("localhost")) {
  console.warn("⚠️ [Frontend Warning] API BASE_URL is set to localhost in production. Overriding with hardcoded backend.");
}

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`
});
