import axios from "axios";

const API_URL = "/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {
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
        const response = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("jmshoes_admin");
        window.location.href = "/admin/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  getSneakers: (params = {}) => apiClient.get("/sneakers", { params }),
  getSneaker: (id) => apiClient.get(`/sneakers/${id}`),
  createSneaker: (data) => apiClient.post("/sneakers", data),
  updateSneaker: (id, data) => apiClient.put(`/sneakers/${id}`, data),
  deleteSneaker: (id) => apiClient.delete(`/sneakers/${id}`),
  login: (username, password) => apiClient.post("/login", { username, password }),
  logout: () => apiClient.post("/logout"),
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadFiles: (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return apiClient.post("/upload/multiple", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
