import {
  VantigeConfigSchema,
  validateApiKey,
  validateCorpusId,
  validateKnowledgeBaseId,
  validateQueryLength,
  validateKnowledgeBaseIds,
  sanitizeQuery,
} from '../validation';

describe('Validation Functions', () => {
  const validTestApiKey = global.TEST_CONFIG.validTestApiKey;
  const validLiveApiKey = global.TEST_CONFIG.validLiveApiKey;

  describe('VantigeConfigSchema', () => {
    it('should validate correct config', () => {
      const config = {
        apiKey: validTestApiKey,
        baseUrl: 'https://api.vantige.ai',
        timeout: 30000,
        retries: 3,
        debug: true,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate config with minimal required fields', () => {
      const config = {
        apiKey: validTestApiKey,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject config with invalid API key', () => {
      const config = {
        apiKey: 'invalid_key',
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject config with invalid baseUrl', () => {
      const config = {
        apiKey: validTestApiKey,
        baseUrl: 'not-a-url',
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject config with timeout too low', () => {
      const config = {
        apiKey: validTestApiKey,
        timeout: 500,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject config with timeout too high', () => {
      const config = {
        apiKey: validTestApiKey,
        timeout: 70000,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject config with retries too low', () => {
      const config = {
        apiKey: validTestApiKey,
        retries: -1,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });

    it('should reject config with retries too high', () => {
      const config = {
        apiKey: validTestApiKey,
        retries: 10,
      };

      const result = VantigeConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('validateApiKey', () => {
    it('should validate test API key', () => {
      expect(validateApiKey(validTestApiKey)).toBe(true);
    });

    it('should validate live API key', () => {
      expect(validateApiKey(validLiveApiKey)).toBe(true);
    });

    it('should reject invalid API key', () => {
      expect(validateApiKey('invalid_key')).toBe(false);
    });

    it('should reject empty API key', () => {
      expect(validateApiKey('')).toBe(false);
    });

    it('should reject API key with wrong prefix', () => {
      expect(validateApiKey('vk_wrong_123456789012345678901234567890')).toBe(false);
    });
  });

  describe('validateCorpusId', () => {
    it('should validate correct corpus ID', () => {
      expect(validateCorpusId('2makgyrXV6')).toBe(true);
    });

    it('should validate corpus ID with hyphens', () => {
      expect(validateCorpusId('abc-123_XY')).toBe(true);
    });

    it('should validate corpus ID with underscores', () => {
      expect(validateCorpusId('abc_123-XY')).toBe(true);
    });

    it('should reject corpus ID that is too short', () => {
      expect(validateCorpusId('abc123')).toBe(false);
    });

    it('should reject corpus ID that is too long', () => {
      expect(validateCorpusId('abc123456789')).toBe(false);
    });

    it('should reject corpus ID with invalid characters', () => {
      expect(validateCorpusId('abc123@XY')).toBe(false);
    });

    it('should reject empty corpus ID', () => {
      expect(validateCorpusId('')).toBe(false);
    });
  });

  describe('validateKnowledgeBaseId', () => {
    it('should validate correct knowledge base ID', () => {
      expect(validateKnowledgeBaseId('2makgyrXV6')).toBe(true);
    });

    it('should validate knowledge base ID with hyphens', () => {
      expect(validateKnowledgeBaseId('abc-123_XY')).toBe(true);
    });

    it('should validate knowledge base ID with underscores', () => {
      expect(validateKnowledgeBaseId('abc_123-XY')).toBe(true);
    });

    it('should reject knowledge base ID that is too short', () => {
      expect(validateKnowledgeBaseId('abc123')).toBe(false);
    });

    it('should reject knowledge base ID that is too long', () => {
      expect(validateKnowledgeBaseId('abc123456789')).toBe(false);
    });

    it('should reject knowledge base ID with invalid characters', () => {
      expect(validateKnowledgeBaseId('abc123@XY')).toBe(false);
    });

    it('should reject empty knowledge base ID', () => {
      expect(validateKnowledgeBaseId('')).toBe(false);
    });
  });

  describe('validateQueryLength', () => {
    it('should validate query with minimum length', () => {
      expect(validateQueryLength('a')).toBe(true);
    });

    it('should validate query with maximum length', () => {
      const longQuery = 'a'.repeat(1000);
      expect(validateQueryLength(longQuery)).toBe(true);
    });

    it('should validate normal length query', () => {
      expect(validateQueryLength('How do I get started?')).toBe(true);
    });

    it('should reject empty query', () => {
      expect(validateQueryLength('')).toBe(false);
    });

    it('should reject query that is too long', () => {
      const tooLongQuery = 'a'.repeat(1001);
      expect(validateQueryLength(tooLongQuery)).toBe(false);
    });
  });

  describe('validateKnowledgeBaseIds', () => {
    it('should validate single knowledge base ID', () => {
      expect(validateKnowledgeBaseIds(['2makgyrXV6'])).toBe(true);
    });

    it('should validate multiple knowledge base IDs', () => {
      expect(validateKnowledgeBaseIds(['2makgyrXV6', 'abc123XYZ_', 'def456GHI-'])).toBe(true);
    });

    it('should validate maximum number of knowledge base IDs', () => {
      const ids = Array.from({ length: 10 }, (_, i) => `abc${i.toString().padStart(7, '0')}`);
      expect(validateKnowledgeBaseIds(ids)).toBe(true);
    });

    it('should reject empty array', () => {
      expect(validateKnowledgeBaseIds([])).toBe(false);
    });

    it('should reject too many knowledge base IDs', () => {
      const ids = Array.from({ length: 11 }, (_, i) => `abc${i.toString().padStart(7, '0')}`);
      expect(validateKnowledgeBaseIds(ids)).toBe(false);
    });

    it('should reject array with invalid knowledge base ID', () => {
      expect(validateKnowledgeBaseIds(['2makgyrXV6', 'invalid'])).toBe(false);
    });

    it('should reject array with all invalid knowledge base IDs', () => {
      expect(validateKnowledgeBaseIds(['invalid1', 'invalid2'])).toBe(false);
    });
  });

  describe('sanitizeQuery', () => {
    it('should trim whitespace', () => {
      expect(sanitizeQuery('  hello world  ')).toBe('hello world');
    });

    it('should replace multiple spaces with single space', () => {
      expect(sanitizeQuery('hello    world')).toBe('hello world');
    });

    it('should handle tabs and newlines', () => {
      expect(sanitizeQuery('hello\t\tworld\n\n')).toBe('hello world');
    });

    it('should handle mixed whitespace', () => {
      expect(sanitizeQuery('  hello   \t  world  \n  ')).toBe('hello world');
    });

    it('should handle single word', () => {
      expect(sanitizeQuery('hello')).toBe('hello');
    });

    it('should handle empty string', () => {
      expect(sanitizeQuery('')).toBe('');
    });

    it('should handle string with only whitespace', () => {
      expect(sanitizeQuery('   \t\n   ')).toBe('');
    });
  });
});
