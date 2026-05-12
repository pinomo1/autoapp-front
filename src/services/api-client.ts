// API client utility - handles base configuration for all API calls
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5071/api';

// Note: transport errors are thrown as plain objects with a stable shape
// (duck-typed `ApiClientError`) so higher layers can map them without
// creating circular imports.

export const apiClient = {
  /**
   * Sends a JSON GET request and parses the response.
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  /**
   * Sends a JSON POST request and parses the response.
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * Sends a JSON PUT request and parses the response.
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  /**
   * Sends a DELETE request and parses the response.
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    return handleResponse<T>(response);
  },

  /**
   * Sends a multipart/form-data POST request.
   */
  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: {
        ...options?.headers,
      },
      body: formData,
    });
    return handleResponse<T>(response);
  },

  /**
   * Sends a multipart/form-data PUT request.
   */
  async putFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: 'PUT',
      headers: {
        ...options?.headers,
      },
      body: formData,
    });
    return handleResponse<T>(response);
  },
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      payload = undefined;
    }

    const message =
      typeof payload === 'object' && payload !== null && 'title' in payload
        ? String(payload.title)
        : `API error: ${response.statusText}`;

    // Normalize transport error shape to a plain object so upper layers can
    // rely on a stable, serializable payload without needing to import
    // runtime classes from this module.
    throw {
      name: 'ApiClientError',
      message,
      status: response.status,
      payload,
    } as const;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
