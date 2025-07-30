// Jest setup file for the Vantige AI SDK

// Mock environment variables for testing
process.env.NODE_ENV = "test";

// Mock console methods in test environment if needed
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  // Restore console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;

  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
(global as any).TEST_CONFIG = {
  validTestApiKey: "vk_test_abcdefghijklmnopqrstuvwxyz123456",
  validLiveApiKey: "vk_live_abcdefghijklmnopqrstuvwxyz123456",
  invalidApiKey: "invalid_key",
  testKnowledgeBaseId: "2makgyrXV6", // Valid 10-character nanoid format
};

// Mock fetch if running in Node.js environment
if (typeof fetch === "undefined") {
  (global as any).fetch = jest.fn();
}

// Mock FormData if not available
if (typeof FormData === "undefined") {
  (global as any).FormData = jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    delete: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    set: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
  }));
}

// Mock File constructor if not available
if (typeof File === "undefined") {
  (global as any).File = jest
    .fn()
    .mockImplementation((fileBits: any, fileName: string, options?: any) => ({
      name: fileName,
      size: fileBits ? fileBits.length : 0,
      type: options?.type || "text/plain",
      lastModified: Date.now(),
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      text: jest.fn().mockResolvedValue(""),
      stream: jest.fn(),
    }));
}

// Mock Blob constructor if not available
if (typeof Blob === "undefined") {
  (global as any).Blob = jest
    .fn()
    .mockImplementation((blobParts: any, options?: any) => ({
      size: blobParts
        ? blobParts.reduce(
            (total: number, part: any) => total + (part.length || 0),
            0,
          )
        : 0,
      type: options?.type || "",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      text: jest.fn().mockResolvedValue(""),
      stream: jest.fn(),
      slice: jest.fn(),
    }));
}

// Helper function to create mock API responses
(global as any).createMockApiResponse = <T>(
  data: T,
  success: boolean = true,
) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : { code: "TEST_ERROR", message: "Test error" },
  meta: {
    requestId: "test-request-id",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    processingTime: 100,
  },
});

// Helper function to create mock axios responses
(global as any).createMockAxiosResponse = <T>(
  data: T,
  status: number = 200,
) => ({
  data,
  status,
  statusText: "OK",
  headers: {
    "content-type": "application/json",
    "x-request-id": "test-request-id",
  },
  config: {},
  request: {},
});

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      TEST_CONFIG: {
        validTestApiKey: string;
        validLiveApiKey: string;
        invalidApiKey: string;
        testKnowledgeBaseId: string;
      };
      createMockApiResponse: <T>(data: T, success?: boolean) => any;
      createMockAxiosResponse: <T>(data: T, status?: number) => any;
    }
  }
}

export {};
