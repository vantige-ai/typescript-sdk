export enum VantigeErrorCode {
  // Authentication Errors
  INVALID_API_KEY = "INVALID_API_KEY",
  EXPIRED_API_KEY = "EXPIRED_API_KEY",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // Knowledge Base Errors
  KNOWLEDGE_BASE_NOT_FOUND = "KNOWLEDGE_BASE_NOT_FOUND",
  KNOWLEDGE_BASE_ACCESS_DENIED = "KNOWLEDGE_BASE_ACCESS_DENIED",
  KNOWLEDGE_BASE_CREATION_FAILED = "KNOWLEDGE_BASE_CREATION_FAILED",
  KNOWLEDGE_BASE_IMPORT_FAILED = "KNOWLEDGE_BASE_IMPORT_FAILED",

  // Query Errors
  INVALID_QUERY = "INVALID_QUERY",
  QUERY_TOO_LONG = "QUERY_TOO_LONG",
  NO_RESULTS_FOUND = "NO_RESULTS_FOUND",
  QUERY_TIMEOUT = "QUERY_TIMEOUT",

  // Document Errors
  DOCUMENT_NOT_FOUND = "DOCUMENT_NOT_FOUND",
  DOCUMENT_UPLOAD_FAILED = "DOCUMENT_UPLOAD_FAILED",
  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  DOCUMENT_PROCESSING_FAILED = "DOCUMENT_PROCESSING_FAILED",

  // Chat Errors
  CHAT_SESSION_NOT_FOUND = "CHAT_SESSION_NOT_FOUND",
  CHAT_SESSION_EXPIRED = "CHAT_SESSION_EXPIRED",
  INVALID_CHAT_MESSAGE = "INVALID_CHAT_MESSAGE",

  // Network Errors
  NETWORK_ERROR = "NETWORK_ERROR",
  REQUEST_TIMEOUT = "REQUEST_TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Validation Errors
  VALIDATION_ERROR = "VALIDATION_ERROR",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_FIELD_VALUE = "INVALID_FIELD_VALUE",

  // Server Errors
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  SERVICE_TEMPORARILY_UNAVAILABLE = "SERVICE_TEMPORARILY_UNAVAILABLE",

  // SDK Errors
  SDK_INITIALIZATION_ERROR = "SDK_INITIALIZATION_ERROR",
  UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
}

export const ErrorMessages: Record<VantigeErrorCode, string> = {
  [VantigeErrorCode.INVALID_API_KEY]:
    "The provided API key is invalid or malformed",
  [VantigeErrorCode.EXPIRED_API_KEY]: "The API key has expired",
  [VantigeErrorCode.INSUFFICIENT_PERMISSIONS]:
    "Insufficient permissions. This API key may not have the required scope for this operation",
  [VantigeErrorCode.RATE_LIMIT_EXCEEDED]:
    "Rate limit exceeded. Please try again later",

  [VantigeErrorCode.KNOWLEDGE_BASE_NOT_FOUND]: "Knowledge base not found",
  [VantigeErrorCode.KNOWLEDGE_BASE_ACCESS_DENIED]:
    "Access denied to knowledge base",
  [VantigeErrorCode.KNOWLEDGE_BASE_CREATION_FAILED]:
    "Failed to create knowledge base",
  [VantigeErrorCode.KNOWLEDGE_BASE_IMPORT_FAILED]:
    "Failed to import data into knowledge base",

  [VantigeErrorCode.INVALID_QUERY]: "The query is invalid or malformed",
  [VantigeErrorCode.QUERY_TOO_LONG]: "Query exceeds maximum length limit",
  [VantigeErrorCode.NO_RESULTS_FOUND]: "No results found for the query",
  [VantigeErrorCode.QUERY_TIMEOUT]: "Query timed out",

  [VantigeErrorCode.DOCUMENT_NOT_FOUND]: "Document not found",
  [VantigeErrorCode.DOCUMENT_UPLOAD_FAILED]: "Document upload failed",
  [VantigeErrorCode.UNSUPPORTED_FILE_TYPE]: "Unsupported file type",
  [VantigeErrorCode.FILE_TOO_LARGE]: "File size exceeds maximum limit",
  [VantigeErrorCode.DOCUMENT_PROCESSING_FAILED]: "Document processing failed",

  [VantigeErrorCode.CHAT_SESSION_NOT_FOUND]: "Chat session not found",
  [VantigeErrorCode.CHAT_SESSION_EXPIRED]: "Chat session has expired",
  [VantigeErrorCode.INVALID_CHAT_MESSAGE]: "Invalid chat message format",

  [VantigeErrorCode.NETWORK_ERROR]: "Network error occurred",
  [VantigeErrorCode.REQUEST_TIMEOUT]: "Request timed out",
  [VantigeErrorCode.SERVICE_UNAVAILABLE]: "Service is currently unavailable",

  [VantigeErrorCode.VALIDATION_ERROR]: "Validation error",
  [VantigeErrorCode.MISSING_REQUIRED_FIELD]: "Missing required field",
  [VantigeErrorCode.INVALID_FIELD_VALUE]: "Invalid field value",

  [VantigeErrorCode.INTERNAL_SERVER_ERROR]: "Internal server error",
  [VantigeErrorCode.SERVICE_TEMPORARILY_UNAVAILABLE]:
    "Service temporarily unavailable",

  [VantigeErrorCode.SDK_INITIALIZATION_ERROR]: "SDK initialization error",
  [VantigeErrorCode.UNSUPPORTED_OPERATION]: "Unsupported operation",
  [VantigeErrorCode.CONFIGURATION_ERROR]: "Configuration error",
};

export function createVantigeError(
  code: VantigeErrorCode,
  message?: string,
  statusCode?: number,
  details?: any,
  requestId?: string,
): VantigeSDKError {
  return new VantigeSDKError(
    message || ErrorMessages[code],
    code,
    statusCode || 500,
    Array.isArray(details) ? details : details ? [details] : [],
    requestId,
  );
}

export class VantigeSDKError extends Error {
  constructor(
    message: string,
    public code: VantigeErrorCode,
    public statusCode: number = 500,
    public details: any[] = [],
    public requestId?: string,
    public timestamp: string = new Date().toISOString(),
  ) {
    super(message);
    this.name = "VantigeSDKError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VantigeSDKError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      requestId: this.requestId,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}
