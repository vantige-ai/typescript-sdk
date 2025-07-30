import { VantigeErrorCode, createVantigeError } from "../types/errors";
import { validateApiKey } from "../types/validation";

export class VantigeAuth {
  private apiKey!: string;
  private isTestKey!: boolean;

  constructor(apiKey: string) {
    this.validateAndSetApiKey(apiKey);
  }

  private validateAndSetApiKey(apiKey: string): void {
    if (!apiKey) {
      throw createVantigeError(
        VantigeErrorCode.INVALID_API_KEY,
        "API key is required",
      );
    }

    if (!validateApiKey(apiKey)) {
      throw createVantigeError(
        VantigeErrorCode.INVALID_API_KEY,
        'API key must start with "vk_live_" or "vk_test_"',
      );
    }

    // Validate key format more strictly
    const keyPattern = /^vk_(live|test)_[a-zA-Z0-9]{32,}$/;
    if (!keyPattern.test(apiKey)) {
      throw createVantigeError(
        VantigeErrorCode.INVALID_API_KEY,
        "API key format is invalid",
      );
    }

    this.apiKey = apiKey;
    this.isTestKey = apiKey.startsWith("vk_test_");
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public isTest(): boolean {
    return this.isTestKey;
  }

  public isLive(): boolean {
    return !this.isTestKey;
  }

  public getEnvironment(): "test" | "live" {
    return this.isTestKey ? "test" : "live";
  }

  public getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  public maskApiKey(): string {
    if (this.apiKey.length < 12) {
      return this.apiKey;
    }

    const prefix = this.apiKey.substring(0, 8);
    const suffix = this.apiKey.substring(this.apiKey.length - 4);
    const maskedLength = this.apiKey.length - 12;
    const masked = "*".repeat(maskedLength);

    return `${prefix}${masked}${suffix}`;
  }
  public static validateKeyFormat(apiKey: string): {
    isValid: boolean;
    environment?: "test" | "live";
    errors: string[];
  } {
    const errors: string[] = [];

    if (!apiKey) {
      errors.push("API key is required");
      return { isValid: false, errors };
    }

    if (!apiKey.startsWith("vk_live_") && !apiKey.startsWith("vk_test_")) {
      errors.push('API key must start with "vk_live_" or "vk_test_"');
    }

    const keyPattern = /^vk_(live|test)_[a-zA-Z0-9]{32,}$/;
    if (!keyPattern.test(apiKey)) {
      errors.push("API key format is invalid");
    }

    if (apiKey.length < 40) {
      errors.push("API key is too short");
    }

    const isValid = errors.length === 0;
    const environment = apiKey.startsWith("vk_test_") ? "test" : "live";

    const result: {
      isValid: boolean;
      environment?: "test" | "live";
      errors: string[];
    } = {
      isValid,
      errors,
    };

    if (isValid) {
      result.environment = environment;
    }

    return result;
  }

  public static extractKeyInfo(apiKey: string): {
    prefix: string;
    environment: "test" | "live";
    keyId: string;
    isValid: boolean;
  } | null {
    const validation = VantigeAuth.validateKeyFormat(apiKey);

    if (!validation.isValid) {
      return null;
    }

    const parts = apiKey.split("_");
    if (parts.length !== 3) {
      return null;
    }

    const keyId = parts[2];
    if (!keyId) {
      return null;
    }

    return {
      prefix: `${parts[0]}_${parts[1]}_`,
      environment: parts[1] as "test" | "live",
      keyId,
      isValid: true,
    };
  }
}
