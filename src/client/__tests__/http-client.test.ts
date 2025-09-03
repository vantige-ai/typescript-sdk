import { VantigeHttpClient } from '../http-client';
import { VantigeAuth } from '../../auth';
import { VantigeSDKError, VantigeErrorCode } from '../../types/errors';
import axios, { AxiosError } from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VantigeHttpClient', () => {
  let httpClient: VantigeHttpClient;
  let mockAuth: jest.Mocked<VantigeAuth>;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAuth = {
      getAuthHeaders: jest.fn().mockReturnValue({
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      }),
    } as any;

    // Create a proper mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      patch: jest.fn(),
      request: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
      },
      defaults: {},
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

    httpClient = new VantigeHttpClient({
      baseUrl: 'https://api.vantige.ai',
      timeout: 30000,
      retries: 3,
      auth: mockAuth,
      debug: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create HTTP client with correct configuration', () => {
      expect(httpClient).toBeInstanceOf(VantigeHttpClient);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.vantige.ai',
        timeout: 30000,
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json',
          'User-Agent': '@vantige-ai/typescript-sdk/0.1.2',
        },
      });
    });

    it('should set up response interceptor', () => {
      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded') as AxiosError;
      timeoutError.code = 'ECONNABORTED';
      timeoutError.isAxiosError = true;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(timeoutError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle network errors without response', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;
      networkError.response = undefined;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(networkError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 401 Unauthorized errors', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(unauthorizedError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 403 Forbidden errors', async () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(forbiddenError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 404 Not Found errors', async () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { error: 'Not Found' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(notFoundError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 422 Validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: { error: 'Validation failed' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(validationError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 429 Rate Limit errors', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(rateLimitError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 500 Internal Server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(serverError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle 503 Service Unavailable errors', async () => {
      const serviceUnavailableError = {
        response: {
          status: 503,
          data: { error: 'Service Unavailable' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(serviceUnavailableError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle unknown HTTP errors', async () => {
      const unknownError = {
        response: {
          status: 418,
          data: { error: 'I\'m a teapot' },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get = jest.fn().mockRejectedValue(unknownError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Generic error');

      mockAxiosInstance.get = jest.fn().mockRejectedValue(genericError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
    }, 10000);
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      const networkError = new Error('Network Error') as AxiosError;
      networkError.isAxiosError = true;
      networkError.response = undefined;

      const successResponse = { success: true };

      mockAxiosInstance.get = jest.fn()
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({ data: successResponse });

      const result = await httpClient.get('/test');
      expect(result).toEqual(successResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should not retry on authentication errors', async () => {
      const authError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
          headers: {},
        },
        isAxiosError: true,
        message: 'Request failed with status code 401',
      } as AxiosError;

      // Make sure axios.isAxiosError recognizes this as an axios error
      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      mockAxiosInstance.get = jest.fn().mockRejectedValue(authError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should not retry on validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: { error: 'Validation failed' },
          headers: {},
        },
        isAxiosError: true,
        message: 'Request failed with status code 422',
      } as AxiosError;

      // Make sure axios.isAxiosError recognizes this as an axios error
      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      mockAxiosInstance.get = jest.fn().mockRejectedValue(validationError);

      await expect(httpClient.get('/test')).rejects.toThrow(VantigeSDKError);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1);
    }, 10000);

    it('should retry on rate limit errors with delay', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
          headers: {},
        },
        isAxiosError: true,
      } as AxiosError;

      const successResponse = { success: true };

      // Make sure axios.isAxiosError recognizes this as an axios error
      jest.spyOn(axios, 'isAxiosError').mockReturnValue(true);

      mockAxiosInstance.get = jest.fn()
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValueOnce({ data: successResponse });

      // Mock setTimeout to avoid actual delays in tests
      jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
        fn();
        return {} as any;
      });

      const result = await httpClient.get('/test');
      expect(result).toEqual(successResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);

      jest.restoreAllMocks();
    }, 10000);
  });

  describe('HTTP Methods', () => {
    it('should make GET requests', async () => {
      const mockResponse = { success: true };
      mockAxiosInstance.get = jest.fn().mockResolvedValue({ data: mockResponse });

      const result = await httpClient.get('/test');
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test');
    });

    it('should make POST requests', async () => {
      const mockResponse = { success: true };
      const mockData = { test: 'data' };
      mockAxiosInstance.post = jest.fn().mockResolvedValue({ data: mockResponse });

      const result = await httpClient.post('/test', mockData);
      expect(result).toEqual(mockResponse);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', mockData);
    });
  });
});
