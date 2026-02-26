import axios from "axios";
import { getAccessToken } from "./auth-session-storage";
import { authEvents } from "./auth-events";



const baseURL =
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim() || "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      authEvents.emit("UNAUTHORIZED");
    }

    return Promise.reject(error);
  }
);