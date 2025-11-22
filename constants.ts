// Use environment variable for backend URL to support different environments
// Fallback to localhost for development
export const BASE_BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
