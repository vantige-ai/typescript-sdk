import { z } from 'zod';
import { AvailableKnowledgeBase, QueryParams, QueryResponse } from '../types';
import { VantigeClient } from '../client/vantige-client';

/**
 * Minimal AI SDK compatible types to avoid importing the actual dependency.
 * These types mirror the parts we need for building tools.
 */
export interface MinimalToolCallOptions {
  toolCallId: string;
  messages: unknown[];
  abortSignal?: AbortSignal;
  experimental_context?: unknown;
}

export type MinimalToolExecuteFunction<INPUT, OUTPUT> = (
  input: INPUT,
  options?: MinimalToolCallOptions,
) => AsyncIterable<OUTPUT> | PromiseLike<OUTPUT> | OUTPUT;

export type AISDKToolLike<INPUT = any, OUTPUT = any> = {
  description?: string;
  providerOptions?: Record<string, unknown>;
  inputSchema: unknown; // zod schema works here
  onInputStart?: (options: MinimalToolCallOptions) => void | Promise<void>;
  onInputDelta?: (
    options: { inputTextDelta: string } & MinimalToolCallOptions,
  ) => void | Promise<void>;
  onInputAvailable?: (
    options: { input: INPUT } & MinimalToolCallOptions,
  ) => void | Promise<void>;
  toModelOutput?: (output: OUTPUT) => unknown;
  execute?: MinimalToolExecuteFunction<INPUT, OUTPUT>;
};

/**
 * Utility function to convert a string to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a safe tool key from knowledge base name
 */
function generateToolKey(knowledgeBase: AvailableKnowledgeBase): string {
  const baseKey = toKebabCase(knowledgeBase.name);
  // Ensure the key is valid and unique by appending ID if needed
  return baseKey || `knowledge-base-${knowledgeBase.id}`;
}

/**
 * Create AI SDK tools from available knowledge bases
 * 
 * @param knowledgeBases - Array of available knowledge bases
 * @param client - VantigeClient instance for querying
 * @returns Object of tools compatible with Vercel AI SDK
 */
export function createKnowledgeBaseTools(
  knowledgeBases: AvailableKnowledgeBase[],
  client: VantigeClient
): Record<string, AISDKToolLike<any, QueryResponse>> {
  const tools: Record<string, AISDKToolLike<any, QueryResponse>> = {};

  for (const kb of knowledgeBases) {
    const toolKey = generateToolKey(kb);
    
    // Create the tool using zod schema and execute function
    tools[toolKey] = {
      description: kb.description || `Query the ${kb.name} knowledge base`,
      inputSchema: z.object({
        query: z.string().describe('The search query to find relevant information'),
        topK: z.number().min(1).max(100).optional().describe('Maximum number of results to return (1-100)'),
        includeMetadata: z.boolean().optional().describe('Whether to include metadata in results'),
        useGeneration: z.boolean().optional().describe('Whether to use AI generation for response'),
        fieldMapping: z.object({
          sourceUri: z.string().optional().describe('Field name for source URI'),
          sourceDisplayName: z.string().optional().describe('Field name for source display name'),
        }).optional().describe('Custom field mapping for results'),
      }),
      execute: async (params: {
        query: string;
        topK?: number;
        includeMetadata?: boolean;
        useGeneration?: boolean;
        fieldMapping?: {
          sourceUri?: string;
          sourceDisplayName?: string;
        };
      }, _options?: MinimalToolCallOptions): Promise<QueryResponse> => {
        const queryParams: QueryParams = {
          query: params.query,
          ...(params.topK !== undefined && { topK: params.topK }),
          ...(params.includeMetadata !== undefined && { includeMetadata: params.includeMetadata }),
          ...(params.useGeneration !== undefined && { useGeneration: params.useGeneration }),
          ...(params.fieldMapping !== undefined && { fieldMapping: params.fieldMapping }),
        };

        return await client.query(kb.id, queryParams);
      },
    };
  }

  return tools;
}

/**
 * Create AI SDK tools from available knowledge bases with simplified interface
 * This version only requires the query parameter for easier usage
 * 
 * @param knowledgeBases - Array of available knowledge bases
 * @param client - VantigeClient instance for querying
 * @returns Object of tools compatible with Vercel AI SDK
 */
