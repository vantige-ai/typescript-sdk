import axios, { AxiosInstance, AxiosError } from "axios";
import { VantigeAuth } from "../auth";
import {
  VantigeSDKError,
  VantigeErrorCode,
  createVantigeError,
} from "../types/errors";

export interface HttpClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  auth: VantigeAuth;
  debug?: boolean;
}

export class VantigeHttpClient {
  private client: AxiosInstance;
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = config;

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `@vantige-ai/typescript-sdk/${process.env.npm_package_version || "0.1.0"}`,
        ...config.auth.getAuthHeaders(),
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(this.handleError(error)),
    );
  }

  private handleError(error: any): VantigeSDKError {
    if (error instanceof VantigeSDKError) {
      return error;
    }

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Handle network errors
      if (!axiosError.response) {
        if (axiosError.code === "ECONNABORTED") {
          return createVantigeError(
            VantigeErrorCode.REQUEST_TIMEOUT,
            "Request timed out",
          );
        }

        return createVantigeError(
          VantigeErrorCode.NETWORK_ERROR,
          "Network error occurred",
        );
      }

      // Handle HTTP errors
      const response = axiosError.response;
      const status = response.status;
      const data = response.data as any;

      // Map HTTP status codes to error codes
      let errorCode: VantigeErrorCode;
      switch (status) {
        case 401:
          errorCode = VantigeErrorCode.INVALID_API_KEY;
          break;
        case 403:
          errorCode = VantigeErrorCode.INSUFFICIENT_PERMISSIONS;
          break;
        case 404:
          errorCode = VantigeErrorCode.KNOWLEDGE_BASE_NOT_FOUND;
          break;
        case 429:
          errorCode = VantigeErrorCode.RATE_LIMIT_EXCEEDED;
          break;
        case 422:
          errorCode = VantigeErrorCode.VALIDATION_ERROR;
          break;
        case 500:
          errorCode = VantigeErrorCode.INTERNAL_SERVER_ERROR;
          break;
        case 503:
          errorCode = VantigeErrorCode.SERVICE_UNAVAILABLE;
          break;
        default:
          errorCode = VantigeErrorCode.NETWORK_ERROR;
      }

      return createVantigeError(
        errorCode,
        data?.error?.message || data?.message || axiosError.message,
        status,
        data?.error?.details || data?.details,
        data?.meta?.requestId || response.headers["x-request-id"],
      );
    }

    // Handle unknown errors
    return createVantigeError(
      VantigeErrorCode.INTERNAL_SERVER_ERROR,
      error.message || "Unknown error occurred",
    );
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: VantigeSDKError;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError =
          error instanceof VantigeSDKError ? error : this.handleError(error);

        // Don't retry on certain error types
        const nonRetryableErrors = [
          VantigeErrorCode.INVALID_API_KEY,
          VantigeErrorCode.INSUFFICIENT_PERMISSIONS,
          VantigeErrorCode.VALIDATION_ERROR,
          VantigeErrorCode.KNOWLEDGE_BASE_NOT_FOUND,
        ];

        if (nonRetryableErrors.includes(lastError.code as VantigeErrorCode)) {
          throw lastError;
        }

        // Don't retry on the last attempt
        if (attempt === this.config.retries) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  public async get<T = any>(url: string): Promise<T> {
    const response = await this.executeWithRetry(async () => {
      const res = await this.client.get<T>(url);
      return res.data;
    });

    return response;
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.executeWithRetry(async () => {
      const res = await this.client.post<T>(url, data);
      return res.data;
    });

    return response;
  }
}
