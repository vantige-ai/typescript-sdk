<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://www.vantige.ai/vantige-logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://www.vantige.ai/vantige-logo.png">
    <img src="https://www.vantige.ai/vantige-logo.png" alt="Vantige AI Logo" width="200" />
  </picture>
</p>

# Vantige AI TypeScript SDK

[![npm version](https://badge.fury.io/js/@vantige-ai%2Ftypescript-sdk.svg)](https://badge.fury.io/js/@vantige-ai%2Ftypescript-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/gh/vantige-ai/typescript-sdk/branch/master/graph/badge.svg)](https://codecov.io/gh/vantige-ai/typescript-sdk)

**The easiest way to add intelligent search to your app.**

Stop building complex RAG pipelines. Vantige gives your team the power to create knowledge bases without engineering support, and then implement them into your app with a few lines of code.

```typescript
// Start asking questions  
const result = await vantige.query("How much PTO do I have?");
console.log(result.answer); 
// Step-by-step instructions with source citations
```

[Learn more about Vantige AI](https://www.vantige.ai)

## Features

- 🔍 **Knowledge Base Querying** - Query your organization's knowledge bases with semantic search
- 📚 **Knowledge Base Management** - List and access all knowledge bases in your organization
- 🔐 **Secure Authentication** - API key-based authentication with test/live environment support
- 🚀 **TypeScript Support** - Full type safety with comprehensive TypeScript definitions
- ⚡ **Performance Optimized** - Built-in retry logic and error handling
- 🛠 **Developer Friendly** - Simple, intuitive API design

## Installation

```bash
npm install @vantige-ai/typescript-sdk
```

```bash
yarn add @vantige-ai/typescript-sdk
```

```bash
pnpm add @vantige-ai/typescript-sdk
```

## Quick Start

### Basic Setup

```typescript
import { VantigeClient } from '@vantige-ai/typescript-sdk';

// Initialize the client
const client = new VantigeClient({
  apiKey: 'vk_live_your_api_key_here'
});

// List all knowledge bases
const knowledgeBases = await client.listKnowledgeBases();
console.log(knowledgeBases);

// Query a knowledge base
const results = await client.query('2makgyrXV6', {
  query: 'What are the key features?',
  topK: 5,
  useGeneration: true
});

console.log(results.response); // AI-generated response
console.log(results.retrieval_results); // Source documents
```

### Environment-Specific Clients

```typescript
// Test environment
const testClient = VantigeClient.createTestClient('vk_test_your_test_key');

// Live environment
const liveClient = VantigeClient.createLiveClient('vk_live_your_live_key');
```

## API Reference

### VantigeClient

The main client class for interacting with the Vantige AI API.

#### Constructor

```typescript
const client = new VantigeClient({
  apiKey: string,           // Required: vk_live_ or vk_test_ prefixed key
  baseUrl?: string,         // Optional: custom API base URL (default: https://api.vantige.ai)
  timeout?: number,         // Optional: request timeout in ms (default: 30000)
  retries?: number,         // Optional: number of retry attempts (default: 3)
  debug?: boolean          // Optional: enable debug logging (default: false)
});
```

#### List Knowledge Bases

Get all knowledge bases for your organization.

```typescript
const response = await client.listKnowledgeBases({
  page?: number,              // Page number (default: 1)
  limit?: number,            // Items per page (default: 20, max: 100)
  includeArchived?: boolean  // Include archived knowledge bases (default: false)
});

// Response structure
{
  success: true,
  knowledgeBases: [
    {
      id: "2makgyrXV6",  // 10-character nanoid
      name: "Product Documentation",
      description: "Main product documentation and guides",
      status: "active",
      documentCount: 42,
      isArchived: false,
      createdAt: "2024-01-15T10:30:00.000Z",
      updatedAt: "2024-01-20T15:45:00.000Z",
      datasets: [
        {
          datasetId: "abc123XYZ_",
          datasetName: "Q1 2024 Docs",
          importStatus: "completed",
          importedAt: "2024-01-15T10:35:00.000Z",
          fileCount: 42
        }
      ]
    }
  ],
  pagination: {
    total: 3,
    page: 1,
    limit: 20,
    totalPages: 1
  }
}
```

#### Query Knowledge Base

Search for information within a specific knowledge base.

```typescript
const response = await client.query('2makgyrXV6', {
  query: string,              // Required: Search query (1-1000 characters)
  topK?: number,              // Number of results to return (1-100, default: 10)
  includeMetadata?: boolean,  // Include metadata in results (default: true)
  useGeneration?: boolean,    // Generate AI response (default: false)
  fieldMapping?: {            // Custom field names in response
    sourceUri?: string,
    sourceDisplayName?: string
  }
});

// Response without AI generation (useGeneration: false)
{
  success: true,
  corpusId: "2makgyrXV6",
  query: "What are the key features?",
  retrieval_results: [
    {
      text: "Our product offers three key features...",
      score: 0.92,
      source_uri: "https://storage.googleapis.com/...",  // Signed URL (24hr expiry)
      source_display_name: "features-overview.pdf",
      // Additional metadata fields if includeMetadata: true
    }
  ]
}

// Response with AI generation (useGeneration: true)
{
  success: true,
  corpusId: "2makgyrXV6",
  query: "What are the key features?",
  response: "Based on the documentation, the key features are...",  // AI-generated
  retrieval_results: [...] // Same as above
}
```

#### Get API Key Information

Get information about the current API key without exposing it.

```typescript
const keyInfo = client.getKeyInfo();
// Returns:
{
  environment: 'test' | 'live',
  maskedKey: 'vk_test_****3456'  // Partially masked for security
}
```

#### Test Connection

Test connectivity to the Vantige API.

```typescript
const result = await client.testConnection();
// Returns:
{
  success: true,
  latency: 125,  // Response time in milliseconds
  environment: 'live'
}
```

### Static Methods

#### Validate API Key

Validate an API key format without making an API call.

```typescript
const validation = VantigeClient.validateApiKey('vk_test_abcd...');
// Returns:
{
  isValid: true,
  environment: 'test',
  errors: []
}
```

#### Create Environment-Specific Clients

Factory methods that validate the API key prefix.

```typescript
// These will throw an error if the key has the wrong prefix
const testClient = VantigeClient.createTestClient('vk_test_...');
const liveClient = VantigeClient.createLiveClient('vk_live_...');
```

## Authentication

### API Key Format

Vantige AI uses API keys with specific prefixes:
- **Test Keys**: `vk_test_` followed by 32 alphanumeric characters
- **Live Keys**: `vk_live_` followed by 32 alphanumeric characters

Total key length: 40 characters

### Required Scope

All SDK operations require the `knowledgebase:read` scope. The backend validates this automatically.

## Error Handling

The SDK provides detailed error information through the `VantigeSDKError` class:

```typescript
import { VantigeSDKError, VantigeErrorCode } from '@vantige-ai/typescript-sdk';

try {
  const results = await client.query('corpus123', { query: "test" });
} catch (error) {
  if (error instanceof VantigeSDKError) {
    console.error('Error Code:', error.code);
    console.error('HTTP Status:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Request ID:', error.requestId);
    
    switch (error.code) {
      case VantigeErrorCode.INVALID_API_KEY:
        // Handle invalid API key
        break;
      case VantigeErrorCode.INSUFFICIENT_PERMISSIONS:
        // API key lacks required scope
        break;
      case VantigeErrorCode.KNOWLEDGE_BASE_NOT_FOUND:
        // Knowledge base doesn't exist or access denied
        break;
      case VantigeErrorCode.RATE_LIMIT_EXCEEDED:
        // Too many requests
        break;
      case VantigeErrorCode.VALIDATION_ERROR:
        // Invalid request parameters
        break;
    }
  }
}
```

### Common Error Codes

- `INVALID_API_KEY` (401) - API key is invalid or malformed
- `INSUFFICIENT_PERMISSIONS` (403) - API key lacks required scope
- `KNOWLEDGE_BASE_NOT_FOUND` (404) - Knowledge base not found or access denied
- `VALIDATION_ERROR` (422) - Invalid request parameters
- `RATE_LIMIT_EXCEEDED` (429) - Too many requests
- `INTERNAL_SERVER_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - Service temporarily unavailable

## Important Notes

### Knowledge Base IDs

Vantige uses 10-character nanoid format for knowledge base IDs (corpus IDs):
- Format: 10 characters using alphanumeric + `-` and `_`
- Examples: `2makgyrXV6`, `joP0TFqSmY`, `abc123XYZ_`

### Signed URLs

The `source_uri` field in query results returns signed URLs that:
- Provide direct access to source documents
- Expire after 24 hours
- Should not be stored long-term

### Rate Limiting

The SDK automatically retries with exponential backoff for:
- Network errors
- 5xx server errors
- Rate limit errors (after delay)

Non-retryable errors:
- Authentication errors (401, 403)
- Validation errors (422)
- Not found errors (404)

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  VantigeConfig,
  QueryParams,
  QueryResponse,
  KnowledgeBase,
  ListKnowledgeBasesResponse,
  RetrievalResult,
  ApiKeyInfo
} from '@vantige-ai/typescript-sdk';
```

## Examples

### Basic Query

```typescript
const client = new VantigeClient({
  apiKey: process.env.VANTIGE_API_KEY!
});

const results = await client.query('2makgyrXV6', {
  query: 'How do I get started?'
});

console.log(`Found ${results.retrieval_results.length} results`);
results.retrieval_results.forEach(result => {
  console.log(`- ${result.source_display_name} (score: ${result.score})`);
});
```

### Query with AI Generation

```typescript
const results = await client.query('2makgyrXV6', {
  query: 'Summarize the onboarding process',
  topK: 3,
  useGeneration: true
});

console.log('AI Summary:', results.response);
console.log('Based on:', results.retrieval_results.length, 'sources');
```

### Paginated Listing

```typescript
async function getAllKnowledgeBases(client: VantigeClient) {
  const allKnowledgeBases = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await client.listKnowledgeBases({
      page,
      limit: 50
    });
    
    allKnowledgeBases.push(...response.knowledgeBases);
    hasMore = page < response.pagination.totalPages;
    page++;
  }

  return allKnowledgeBases;
}
```

### Error Handling with Retry

```typescript
async function queryWithRetry(client: VantigeClient, corpusId: string, query: string) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      return await client.query(corpusId, { query });
    } catch (error) {
      attempts++;
      
      if (error instanceof VantigeSDKError) {
        // Don't retry auth errors
        if (error.code === VantigeErrorCode.INVALID_API_KEY ||
            error.code === VantigeErrorCode.INSUFFICIENT_PERMISSIONS) {
          throw error;
        }
        
        // Retry with backoff for rate limits
        if (error.code === VantigeErrorCode.RATE_LIMIT_EXCEEDED) {
          const delay = Math.pow(2, attempts) * 1000;
          console.log(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      if (attempts === maxAttempts) {
        throw error;
      }
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# .env
VANTIGE_API_KEY=vk_live_your_api_key_here
VANTIGE_API_URL=https://api.vantige.ai  # Optional custom URL
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const client = new VantigeClient({
  apiKey: process.env.VANTIGE_API_KEY!,
  debug: true  // Logs requests/responses to console
});
```

## API Limits

- **Query Length**: 1-1000 characters
- **Results per Query**: 1-100 (via topK parameter)
- **Page Size**: 1-100 items per page
- **Rate Limits**: Varies by plan (check your dashboard)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- 📧 **Email**: support@vantige.ai
- 📖 **Documentation**: [https://docs.vantige.ai](https://docs.vantige.ai)
- 🐛 **Issues**: [GitHub Issues](https://github.com/vantige-ai/typescript-sdk/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

Made with ❤️ by the Vantige AI team