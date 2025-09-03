import {
  VantigeClient,
  VantigeHttpClient,
  VantigeAuth,
  createVantigeClient,
  createTestClient,
  createLiveClient,
  validateApiKeyFormat,
  SDK_VERSION,
  DEFAULT_CONFIG,
} from "../index";
import { VantigeConfig } from "../types";

// Mock the VantigeClient
jest.mock("../client/vantige-client", () => {
  const mockClientInstance = {
    getKeyInfo: jest
      .fn()
      .mockReturnValue({ environment: "test", maskedKey: "vk_test_****" }),
  };

  // Create a proper mock constructor that returns instances
  const MockVantigeClient = jest
    .fn()
    .mockImplementation(() => mockClientInstance) as any;

  // Make the mock constructor itself have the static methods
  MockVantigeClient.createTestClient = jest
    .fn()
    .mockImplementation(() => mockClientInstance);
  MockVantigeClient.createLiveClient = jest
    .fn()
    .mockImplementation(() => mockClientInstance);
  MockVantigeClient.validateApiKey = jest
    .fn()
    .mockImplementation((apiKey: string) => {
      if (apiKey === "invalid_key") {
        return {
          isValid: false,
          environment: undefined,
          errors: ["API key format is invalid"],
        };
      }
      if (apiKey.startsWith("vk_live_")) {
        return {
          isValid: true,
          environment: "live",
          errors: [],
        };
      }
      return {
        isValid: true,
        environment: "test",
        errors: [],
      };
    });

  return {
    VantigeClient: MockVantigeClient,
  };
});

describe("Main Index Exports", () => {
  const validTestApiKey = global.TEST_CONFIG.validTestApiKey;
  const validLiveApiKey = global.TEST_CONFIG.validLiveApiKey;

  describe("Factory Functions", () => {
    it("should create a client with createVantigeClient", () => {
      const client = createVantigeClient(validTestApiKey);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });

    it("should create a client with createVantigeClient and options", () => {
      const options: Partial<VantigeConfig> = {
        timeout: 60000,
        debug: true,
      };
      const client = createVantigeClient(validTestApiKey, options);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });

    it("should create a test client with createTestClient", () => {
      const client = createTestClient(validTestApiKey);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });

    it("should create a test client with createTestClient and options", () => {
      const options: Partial<VantigeConfig> = {
        timeout: 45000,
      };
      const client = createTestClient(validTestApiKey, options);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });

    it("should create a live client with createLiveClient", () => {
      const client = createLiveClient(validLiveApiKey);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });

    it("should create a live client with createLiveClient and options", () => {
      const options: Partial<VantigeConfig> = {
        retries: 5,
      };
      const client = createLiveClient(validLiveApiKey, options);
      expect(client).toBeDefined();
      expect(client.getKeyInfo).toBeDefined();
    });
  });

  describe("validateApiKeyFormat", () => {
    it("should validate test API key format", () => {
      const result = validateApiKeyFormat(validTestApiKey);
      expect(result.isValid).toBe(true);
      expect(result.environment).toBe("test");
      expect(result.errors).toHaveLength(0);
    });

    it("should validate live API key format", () => {
      const result = validateApiKeyFormat(validLiveApiKey);
      expect(result.isValid).toBe(true);
      expect(result.environment).toBe("live");
      expect(result.errors).toHaveLength(0);
    });

    it("should invalidate incorrect API key format", () => {
      const result = validateApiKeyFormat("invalid_key");
      expect(result.isValid).toBe(false);
      expect(result.environment).toBeUndefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Constants", () => {
    it("should export SDK_VERSION", () => {
      expect(SDK_VERSION).toBeDefined();
      expect(typeof SDK_VERSION).toBe("string");
    });

    it("should export DEFAULT_CONFIG", () => {
      expect(DEFAULT_CONFIG).toBeDefined();
      expect(DEFAULT_CONFIG).toEqual({
        timeout: 30000,
        retries: 3,
        debug: false,
      });
    });
  });

  describe("Class Exports", () => {
    it("should export VantigeClient", () => {
      expect(VantigeClient).toBeDefined();
      expect(typeof VantigeClient).toBe("function");
    });

    it("should export VantigeHttpClient", () => {
      expect(VantigeHttpClient).toBeDefined();
      expect(typeof VantigeHttpClient).toBe("function");
    });

    it("should export VantigeAuth", () => {
      expect(VantigeAuth).toBeDefined();
      expect(typeof VantigeAuth).toBe("function");
    });
  });
});
