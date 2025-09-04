// @ts-nocheck disable eslint and typescript errors for this file
import { VantigeClient, createKnowledgeBaseTools, createSimpleKnowledgeBaseTools, createKnowledgeBaseToolsWithOptions } from '../src';
// @ts-ignore import of ai package here is just for demonstration. We don't install it as a dependency into the SDK.
import { tool } from 'ai'; // Vercel AI SDK
import { z } from 'zod';

/**
 * Example showing how to create AI SDK tools from available knowledge bases
 * 
 * This example demonstrates how to create tools compatible with different versions
 * of Vercel's AI SDK:
 * - AI SDK v4: Uses 'parameters' property for input schema
 * - AI SDK v5+: Uses 'inputSchema' property (MCP-aligned)
 * 
 * You can specify the version as the third parameter to any tool creation function.
 */
async function exampleAISDKToolsUsage() {
  // Initialize the Vantige client
  const client = new VantigeClient({
    apiKey: 'vk_test_your_api_key_here',
    baseUrl: 'https://api.vantige.ai',
  });

  try {
    // First, get the available knowledge bases
    console.log('=== Fetching available knowledge bases ===');
    const availableResponse = await client.listAvailableCorpuses({
      external_scope: 'acme', // or omit for public only
      includeArchived: false,
    });

    console.log(`Found ${availableResponse.knowledgeBases.length} available knowledge bases`);
    
    // Log the knowledge bases for reference
    availableResponse.knowledgeBases.forEach(kb => {
      console.log(`- ${kb.name} (${kb.id}): ${kb.description || 'No description'}`);
    });

    // ===== EXAMPLE 1: Simple Tools (Recommended for most use cases) =====
    console.log('\n=== Creating Simple AI SDK Tools ===');
    const simpleTools = createSimpleKnowledgeBaseTools(
      availableResponse.knowledgeBases,
      client,
      'v5' // Default to v5, but you can specify 'v4' for legacy support
    );

    console.log('Simple tools created:', Object.keys(simpleTools));
    
    // Example of how to use with Vercel AI SDK
    const simpleAITools = {
      ...simpleTools,
      // You can add other tools here too
      weather: tool({
        description: 'Get the weather in a location',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => ({
          location,
          temperature: 72 + Math.floor(Math.random() * 21) - 10,
        }),
      }),
    };

    console.log('Combined AI tools:', Object.keys(simpleAITools));

    // ===== EXAMPLE 2: Full-Featured Tools =====
    console.log('\n=== Creating Full-Featured AI SDK Tools ===');
    const fullTools = createKnowledgeBaseTools(
      availableResponse.knowledgeBases,
      client,
      'v5' // Default to v5, but you can specify 'v4' for legacy support
    );

    console.log('Full tools created:', Object.keys(fullTools));

    // ===== EXAMPLE 3: Custom Tools with Options =====
    console.log('\n=== Creating Custom AI SDK Tools ===');
    const customTools = createKnowledgeBaseToolsWithOptions(
      availableResponse.knowledgeBases,
      client,
      {
        simplified: true, // Use simple interface
        version: 'v5', // Specify AI SDK version ('v4' or 'v5')
        keyGenerator: (kb) => `search-${kb.name.toLowerCase().replace(/\s+/g, '-')}`,
        descriptionGenerator: (kb) => `Search the ${kb.name} knowledge base for relevant information. ${kb.description || ''}`,
      }
    );

    console.log('Custom tools created:', Object.keys(customTools));

    // ===== EXAMPLE 4: AI SDK Version Comparison =====
    console.log('\n=== AI SDK Version Comparison ===');
    
    // Create tools for v4 (legacy)
    const v4Tools = createSimpleKnowledgeBaseTools(
      availableResponse.knowledgeBases.slice(0, 1), // Just one for demo
      client,
      'v4'
    );
    
    // Create tools for v5 (current)
    const v5Tools = createSimpleKnowledgeBaseTools(
      availableResponse.knowledgeBases.slice(0, 1), // Just one for demo
      client,
      'v5'
    );
    
    const firstToolKey = Object.keys(v4Tools)[0];
    if (firstToolKey) {
      console.log(`\nTool "${firstToolKey}" structure comparison:`);
      console.log('v4 tool has "parameters":', 'parameters' in v4Tools[firstToolKey]);
      console.log('v4 tool has "inputSchema":', 'inputSchema' in v4Tools[firstToolKey]);
      console.log('v5 tool has "parameters":', 'parameters' in v5Tools[firstToolKey]);
      console.log('v5 tool has "inputSchema":', 'inputSchema' in v5Tools[firstToolKey]);
    }

    // ===== EXAMPLE 5: Testing a Tool =====
    if (availableResponse.knowledgeBases.length > 0) {
      console.log('\n=== Testing a Knowledge Base Tool ===');
      const firstKB = availableResponse.knowledgeBases[0];
      const toolKey = Object.keys(simpleTools)[0];
      const testTool = simpleTools[toolKey];

      if (testTool) {
        console.log(`Testing tool: ${toolKey}`);
        console.log('Tool description:', testTool.description);
        
        // Test the tool execution
        try {
          const result = await testTool.execute({
            query: 'What is the main topic of this knowledge base?'
          });
          
          console.log('Tool execution result:');
          console.log('- Success:', result.success);
          console.log('- Corpus ID:', result.corpusId);
          console.log('- Query:', result.query);
          console.log('- Results count:', result.retrieval_results?.length || 0);
          
          if (result.retrieval_results && result.retrieval_results.length > 0) {
            console.log('- First result preview:', result.retrieval_results[0].text.substring(0, 100) + '...');
          }
        } catch (error) {
          console.error('Tool execution failed:', error);
        }
      }
    }

    // ===== EXAMPLE 6: Integration with Vercel AI SDK =====
    console.log('\n=== Vercel AI SDK Integration Example ===');
    
    // This is how you would use it in a real Vercel AI SDK application
    const aiSDKIntegration = {
      // Your AI model configuration
      model: 'gpt-4', // or whatever model you're using
      
      // Tools configuration
      tools: {
        ...simpleTools, // Add all knowledge base tools
        
        // Add other tools as needed
        weather: tool({
          description: 'Get the weather in a location',
          inputSchema: z.object({
            location: z.string().describe('The location to get the weather for'),
          }),
          execute: async ({ location }) => ({
            location,
            temperature: 72 + Math.floor(Math.random() * 21) - 10,
          }),
        }),
      },
      
      // Tool choice configuration (optional)
      toolChoice: 'auto', // or 'required' or specific tool names
    };

    console.log('AI SDK configuration ready with tools:', Object.keys(aiSDKIntegration.tools));

    // ===== EXAMPLE 7: Dynamic Tool Loading =====
    console.log('\n=== Dynamic Tool Loading Example ===');
    
    // Function to dynamically load tools based on external scope
    async function loadToolsForScope(externalScope: string) {
      const response = await client.listAvailableCorpuses({
        external_scope: externalScope,
        includeArchived: false,
      });
      
      return createSimpleKnowledgeBaseTools(response.knowledgeBases, client);
    }

    // Load tools for different scopes
    const acmeTools = await loadToolsForScope('acme');
    const publicTools = await loadToolsForScope(''); // Empty string for public only
    
    console.log('Acme tools:', Object.keys(acmeTools));
    console.log('Public tools:', Object.keys(publicTools));

  } catch (error) {
    console.error('Error in AI SDK tools example:', error);
  }
}

