import { API_BASE_URL } from './api-base'
import { getAuthSession, refreshStoredSession } from '#/features/auth'

// Note: transport errors are thrown as plain objects with a stable shape
// (duck-typed `ApiClientError`) so higher layers can map them without
// creating circular imports.

export const apiClient = {
  /**
   * Sends a JSON GET request and parses the response.
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  },

  /**
   * Sends a JSON POST request and parses the response.
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * Sends a JSON PUT request and parses the response.
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  /**
   * Sends a DELETE request and parses the response.
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  },

  /**
   * Sends a multipart/form-data POST request.
   */
  async postFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      omitJsonContentType: true,
    })
  },

  /**
   * Sends a multipart/form-data PUT request.
   */
  async putFormData<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: formData,
      omitJsonContentType: true,
    })
  },
}

interface RequestOptions extends RequestInit {
  omitJsonContentType?: boolean
}

async function request<T>(endpoint: string, options: RequestOptions = {}, retryCount = 0): Promise<T> {
  const session = getAuthSession()
  const headers = new Headers(options.headers)

  if (!options.omitJsonContentType) {
    headers.set('Content-Type', 'application/json')
  }

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401 && retryCount === 0 && !endpoint.startsWith('/auth/')) {
    const refreshedSession = await refreshStoredSession()
    if (refreshedSession) {
      return request<T>(endpoint, options, 1)
    }
  }

  return handleResponse<T>(response)
}

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
