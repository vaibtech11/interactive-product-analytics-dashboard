const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const login = (username, password) => {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
};

export const register = (username, password, age, gender) => {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, age, gender })
  });
};

export const trackFeature = (feature_name) => {
  return request('/track', {
    method: 'POST',
    body: JSON.stringify({ feature_name })
  });
};

export const getAnalytics = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/analytics?${params}`);
};

export const getFeatureSummary = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/analytics/feature-summary?${params}`);
};

export const getFeatureTimeline = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return request(`/analytics/feature-timeline?${params}`);
};
