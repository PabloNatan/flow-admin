import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiConfig } from "./api.types";

// API Configuration
const apiConfig: ApiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
  apiKey: process.env.NEXT_PUBLIC_API_KEY || "your-api-key",
  applicationId: process.env.NEXT_PUBLIC_APP_ID!,
};

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: apiConfig.baseURL,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": apiConfig.apiKey,
    "x-application-id": apiConfig.applicationId,
  },
});

// API Error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Axios interceptors for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    const message = (error.response?.data as any)?.message || error.message;
    throw new ApiError(status, message);
  }
);
