import axios from "axios";

const API_URL = "/api";
const REQUEST_TIMEOUT_MS = 15_000;
const REFRESH_TIMEOUT_MS = 8_000;

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
});

let isRefreshing = false;
let failedQueue = [];
let refreshTimer = null;

const processQueue = (error, token = null) => {
  for (const prom of failedQueue) {
    if (error) prom.reject(error);
    else prom.resolve(token);
  }
  failedQueue = [];
};

function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
  // notify same-tab listeners (storage event only fires across tabs)
  window.dispatchEvent(new CustomEvent("jmshoes:auth"));
}

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry && !originalRequest._isRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        refreshTimer = setTimeout(() => {
          // Defensive: si el refresh no responde en 8s, forzar logout
          processQueue(new Error("Refresh timeout"), null);
          setAccessToken(null);
          window.location.href = "/admin/login";
        }, REFRESH_TIMEOUT_MS);

        const response = await axios.post(
          `${API_URL}/refresh`,
          {},
          { withCredentials: true, timeout: REFRESH_TIMEOUT_MS }
        );
        clearTimeout(refreshTimer);
        const { accessToken } = response.data;
        setAccessToken(accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        if (refreshTimer) clearTimeout(refreshTimer);
        processQueue(refreshError, null);
        setAccessToken(null);
        localStorage.removeItem("jmshoes_admin");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  getSneakers: (params = {}) => apiClient.get("/sneakers", { params }).then((r) => r.data),
  getSneaker: (idOrSlug) => apiClient.get(`/sneakers/${idOrSlug}`).then((r) => r.data),
  getBrands: () => apiClient.get("/brands").then((r) => r.data),
  createSneaker: (data) => apiClient.post("/sneakers", data).then((r) => r.data),
  updateSneaker: (id, data) => apiClient.put(`/sneakers/${id}`, data).then((r) => r.data),
  deleteSneaker: (id) => apiClient.delete(`/sneakers/${id}`).then((r) => r.data),
  login: (username, password) => apiClient.post("/login", { username, password }).then((r) => r.data),
  logout: () => apiClient.post("/logout").then((r) => r.data),
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient
      .post("/upload", formData, {
        onUploadProgress: onProgress,
      })
      .then((r) => r.data);
  },
  uploadFiles: (files, onProgress) => {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    return apiClient
      .post("/upload/multiple", formData, {
        onUploadProgress: onProgress,
      })
      .then((r) => r.data);
  },
};

export { setAccessToken };
