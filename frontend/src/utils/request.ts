import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types/api";

const request: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse | Blob>) => {
    const { data } = response;

    // Skip interceptor for blob responses (file downloads)
    if (data instanceof Blob) {
      return response;
    }

    // Check if response is successful
    if (typeof data === 'object' && data !== null && 'code' in data) {
      const apiData = data as ApiResponse;
      if (apiData.code >= 200 && apiData.code < 300) {
        return response;
      }

      // Handle business errors
      return Promise.reject(new Error(apiData.message || "Request failed"));
    }

    return response;
  },
  (error) => {
    // Handle HTTP errors
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          window.location.href = "/login";
          break;
        case 403:
          console.error("Forbidden");
          break;
        case 404:
          console.error("Not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(data?.message || "Unknown error");
      }
    } else if (error.request) {
      console.error("Network error");
    }

    return Promise.reject(error.response.data);
  }
);

export default request;
