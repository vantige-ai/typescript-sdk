import { VantigeClient } from '@vantige-ai/typescript-sdk';

async function main() {
  // Initialize the client with your API key
  const client = new VantigeClient({
    apiKey: 'vk_test_your_api_key_here'
  });

  // List all knowledge bases
  const response = await client.listKnowledgeBases();
  console.log(`Found ${response.pagination.total} knowledge bases:`);
  
  response.knowledgeBases.forEach(kb => {
    console.log(`- ${kb.name} (${kb.id})`);
  });

  // Query a specific knowledge base
  if (response.knowledgeBases.length > 0) {
    const firstKb = response.knowledgeBases[0];
    
    // TypeScript should infer firstKb is defined here, but let's be explicit
    if (!firstKb) {
      console.log('No knowledge bases found');
      return;
    }
    
    const queryResult = await client.query(firstKb.id, {
      query: 'What are the main features?',
      topK: 5,
      useGeneration: true
    });

    console.log('\nQuery results:');
    if (queryResult.response) {
      console.log('AI Response:', queryResult.response);
    }
    console.log(`Found ${queryResult.retrieval_results.length} documents`);
  }
}

main().catch(console.error);