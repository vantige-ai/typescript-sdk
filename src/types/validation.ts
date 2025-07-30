import { z } from "zod";

// ===== CONFIGURATION VALIDATION =====

export const VantigeConfigSchema = z.object({
  apiKey: z
    .string()
    .refine((key) => key.startsWith("vk_live_") || key.startsWith("vk_test_"), {
      message: "API key must start with 'vk_live_' or 'vk_test_'",
    }),
  baseUrl: z.string().url().optional(),
  timeout: z.number().min(1000).max(60000).optional(),
  retries: z.number().min(0).max(5).optional(),
  debug: z.boolean().optional(),
});

// ===== VALIDATION HELPERS =====

export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith("vk_live_") || apiKey.startsWith("vk_test_");
}

export function validateCorpusId(corpusId: string): boolean {
  // Vantige uses nanoid(10) for corpus IDs
  // Format: 10 characters, alphanumeric with - and _
  const nanoidRegex = /^[a-zA-Z0-9_-]{10}$/;
  return nanoidRegex.test(corpusId);
}

export function validateKnowledgeBaseId(id: string): boolean {
  // Vantige uses nanoid(10) for corpus IDs
  // Format: 10 characters, alphanumeric with - and _
  const nanoidRegex = /^[a-zA-Z0-9_-]{10}$/;
  return nanoidRegex.test(id);
}

export function validateQueryLength(query: string): boolean {
  return query.length >= 1 && query.length <= 1000;
}

export function validateKnowledgeBaseIds(ids: string[]): boolean {
  return (
    ids.length >= 1 && ids.length <= 10 && ids.every(validateKnowledgeBaseId)
  );
}

// ===== SANITIZATION HELPERS =====

export function sanitizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}
