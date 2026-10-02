/**
 * PhishShield API Client Service
 * AI-Based Phishing Website Detection System
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('phishshield_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // Scans
  scanUrl: async (url) => {
    const res = await fetch(`${API_BASE}/api/scans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ url }),
    });
    return handleResponse(res);
  },

  scanBatch: async (urls) => {
    const res = await fetch(`${API_BASE}/api/scans/batch`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ urls }),
    });
    return handleResponse(res);
  },

  getScanHistory: async (page = 1, pageSize = 10, prediction = '') => {
    let url = `${API_BASE}/api/scans/history?page=${page}&page_size=${pageSize}`;
    if (prediction) {
      url += `&prediction=${encodeURIComponent(prediction)}`;
    }
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getScanDetail: async (scanId) => {
    const res = await fetch(`${API_BASE}/api/scans/${scanId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Dashboard Analytics
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Auth
  register: async (name, email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse(res);
  },

  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Admin
  getAdminUsers: async () => {
    const res = await fetch(`${API_BASE}/api/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getAdminModelStatus: async () => {
    const res = await fetch(`${API_BASE}/api/admin/model-status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/api/health`);
    return handleResponse(res);
  },
};
