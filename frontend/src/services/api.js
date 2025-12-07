// Determine API URL based on environment
const getApiUrl = () => {
  // If VITE_API_URL is set in .env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Otherwise, use relative path for production or localhost for dev
  if (import.meta.env.PROD) {
    return '/api'; // Production: same domain
  }
  
  return 'http://localhost:5000/api'; // Development fallback
};

const API_URL = getApiUrl();
const BASE_URL = API_URL.replace("/api", "");

// Export untuk digunakan di file lain
export { API_URL, BASE_URL };

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// Helper function for fetch requests
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Something went wrong");
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: (data) =>
    fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data) =>
    fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  forgotPassword: (data) =>
    fetchAPI("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  resetPassword: (data) =>
    fetchAPI("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Kelas API
export const kelasAPI = {
  getAll: () => fetchAPI("/kelas"),
  getById: (id) => fetchAPI(`/kelas/${id}`),
  create: (data) =>
    fetchAPI("/kelas", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    fetchAPI(`/kelas/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/kelas/${id}`, { method: "DELETE" }),
};

// Siswa API
export const siswaAPI = {
  getAll: (kelasId, sort) => {
    const params = new URLSearchParams();
    if (kelasId) params.append("kelasId", kelasId);
    if (sort) params.append("sort", sort);
    return fetchAPI(`/siswa?${params.toString()}`);
  },
  getById: (id) => fetchAPI(`/siswa/${id}`),
  create: (data) =>
    fetchAPI("/siswa", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    fetchAPI(`/siswa/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/siswa/${id}`, { method: "DELETE" }),
};

// Nilai API
export const nilaiAPI = {
  getAll: (siswaId) => {
    const params = siswaId ? `?siswaId=${siswaId}` : "";
    return fetchAPI(`/nilai${params}`);
  },
  getById: (id) => fetchAPI(`/nilai/${id}`),
  getSummary: (siswaId) => fetchAPI(`/nilai/summary/${siswaId}`),
  create: (data) =>
    fetchAPI("/nilai", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    fetchAPI(`/nilai/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/nilai/${id}`, { method: "DELETE" }),
};
