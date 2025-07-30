// ===== MAIN CLIENT =====
import { VantigeClient } from './client/vantige-client';
import { VantigeConfig } from './types';
export { VantigeClient };

// ===== HTTP CLIENT (for advanced usage) =====
export { VantigeHttpClient } from './client/http-client';

// ===== AUTHENTICATION =====
export { VantigeAuth } from './auth';

// ===== TYPES =====
export type {
  // Configuration
  VantigeConfig,
  
  // Knowledge Base Types
  Dataset,
  KnowledgeBase,
  ListKnowledgeBasesParams,
  ListKnowledgeBasesResponse,
  PaginationInfo,
  
  // Query Types
  QueryParams,
  QueryResponse,
  RetrievalResult,
  
  // Error Types
  VantigeError,
  
  // Auth Types
  ApiKeyInfo
} from './types';

// ===== ERROR CLASSES =====
export { 
  VantigeSDKError,
  VantigeErrorCode,
  ErrorMessages,
  createVantigeError 
} from './types/errors';

// ===== VALIDATION UTILITIES =====
export {
  validateApiKey,
  validateCorpusId,
  validateKnowledgeBaseId,
  validateKnowledgeBaseIds,
  validateQueryLength,
  sanitizeQuery,
} from './types/validation';

// ===== CONVENIENCE FACTORY FUNCTIONS =====

/**
 * Create a Vantige client with automatic environment detection
 */
export function createVantigeClient(apiKey: string, options?: Partial<VantigeConfig>): VantigeClient {
  return new VantigeClient({
    apiKey,
    ...options
  });
}

/**
 * Create a test client (for vk_test_ keys)
 */
export function createTestClient(apiKey: string, options?: Partial<VantigeConfig>): VantigeClient {
  return VantigeClient.createTestClient(apiKey, options);
}

/**
 * Create a live client (for vk_live_ keys)
 */
export function createLiveClient(apiKey: string, options?: Partial<VantigeConfig>): VantigeClient {
  return VantigeClient.createLiveClient(apiKey, options);
}

/**
 * Validate an API key format without creating a client
 */
export function validateApiKeyFormat(apiKey: string): {
  isValid: boolean;
  environment?: 'test' | 'live';
  errors: string[];
} {
  return VantigeClient.validateApiKey(apiKey);
}

// ===== VERSION INFO =====
export const SDK_VERSION = process.env.npm_package_version || '0.1.0';

// ===== DEFAULT CONFIGURATION =====
export const DEFAULT_CONFIG = {
  timeout: 30000,
  retries: 3,
  debug: false
} as const;