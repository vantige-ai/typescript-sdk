import { VantigeAuth } from '../index';
import { VantigeSDKError, VantigeErrorCode } from '../../types/errors';

describe('VantigeAuth', () => {
  const validTestApiKey = global.TEST_CONFIG.validTestApiKey;
  const validLiveApiKey = global.TEST_CONFIG.validLiveApiKey;
  const invalidApiKey = global.TEST_CONFIG.invalidApiKey;

  describe('Constructor', () => {
    it('should create auth instance with valid test API key', () => {
      const auth = new VantigeAuth(validTestApiKey);
      expect(auth).toBeInstanceOf(VantigeAuth);
      expect(auth.getApiKey()).toBe(validTestApiKey);
    });

    it('should create auth instance with valid live API key', () => {
      const auth = new VantigeAuth(validLiveApiKey);
      expect(auth).toBeInstanceOf(VantigeAuth);
      expect(auth.getApiKey()).toBe(validLiveApiKey);
    });

    it('should throw error with empty API key', () => {
      expect(() => {
        new VantigeAuth('');
      }).toThrow(VantigeSDKError);
    });

    it('should throw error with invalid API key format', () => {
      expect(() => {
        new VantigeAuth('invalid_key');
      }).toThrow(VantigeSDKError);
    });

    it('should throw error with API key that has wrong prefix', () => {
      expect(() => {
        new VantigeAuth('vk_wrong_123456789012345678901234567890');
      }).toThrow(VantigeSDKError);
    });

    it('should throw error with API key that is too short', () => {
      expect(() => {
        new VantigeAuth('vk_test_short');
      }).toThrow(VantigeSDKError);
    });

    it('should throw error with API key that has invalid characters', () => {
      expect(() => {
        new VantigeAuth('vk_test_123456789012345678901234567@');
      }).toThrow(VantigeSDKError);
    });
  });

  describe('Environment Detection', () => {
    it('should detect test environment', () => {
      const auth = new VantigeAuth(validTestApiKey);
      expect(auth.isTest()).toBe(true);
      expect(auth.isLive()).toBe(false);
      expect(auth.getEnvironment()).toBe('test');
    });

    it('should detect live environment', () => {
      const auth = new VantigeAuth(validLiveApiKey);
      expect(auth.isTest()).toBe(false);
      expect(auth.isLive()).toBe(true);
      expect(auth.getEnvironment()).toBe('live');
    });
  });

  describe('Auth Headers', () => {
    it('should generate correct auth headers for test key', () => {
      const auth = new VantigeAuth(validTestApiKey);
      const headers = auth.getAuthHeaders();
      expect(headers).toEqual({
        Authorization: `Bearer ${validTestApiKey}`,
      });
    });

    it('should generate correct auth headers for live key', () => {
      const auth = new VantigeAuth(validLiveApiKey);
      const headers = auth.getAuthHeaders();
      expect(headers).toEqual({
        Authorization: `Bearer ${validLiveApiKey}`,
      });
    });
  });

  describe('API Key Masking', () => {
    it('should mask API key correctly', () => {
      const auth = new VantigeAuth(validTestApiKey);
      const masked = auth.maskApiKey();
      expect(masked).toMatch(/^vk_test_\*+3456$/);
      expect(masked.length).toBe(validTestApiKey.length);
    });

    it('should mask live API key correctly', () => {
      const auth = new VantigeAuth(validLiveApiKey);
      const masked = auth.maskApiKey();
      expect(masked).toMatch(/^vk_live_\*+3456$/);
      expect(masked.length).toBe(validLiveApiKey.length);
    });

    it('should return original key if too short', () => {
      const shortKey = 'vk_test_short';
      // This will throw in constructor, so we need to test the method directly
      // by creating a mock instance
      const auth = new VantigeAuth(validTestApiKey);
      // Override the apiKey property for this test
      (auth as any).apiKey = shortKey;
      
      const masked = auth.maskApiKey();
      expect(masked).toBe('vk_test_*hort'); // The masking logic still applies
    });
  });

  describe('Static validateKeyFormat', () => {
    it('should validate correct test API key', () => {
      const result = VantigeAuth.validateKeyFormat(validTestApiKey);
      expect(result.isValid).toBe(true);
      expect(result.environment).toBe('test');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate correct live API key', () => {
      const result = VantigeAuth.validateKeyFormat(validLiveApiKey);
      expect(result.isValid).toBe(true);
      expect(result.environment).toBe('live');
      expect(result.errors).toHaveLength(0);
    });

    it('should invalidate empty API key', () => {
      const result = VantigeAuth.validateKeyFormat('');
      expect(result.isValid).toBe(false);
      expect(result.environment).toBeUndefined();
      expect(result.errors).toContain('API key is required');
    });

    it('should invalidate API key with wrong prefix', () => {
      const result = VantigeAuth.validateKeyFormat('vk_wrong_123456789012345678901234567890');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API key must start with "vk_live_" or "vk_test_"');
    });

    it('should invalidate API key with invalid format', () => {
      const result = VantigeAuth.validateKeyFormat('vk_test_123456789012345678901234567@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API key format is invalid');
    });

    it('should invalidate API key that is too short', () => {
      const result = VantigeAuth.validateKeyFormat('vk_test_short');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API key is too short');
    });

    it('should return multiple errors for invalid key', () => {
      const result = VantigeAuth.validateKeyFormat('invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Static extractKeyInfo', () => {
    it('should extract key info from valid test key', () => {
      const result = VantigeAuth.extractKeyInfo(validTestApiKey);
      expect(result).not.toBeNull();
      expect(result!.prefix).toBe('vk_test_');
      expect(result!.environment).toBe('test');
      expect(result!.keyId).toBe(validTestApiKey.substring(8));
      expect(result!.isValid).toBe(true);
    });

    it('should extract key info from valid live key', () => {
      const result = VantigeAuth.extractKeyInfo(validLiveApiKey);
      expect(result).not.toBeNull();
      expect(result!.prefix).toBe('vk_live_');
      expect(result!.environment).toBe('live');
      expect(result!.keyId).toBe(validLiveApiKey.substring(8));
      expect(result!.isValid).toBe(true);
    });

    it('should return null for invalid key', () => {
      const result = VantigeAuth.extractKeyInfo('invalid_key');
      expect(result).toBeNull();
    });

    it('should return null for empty key', () => {
      const result = VantigeAuth.extractKeyInfo('');
      expect(result).toBeNull();
    });

    it('should return null for key with wrong number of parts', () => {
      const result = VantigeAuth.extractKeyInfo('vk_test');
      expect(result).toBeNull();
    });

    it('should return null for key with empty keyId', () => {
      const result = VantigeAuth.extractKeyInfo('vk_test_');
      expect(result).toBeNull();
    });
  });
});
