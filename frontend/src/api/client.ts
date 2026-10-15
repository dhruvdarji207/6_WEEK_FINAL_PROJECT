const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('waste2worth_token');
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem('waste2worth_token', token);
  } else {
    localStorage.removeItem('waste2worth_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // response wasn't json
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  auth: {
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    me: () => request<any>('/auth/me'),
  },
  listings: {
    list: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      return request<any>(`/listings?${searchParams.toString()}`);
    },
    get: (id: number) => request<any>(`/listings/${id}`),
    create: (body: any) => request<any>('/listings', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) => request<any>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/listings/${id}`, { method: 'DELETE' }),
  },
  requirements: {
    list: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      return request<any>(`/requirements?${searchParams.toString()}`);
    },
    get: (id: number) => request<any>(`/requirements/${id}`),
    create: (body: any) => request<any>('/requirements', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: any) => request<any>(`/requirements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: number) => request<any>(`/requirements/${id}`, { method: 'DELETE' }),
  },
  matching: {
    recommend: (body: any) => request<any>('/matching/recommend', { method: 'POST', body: JSON.stringify(body) }),
    getBenchmark: () => request<any>('/matching/benchmark'),
  },
  exchanges: {
    list: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      return request<any>(`/exchanges?${searchParams.toString()}`);
    },
    get: (id: number) => request<any>(`/exchanges/${id}`),
    create: (body: any) => request<any>('/exchanges', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id: number, body: any) => request<any>(`/exchanges/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  },
  ml: {
    predictPrice: (body: any) => request<any>('/ml/predict-price', { method: 'POST', body: JSON.stringify(body) }),
    predictQuantity: (body: any) => request<any>('/ml/predict-quantity', { method: 'POST', body: JSON.stringify(body) }),
    getDemandTrends: () => request<any>('/ml/demand-trends'),
    estimateImpact: (body: any) => request<any>('/ml/impact-estimate', { method: 'POST', body: JSON.stringify(body) }),
  },
  impact: {
    getSummary: () => request<any>('/impact/summary'),
  },
  admin: {
    getStats: () => request<any>('/admin/stats'),
    getPendingListings: () => request<any>('/admin/moderation/listings'),
    moderateListing: (id: number, body: any) => request<any>(`/admin/moderation/listings/${id}`, { method: 'POST', body: JSON.stringify(body) }),
    getAuditLogs: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      }
      return request<any>(`/admin/audit-logs?${searchParams.toString()}`);
    },
    getUsers: () => request<any>('/admin/users'),
    reseedDemoData: () => request<any>('/admin/reseed-demo-data', { method: 'POST' }),
  },
};