/**
 * Example showing how to use the tools in a chat completion
 */
async function exampleChatCompletion() {
  const client = new VantigeClient({
    apiKey: 'vk_test_your_api_key_here',
    baseUrl: 'https://api.vantige.ai',
  });

  try {
    // Get available knowledge bases
    const availableResponse = await client.listAvailableCorpuses({
      external_scope: 'acme',
    });

    // Create tools
    const knowledgeBaseTools = createSimpleKnowledgeBaseTools(
      availableResponse.knowledgeBases,
      client
    );

    // This is how you would use it with Vercel AI SDK's generateText or streamText
    const chatConfig = {
      model: 'gpt-4',
      messages: [
        {
          role: 'user' as const,
          content: 'What information do you have about our company policies?'
        }
      ],
      tools: knowledgeBaseTools,
      maxSteps: 5, // Allow multiple tool calls
    };

    console.log('Chat configuration with knowledge base tools:', {
      toolsCount: Object.keys(knowledgeBaseTools).length,
      toolNames: Object.keys(knowledgeBaseTools),
    });

    // In a real application, you would call:
    // const result = await generateText(chatConfig);
    // or
    // const result = await streamText(chatConfig);

  } catch (error) {
    console.error('Error in chat completion example:', error);
  }
}

// Run the examples
if (require.main === module) {
  exampleAISDKToolsUsage()
    .then(() => exampleChatCompletion())
    .catch(console.error);
}
