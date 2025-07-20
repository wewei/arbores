/**
 * CLI error handling utilities
 */

import { ArborError, type ErrorCode } from '../../src/api/types';
import { formatError, formatWarning } from './format';

/**
 * Handle API errors in CLI context
 */
export function handleAPIError(error: ArborError): never {
  console.error(formatError(error));
  process.exit(getExitCode(error.code));
}

/**
 * Handle general errors in CLI context
 */
export function handleError(error: Error): never {
  console.error(formatError(error));
  process.exit(1);
}

/**
 * Handle validation errors
 */
export function handleValidationError(message: string): never {
  console.error(formatError(new Error(message)));
  process.exit(1);
}

/**
 * Display warning message
 */
export function showWarning(message: string): void {
  console.warn(formatWarning(message));
}

/**
 * Map error codes to exit codes
 */
function getExitCode(errorCode: ErrorCode): number {
  switch (errorCode) {
    case 'PARSE_ERROR':
      return 2;
    case 'NODE_NOT_FOUND':
      return 3;
    case 'INVALID_JSON':
      return 4;
    case 'INVALID_AST_STRUCTURE':
    case 'INVALID_AST':
      return 5;
    case 'INVALID_ARGUMENT':
      return 6;
    case 'STRINGIFY_FAILED':
      return 7;
    case 'INVALID_VERSION':
      return 8;
    default:
      return 1;
  }
}

/**
 * Validate required file argument
 */
export function validateFileArgument(filePath: string | undefined, argumentName: string): string {
  if (!filePath) {
    handleValidationError(`${argumentName} is required`);
  }
  return filePath;
}

/**
 * Validate output format
 */
export function validateOutputFormat(format: string | undefined): 'json' | 'yaml' | 'compact' {
  if (!format) {
    return 'json';
  }
  
  if (['json', 'yaml', 'compact'].includes(format)) {
    return format as 'json' | 'yaml' | 'compact';
  }
  
  handleValidationError(`Invalid format: ${format}. Supported formats: json, yaml, compact`);
}
