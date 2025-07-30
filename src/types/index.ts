// ===== CONFIGURATION =====
export interface VantigeConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

// ===== KNOWLEDGE BASE TYPES =====
export interface Dataset {
  datasetId: string;
  datasetName: string;
  importStatus: string;
  importedAt: string;
  fileCount: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  documentCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  datasets: Dataset[];
}

export interface ListKnowledgeBasesParams {
  page?: number;
  limit?: number;
  includeArchived?: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListKnowledgeBasesResponse {
  success: boolean;
  knowledgeBases: KnowledgeBase[];
  pagination: PaginationInfo;
}

// ===== QUERY TYPES =====
export interface QueryParams {
  query: string;
  topK?: number;
  includeMetadata?: boolean;
  useGeneration?: boolean;
  fieldMapping?: {
    sourceUri?: string;
    sourceDisplayName?: string;
  };
}

export interface RetrievalResult {
  text: string;
  score: number;
  source_uri: string;
  source_display_name: string;
  [key: string]: any; // Allow for custom field names via fieldMapping
}

export interface QueryResponse {
  success: boolean;
  corpusId: string;
  query: string;
  response?: string; // Only present when useGeneration is true
  retrieval_results: RetrievalResult[];
}

// ===== ERROR TYPES =====
export interface VantigeError {
  code: string;
  message: string;
  details?: any;
}

// ===== API KEY TYPES =====
export interface ApiKeyInfo {
  environment: "test" | "live";
  maskedKey: string;
}

// ===== EXPORT ERROR CLASSES =====
export * from "./errors";
export * from "./validation";
