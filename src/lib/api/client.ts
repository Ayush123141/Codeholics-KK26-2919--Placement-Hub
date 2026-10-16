import { isSupabaseConfigured } from '@/lib/supabase/client';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  isFallback?: boolean;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = API_BASE_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')
    ? `${API_BASE_URL}${cleanEndpoint.slice(4)}`
    : `${API_BASE_URL}${cleanEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson?.message) errorMessage = errJson.message;
        if (errJson?.error) errorMessage = errJson.error;
      } catch {
        // Fall back to status text
      }
      throw new ApiError(errorMessage, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    // If backend is unreachable, throw ApiError so callers can gracefully utilize local state / fallback
    if (error instanceof ApiError) throw error;
    throw new ApiError((error as Error).message || 'Network error occurred', 0);
  }
}

export { API_BASE_URL, isSupabaseConfigured };
