# @vantige-ai/typescript-sdk

## 0.2.3

### Patch Changes

- 7a9fbe8: Adding support for Vercel AI SDK v4. Users can now specify if they are using v4 of the AI SDK which will use the 'parameters' key instead of the newer 'inputSchema' key when creating tools.

## 0.2.2

### Patch Changes

- 5d70483: Switch to shields.io for npm badge

## 0.2.1

### Patch Changes

- 2416fd8: Fix for version badge in README.md

## 0.2.0

### Minor Changes

- 15e51ac: Set up changesets for automated version management and NPM publishing
  - Add @changesets/cli for version management
  - Configure GitHub Actions for automated publishing
  - Add changeset scripts to package.json
  - Update README with proper version badge

  New features:
  - Add client method to list available knowledge bases
  - Add AI SDK tools utility functions in `src/utils/ai-sdk-tools.ts`

  Tests:
  - Added unit testing with Jest
