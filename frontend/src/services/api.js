import axios from "axios";

const rawApiBaseUrl = import.meta.env.VITE_API_URL;

if (!rawApiBaseUrl) {
  throw new Error("VITE_API_URL is required. Set it in Vercel and local .env files.");
}

const apiBaseUrl = rawApiBaseUrl.endsWith("/api")
  ? rawApiBaseUrl
  : `${rawApiBaseUrl.replace(/\/$/, "")}/api`;

const timeoutDuration = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 30000;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: timeoutDuration
});

const authApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: timeoutDuration
});

let refreshingPromise = null;

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  if (!refreshingPromise) {
    console.log("[LOADING STATE] Refreshing access token via API...");
    refreshingPromise = authApi.post("/auth/refresh", { refreshToken })
      .then((response) => {
        const data = response.data || {};
        if (data.accessToken) localStorage.setItem("token", data.accessToken);
        if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        // Notify same-tab AuthContext listeners to sync state
        window.dispatchEvent(new Event("auth-update"));
        console.log("[API RESPONSE] Access token successfully refreshed.");
        return data;
      })
      .catch((err) => {
        console.error("[API ERROR] Refreshing token failed:", err.message);
        throw err;
      })
      .finally(() => {
        refreshingPromise = null;
      });
  }

  return refreshingPromise;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[API RESPONSE] Success: ${response.config.method?.toUpperCase()} ${response.config.url} - Status ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`[API ERROR] Failed: ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status ${error.response?.status || "Network/Timeout Error"}: ${error.message}`);
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");
    const isRefreshRequest = requestUrl.includes("/auth/refresh");
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !isAuthRequest && !isRefreshRequest && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshed = await refreshAccessToken();
        if (refreshed?.accessToken) {
          originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth-update"));
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-update"));
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
