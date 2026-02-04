import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authClient } from "@/lib/auth-client";
import { env } from "@/env";

const API_BASE_URL = `${env.VITE_API_URL}/api`;

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Response interceptor: Handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - session expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data: session } = await authClient.getSession();

        if (session) {
          return axiosInstance(originalRequest);
        }

        await handleSignOut();
        return Promise.reject(error);
      } catch (sessionError) {
        console.error("Session verification failed:", sessionError);
        await handleSignOut();
        return Promise.reject(sessionError);
      }
    }

    // Log other errors for debugging
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    } else if (!error.response) {
      console.error("Network error:", error.message);
    }

    return Promise.reject(error);
  },
);

async function handleSignOut(): Promise<void> {
  await authClient.signOut();
  if (typeof window !== "undefined") {
    window.location.href = "/auth/candidate/signin";
  }
}

export default axiosInstance;
