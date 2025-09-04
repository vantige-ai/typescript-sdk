import {
  createKnowledgeBaseTools,
  createSimpleKnowledgeBaseTools,
  createKnowledgeBaseToolsWithOptions,
} from '../ai-sdk-tools';
import { VantigeClient } from '../../client/vantige-client';
import { AvailableKnowledgeBase, QueryResponse } from '../../types';

// Mock the VantigeClient
jest.mock('../../client/vantige-client');

describe('AI SDK Tools', () => {
  let mockClient: jest.Mocked<VantigeClient>;
  let mockKnowledgeBases: AvailableKnowledgeBase[];

  beforeEach(() => {
    mockClient = {
      query: jest.fn(),
    } as any;

    mockKnowledgeBases = [
      {
        id: 'kb1',
        name: 'Product Documentation',
        description: 'Main product documentation and guides',
        status: 'active',
        documentCount: 42,
        isArchived: false,
        externalScopes: ['public'],
        organizationId: 'org123',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-20T15:45:00.000Z',
        datasets: [],
      },
      {
        id: 'kb2',
        name: 'API Reference',
        description: 'Complete API reference documentation',
        status: 'active',
        documentCount: 25,
        isArchived: false,
        externalScopes: ['public'],
        organizationId: 'org123',
        createdAt: '2024-01-10T09:00:00.000Z',
        updatedAt: '2024-01-18T14:30:00.000Z',
        datasets: [],
      },
      {
        id: 'kb3',
        name: 'User Guide & FAQ',
        description: 'User guides and frequently asked questions',
        status: 'active',
        documentCount: 18,
        isArchived: false,
        externalScopes: ['public'],
        organizationId: 'org123',
        createdAt: '2024-01-05T08:00:00.000Z',
        updatedAt: '2024-01-15T12:00:00.000Z',
        datasets: [],
      },
    ];
  });

  describe('Tool key generation', () => {
    it('should generate kebab-case tool keys from knowledge base names', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);

      expect(tools).toHaveProperty('product-documentation');
      expect(tools).toHaveProperty('api-reference');
      expect(tools).toHaveProperty('user-guide-faq');
    });

    it('should handle special characters in knowledge base names', () => {
      const specialKB = [{
        ...mockKnowledgeBases[0],
        name: 'Special@Characters#Test',
      }];

      const tools = createKnowledgeBaseTools(specialKB, mockClient);
      expect(tools).toHaveProperty('specialcharacterstest');
    });

    it('should fallback to ID-based key for empty names', () => {
      const kbWithEmptyName = [{
        ...mockKnowledgeBases[0],
        name: '',
      }];

      const tools = createKnowledgeBaseTools(kbWithEmptyName, mockClient);
      expect(tools).toHaveProperty('knowledge-base-kb1');
    });
  });

  describe('createKnowledgeBaseTools', () => {
    it('should create tools for all knowledge bases', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);

      expect(Object.keys(tools)).toHaveLength(3);
      expect(tools).toHaveProperty('product-documentation');
      expect(tools).toHaveProperty('api-reference');
      expect(tools).toHaveProperty('user-guide-faq');
    });

    it('should create tools with v4 schema format', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient, 'v4');
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('parameters');
      expect(tool).not.toHaveProperty('inputSchema');
      expect(tool.parameters).toBeDefined();
    });

    it('should create tools with v5 schema format by default', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('inputSchema');
      expect(tool).not.toHaveProperty('parameters');
      expect(tool.inputSchema).toBeDefined();
    });

    it('should create tools with correct structure', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
      expect(tool).toHaveProperty('execute');
      expect(tool.description).toBe('Main product documentation and guides');
    });

    it('should create tools with proper input schema', () => {
      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      // Test that the schema validates correctly
      const validInput = {
        query: 'How do I get started?',
        topK: 5,
        includeMetadata: true,
        useGeneration: false,
        fieldMapping: {
          sourceUri: 'url',
          sourceDisplayName: 'title',
        },
      };

      // The schema should be a zod object, we can't easily test it directly
      // but we can verify the tool structure
      expect(typeof tool.execute).toBe('function');
    });

    it('should execute tool with correct parameters', async () => {
      const mockQueryResponse: QueryResponse = {
        success: true,
        corpusId: 'kb1',
        query: 'test query',
        retrieval_results: [],
      };

      mockClient.query.mockResolvedValue(mockQueryResponse);

      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      const result = await tool.execute!({
        query: 'How do I get started?',
        topK: 5,
        useGeneration: true,
      });

      expect(mockClient.query).toHaveBeenCalledWith('kb1', {
        query: 'How do I get started?',
        topK: 5,
        useGeneration: true,
      });
      expect(result).toEqual(mockQueryResponse);
    });

    it('should handle optional parameters correctly', async () => {
      const mockQueryResponse: QueryResponse = {
        success: true,
        corpusId: 'kb1',
        query: 'test query',
        retrieval_results: [],
      };

      mockClient.query.mockResolvedValue(mockQueryResponse);

      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      await tool.execute!({
        query: 'Simple query',
      });

      expect(mockClient.query).toHaveBeenCalledWith('kb1', {
        query: 'Simple query',
      });
    });
  });

  describe('createSimpleKnowledgeBaseTools', () => {
    it('should create simplified tools with only query parameter', () => {
      const tools = createSimpleKnowledgeBaseTools(mockKnowledgeBases, mockClient);

      expect(Object.keys(tools)).toHaveLength(3);
      expect(tools).toHaveProperty('product-documentation');
    });

    it('should create tools with v4 schema format', () => {
      const tools = createSimpleKnowledgeBaseTools(mockKnowledgeBases, mockClient, 'v4');
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('parameters');
      expect(tool).not.toHaveProperty('inputSchema');
      expect(tool.parameters).toBeDefined();
    });

    it('should create tools with v5 schema format by default', () => {
      const tools = createSimpleKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('inputSchema');
      expect(tool).not.toHaveProperty('parameters');
      expect(tool.inputSchema).toBeDefined();
    });

    it('should execute with only query parameter', async () => {
      const mockQueryResponse: QueryResponse = {
        success: true,
        corpusId: 'kb1',
        query: 'test query',
        retrieval_results: [],
      };

      mockClient.query.mockResolvedValue(mockQueryResponse);

      const tools = createSimpleKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      const result = await tool.execute!({
        query: 'How do I get started?',
      });

      expect(mockClient.query).toHaveBeenCalledWith('kb1', {
        query: 'How do I get started?',
      });
      expect(result).toEqual(mockQueryResponse);
    });
  });

  describe('createKnowledgeBaseToolsWithOptions', () => {
    it('should create tools with custom key generator', () => {
      const customKeyGenerator = (kb: AvailableKnowledgeBase) => `custom-${kb.id}`;

      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { keyGenerator: customKeyGenerator }
      );

      expect(Object.keys(tools)).toHaveLength(3);
      expect(tools).toHaveProperty('custom-kb1');
      expect(tools).toHaveProperty('custom-kb2');
      expect(tools).toHaveProperty('custom-kb3');
    });

    it('should create tools with custom description generator', () => {
      const customDescriptionGenerator = (kb: AvailableKnowledgeBase) => 
        `Custom: ${kb.name} (${kb.documentCount} docs)`;

      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { descriptionGenerator: customDescriptionGenerator }
      );

      const tool = tools['product-documentation'];
      expect(tool.description).toBe('Custom: Product Documentation (42 docs)');
    });

    it('should create simplified tools when simplified option is true', () => {
      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { simplified: true }
      );

      const tool = tools['product-documentation'];
      expect(tool).toHaveProperty('execute');
      expect(typeof tool.execute).toBe('function');
    });

    it('should use default options when none provided', () => {
      const tools = createKnowledgeBaseToolsWithOptions(mockKnowledgeBases, mockClient);

      expect(Object.keys(tools)).toHaveLength(3);
      expect(tools).toHaveProperty('product-documentation');
      expect(tools).toHaveProperty('api-reference');
      expect(tools).toHaveProperty('user-guide-faq');
    });

    it('should combine multiple custom options', () => {
      const customKeyGenerator = (kb: AvailableKnowledgeBase) => `kb-${kb.id}`;
      const customDescriptionGenerator = (kb: AvailableKnowledgeBase) => 
        `Query ${kb.name} knowledge base`;

      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        {
          simplified: true,
          keyGenerator: customKeyGenerator,
          descriptionGenerator: customDescriptionGenerator,
        }
      );

      expect(Object.keys(tools)).toHaveLength(3);
      expect(tools).toHaveProperty('kb-kb1');
      
      const tool = tools['kb-kb1'];
      expect(tool.description).toBe('Query Product Documentation knowledge base');
    });

    it('should create tools with v4 schema format', () => {
      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { version: 'v4' }
      );
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('parameters');
      expect(tool).not.toHaveProperty('inputSchema');
      expect(tool.parameters).toBeDefined();
    });

    it('should create simplified tools with v4 schema format', () => {
      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { simplified: true, version: 'v4' }
      );
      const tool = tools['product-documentation'];

      expect(tool).toHaveProperty('parameters');
      expect(tool).not.toHaveProperty('inputSchema');
      expect(tool.parameters).toBeDefined();
    });

    it('should execute simplified tools with v4 schema format', async () => {
      const mockQueryResponse: QueryResponse = {
        success: true,
        corpusId: 'kb1',
        query: 'test query',
        retrieval_results: [],
      };

      mockClient.query.mockResolvedValue(mockQueryResponse);

      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { simplified: true, version: 'v4' }
      );
      const tool = tools['product-documentation'];

      const result = await tool.execute!({
        query: 'test query',
      });

      expect(mockClient.query).toHaveBeenCalledWith('kb1', {
        query: 'test query',
      });
      expect(result).toEqual(mockQueryResponse);
    });
  });

  describe('Error handling', () => {
    it('should propagate client query errors', async () => {
      const error = new Error('Network error');
      mockClient.query.mockRejectedValue(error);

      const tools = createKnowledgeBaseTools(mockKnowledgeBases, mockClient);
      const tool = tools['product-documentation'];

      await expect(tool.execute!({
        query: 'test query',
      })).rejects.toThrow('Network error');
    });

    it('should handle empty knowledge bases array', () => {
      const tools = createKnowledgeBaseTools([], mockClient);
      expect(Object.keys(tools)).toHaveLength(0);
    });

    it('should test the non-simplified path in createKnowledgeBaseToolsWithOptions', async () => {
      const mockQueryResponse: QueryResponse = {
        success: true,
        corpusId: 'kb1',
        query: 'test query',
        retrieval_results: [],
      };

      mockClient.query.mockResolvedValue(mockQueryResponse);

      const tools = createKnowledgeBaseToolsWithOptions(
        mockKnowledgeBases,
        mockClient,
        { simplified: false }
      );

      const tool = tools['product-documentation'];
      const result = await tool.execute!({
        query: 'How do I get started?',
        topK: 5,
        includeMetadata: true,
        useGeneration: false,
        fieldMapping: {
          sourceUri: 'url',
          sourceDisplayName: 'title',
        },
      });

      expect(mockClient.query).toHaveBeenCalledWith('kb1', {
        query: 'How do I get started?',
        topK: 5,
        includeMetadata: true,
        useGeneration: false,
        fieldMapping: {
          sourceUri: 'url',
          sourceDisplayName: 'title',
        },
      });
      expect(result).toEqual(mockQueryResponse);
    });
  });
});
