import { VantigeAuth } from "../auth";
import { VantigeHttpClient } from "./http-client";
import {
  VantigeConfig,
  ListKnowledgeBasesParams,
  ListKnowledgeBasesResponse,
  QueryParams,
  QueryResponse,
  ApiKeyInfo,
} from "../types";
import { VantigeConfigSchema } from "../types/validation";
import { createVantigeError, VantigeErrorCode } from "../types/errors";

export class VantigeClient {
  private auth: VantigeAuth;
  private httpClient: VantigeHttpClient;

  constructor(config: VantigeConfig) {
    this.validateConfig(config);
    this.auth = new VantigeAuth(config.apiKey);
    this.httpClient = new VantigeHttpClient({
      baseUrl: config.baseUrl || "https://api.vantige.ai",
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      auth: this.auth,
      debug: config.debug || false,
    });
  }

  private validateConfig(config: VantigeConfig): void {
    try {
      VantigeConfigSchema.parse(config);
    } catch (error) {
      throw createVantigeError(
        VantigeErrorCode.CONFIGURATION_ERROR,
        `Invalid configuration: ${(error as Error).message}`,
        undefined,
        error as Error,
      );
    }
  }

  /**
   * List all knowledge bases for the organization
   */
  async listKnowledgeBases(
    params?: ListKnowledgeBasesParams,
  ): Promise<ListKnowledgeBasesResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }
    if (params?.includeArchived !== undefined) {
      queryParams.append("includeArchived", params.includeArchived.toString());
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/knowledge-base${queryString ? `?${queryString}` : ""}`;

    const response = await this.httpClient.get<ListKnowledgeBasesResponse>(url);

    if (!response.success) {
      throw createVantigeError(
        VantigeErrorCode.SERVICE_UNAVAILABLE,
        "Failed to list knowledge bases",
      );
    }

    return response;
  }

  /**
   * Query a specific knowledge base
   */
  async query(corpusId: string, params: QueryParams): Promise<QueryResponse> {
    if (!corpusId) {
      throw createVantigeError(
        VantigeErrorCode.VALIDATION_ERROR,
        "Corpus ID is required",
      );
    }

    if (!params.query || params.query.trim().length === 0) {
      throw createVantigeError(
        VantigeErrorCode.VALIDATION_ERROR,
        "Query is required",
      );
    }

    if (params.query.length > 1000) {
      throw createVantigeError(
        VantigeErrorCode.VALIDATION_ERROR,
        "Query must be 1000 characters or less",
      );
    }

    if (params.topK !== undefined && (params.topK < 1 || params.topK > 100)) {
      throw createVantigeError(
        VantigeErrorCode.VALIDATION_ERROR,
        "topK must be between 1 and 100",
      );
    }

    const response = await this.httpClient.post<QueryResponse>(
      `/api/v1/knowledge-base/${corpusId}/query`,
      params,
    );

    if (!response.success) {
      throw createVantigeError(
        VantigeErrorCode.SERVICE_UNAVAILABLE,
        "Query failed",
      );
    }

    return response;
  }

  /**
   * Get information about the current API key
   */
  getKeyInfo(): ApiKeyInfo {
    return {
      environment: this.auth.getEnvironment(),
      maskedKey: this.auth.maskApiKey(),
    };
  }

  /**
   * Test the connection to the Vantige API
   */
  async testConnection(): Promise<{
    success: boolean;
    latency: number;
    environment: "test" | "live";
  }> {
    const start = Date.now();

    try {
      await this.listKnowledgeBases({ limit: 1 });
      const latency = Date.now() - start;

      return {
        success: true,
        latency,
        environment: this.auth.getEnvironment(),
      };
    } catch (error) {
      throw createVantigeError(
        VantigeErrorCode.NETWORK_ERROR,
        "Failed to connect to Vantige API",
        undefined,
        error as Error,
      );
    }
  }

  // ===== STATIC FACTORY METHODS =====

  /**
   * Create a test client
   */
  static createTestClient(
    apiKey: string,
    options?: Partial<VantigeConfig>,
  ): VantigeClient {
    if (!apiKey.startsWith("vk_test_")) {
      throw createVantigeError(
        VantigeErrorCode.INVALID_API_KEY,
        'Test client requires an API key starting with "vk_test_"',
      );
    }

    return new VantigeClient({
      apiKey,
      ...options,
    });
  }

  /**
   * Create a live client
   */
  static createLiveClient(
    apiKey: string,
    options?: Partial<VantigeConfig>,
  ): VantigeClient {
    if (!apiKey.startsWith("vk_live_")) {
      throw createVantigeError(
        VantigeErrorCode.INVALID_API_KEY,
        'Live client requires an API key starting with "vk_live_"',
      );
    }

    return new VantigeClient({
      apiKey,
      ...options,
    });
  }

  /**
   * Validate an API key format
   */
  static validateApiKey(apiKey: string): {
    isValid: boolean;
    environment?: "test" | "live";
    errors: string[];
  } {
    return VantigeAuth.validateKeyFormat(apiKey);
  }
}
