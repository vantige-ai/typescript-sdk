import { VantigeClient } from '../src';

// Example usage of the new listAvailableCorpuses method
async function exampleUsage() {
  const client = new VantigeClient({
    apiKey: 'vk_test_your_api_key_here',
    baseUrl: 'https://api.vantige.ai',
  });

  try {
    // List only public corpuses (no external scope)
    console.log('=== Public corpuses only ===');
    const publicCorpuses = await client.listAvailableCorpuses({
      page: 1,
      limit: 10,
      includeArchived: false,
    });
    console.log('Public corpuses:', publicCorpuses);

    // List corpuses for a specific external scope (plus public)
    console.log('\n=== Corpuses for external scope "acme" ===');
    const acmeCorpuses = await client.listAvailableCorpuses({
      external_scope: 'acme',
      page: 1,
      limit: 20,
      includeArchived: false,
    });
    console.log('Acme corpuses:', acmeCorpuses);

    // List all corpuses including archived ones
    console.log('\n=== All corpuses including archived ===');
    const allCorpuses = await client.listAvailableCorpuses({
      external_scope: 'acme',
      includeArchived: true,
    });
    console.log('All corpuses:', allCorpuses);

    // Access the response structure
    console.log('\n=== Response structure ===');
    console.log('Success:', allCorpuses.success);
    console.log('Total corpuses:', allCorpuses.pagination.total);
    console.log('Current page:', allCorpuses.pagination.page);
    console.log('Total pages:', allCorpuses.pagination.totalPages);
    console.log('Applied filters:', allCorpuses.filters);
    
    // Access individual corpus data
    if (allCorpuses.knowledgeBases.length > 0) {
      const firstCorpus = allCorpuses.knowledgeBases[0];
      console.log('\n=== First corpus details ===');
      console.log('ID:', firstCorpus.id);
      console.log('Name:', firstCorpus.name);
      console.log('Description:', firstCorpus.description);
      console.log('Status:', firstCorpus.status);
      console.log('Document count:', firstCorpus.documentCount);
      console.log('Is archived:', firstCorpus.isArchived);
      console.log('External scopes:', firstCorpus.externalScopes);
      console.log('Organization ID:', firstCorpus.organizationId);
      console.log('Created at:', firstCorpus.createdAt);
      console.log('Updated at:', firstCorpus.updatedAt);
      console.log('Datasets:', firstCorpus.datasets);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
exampleUsage().catch(console.error);