export function createSimpleKnowledgeBaseTools(
  knowledgeBases: AvailableKnowledgeBase[],
  client: VantigeClient
): Record<string, AISDKToolLike<{ query: string }, QueryResponse>> {
  const tools: Record<string, AISDKToolLike<{ query: string }, QueryResponse>> = {};

  for (const kb of knowledgeBases) {
    const toolKey = generateToolKey(kb);
    
    // Create the tool with simplified schema (only query required)
    tools[toolKey] = {
      description: kb.description || `Query the ${kb.name} knowledge base`,
      inputSchema: z.object({
        query: z.string().describe('The search query to find relevant information'),
      }),
      execute: async (params: { query: string }, _options?: MinimalToolCallOptions): Promise<QueryResponse> => {
        return await client.query(kb.id, { query: params.query });
      },
    };
  }

  return tools;
}

/**
 * Type for the tool creation options
 */
export interface CreateToolsOptions {
  /**
   * Whether to use simplified tool interface (only query parameter)
   * @default false
   */
  simplified?: boolean;
  
  /**
   * Custom function to generate tool keys from knowledge base names
   * @default toKebabCase
   */
  keyGenerator?: (kb: AvailableKnowledgeBase) => string;
  
  /**
   * Custom function to generate tool descriptions
   * @default uses kb.description or fallback
   */
  descriptionGenerator?: (kb: AvailableKnowledgeBase) => string;
}

/**
 * Create AI SDK tools from available knowledge bases with custom options
 * 
 * @param knowledgeBases - Array of available knowledge bases
 * @param client - VantigeClient instance for querying
 * @param options - Configuration options for tool creation
 * @returns Object of tools compatible with Vercel AI SDK
 */
export function createKnowledgeBaseToolsWithOptions(
  knowledgeBases: AvailableKnowledgeBase[],
  client: VantigeClient,
  options: CreateToolsOptions = {}
): Record<string, AISDKToolLike<any, QueryResponse>> {
  const {
    simplified = false,
    keyGenerator = generateToolKey,
    descriptionGenerator = (kb) => kb.description || `Query the ${kb.name} knowledge base`,
  } = options;

  const tools: Record<string, AISDKToolLike<any, QueryResponse>> = {};

  for (const kb of knowledgeBases) {
    const toolKey = keyGenerator(kb);
    const description = descriptionGenerator(kb);
    
    if (simplified) {
      tools[toolKey] = {
        description,
        inputSchema: z.object({
          query: z.string().describe('The search query to find relevant information'),
        }),
        execute: async (params: { query: string }, _options?: MinimalToolCallOptions): Promise<QueryResponse> => {
          return await client.query(kb.id, { query: params.query });
        },
      };
    } else {
      tools[toolKey] = {
        description,
        inputSchema: z.object({
          query: z.string().describe('The search query to find relevant information'),
          topK: z.number().min(1).max(100).optional().describe('Maximum number of results to return (1-100)'),
          includeMetadata: z.boolean().optional().describe('Whether to include metadata in results'),
          useGeneration: z.boolean().optional().describe('Whether to use AI generation for response'),
          fieldMapping: z.object({
            sourceUri: z.string().optional().describe('Field name for source URI'),
            sourceDisplayName: z.string().optional().describe('Field name for source display name'),
          }).optional().describe('Custom field mapping for results'),
        }),
        execute: async (params: {
          query: string;
          topK?: number;
          includeMetadata?: boolean;
          useGeneration?: boolean;
          fieldMapping?: {
            sourceUri?: string;
            sourceDisplayName?: string;
          };
        }, _options?: MinimalToolCallOptions): Promise<QueryResponse> => {
          const queryParams: QueryParams = {
            query: params.query,
            ...(params.topK !== undefined && { topK: params.topK }),
            ...(params.includeMetadata !== undefined && { includeMetadata: params.includeMetadata }),
            ...(params.useGeneration !== undefined && { useGeneration: params.useGeneration }),
            ...(params.fieldMapping !== undefined && { fieldMapping: params.fieldMapping }),
          };

          return await client.query(kb.id, queryParams);
        },
      };
    }
  }

  return tools;
}
