/**
 * PEG.js Parser Wrapper
 * 
 * Provides a unified API for using PEG.js parsers generated from BNF models.
 * This wrapper handles error processing, type safety, and provides a clean interface
 * for parsing source code into BNF-defined AST structures.
 * 
 * Features:
 * - Type-safe parser API
 * - Friendly error messages with location information
 * - Support for parser options and configuration
 * - Integration with existing BNF model system
 * - Roundtrip compatibility with stringifier functions
 */

import type { BNFModel } from './types.js';

/**
 * Configuration for PEG.js parser compilation
 */
export interface ParserConfig {
  /** Whether to include location information in parsed nodes */
  includeLocation?: boolean;
  /** Whether to include debug information */
  includeDebugInfo?: boolean;
  /** Custom error message formatting */
  errorFormatter?: (error: PegError) => string;
  /** Whether to optimize the generated parser */
  optimize?: boolean;
  /** Cache compiled parsers (default: true) */
  cacheParser?: boolean;
}

/**
 * Options for parsing source code
 */
export interface ParseOptions {
  /** Starting rule name (defaults to model's start rule) */
  startRule?: string;
  /** Include location information in nodes */
  includeLocation?: boolean;
  /** Custom parser actions */
  actions?: Record<string, Function>;
  /** Tracer for debugging */
  tracer?: any;
}

/**
 * PEG.js error information
 */
export interface PegError {
  /** Error message */
  message: string;
  /** Expected tokens/rules at the error location */
  expected: Array<{
    type: string;
    value?: string;
    description?: string;
  }>;
  /** Found token/character at error location */
  found: string | null;
  /** Location where error occurred */
  location: {
    start: { offset: number; line: number; column: number };
    end: { offset: number; line: number; column: number };
  };
}

/**
 * Result of parsing operation
 */
export type ParseResult<T = any> =
  | { success: true; ast: T; warnings?: string[] }
  | { success: false; error: string; location?: PegError['location']; warnings?: string[] };

/**
 * Compiled parser instance
 */
export interface CompiledParser<T = any> {
  /** Parse source code into AST */
  parse(source: string, options?: ParseOptions): ParseResult<T>;
  /** Get parser information */
  getInfo(): {
    grammarName: string;
    startRule: string;
    rules: string[];
  };
  /** Validate that the parser matches the BNF model */
  validate(): boolean;
}

/**
 * Parser compilation result
 */
export type CompilationResult<T = any> =
  | { success: true; parser: CompiledParser<T>; warnings?: string[] }
  | { success: false; error: string; details?: string; warnings?: string[] };

/**
 * PEG.js Parser Manager
 * 
 * Manages compilation and caching of PEG.js parsers from BNF models
 */
export class PegParserManager {
  private parsers: Map<string, CompiledParser> = new Map();
  private config: ParserConfig;

  constructor(config: ParserConfig = {}) {
    this.config = {
      includeLocation: true,
      includeDebugInfo: false,
      optimize: true,
      cacheParser: true,
      ...config,
    };
  }

  /**
   * Compile a BNF model into a PEG.js parser
   */
  async compileParser<T = any>(
    model: BNFModel,
    config?: Partial<ParserConfig>
  ): Promise<CompilationResult<T>> {
    try {
      const mergedConfig = { ...this.config, ...config };
      const cacheKey = this.getCacheKey(model, mergedConfig);

      // Check cache first
      if (mergedConfig.cacheParser && this.parsers.has(cacheKey)) {
        return {
          success: true,
          parser: this.parsers.get(cacheKey)! as CompiledParser<T>,
        };
      }

      // Generate PEG.js grammar
      const { generatePegGrammar } = await import('./peg-generator.js');
      const grammarResult = generatePegGrammar(model, {
        includeLocation: mergedConfig.includeLocation,
        includeDebugInfo: mergedConfig.includeDebugInfo,
      });

      // Compile PEG.js grammar
      const parser = await this.compilePegGrammar<T>(
        grammarResult.grammar,
        model,
        mergedConfig
      );

      // Cache the parser
      if (mergedConfig.cacheParser) {
        this.parsers.set(cacheKey, parser);
      }

      return {
        success: true,
        parser,
        warnings: grammarResult.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: `Parser compilation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Compile PEG.js grammar string into a parser
   */
  private async compilePegGrammar<T>(
    grammar: string,
    model: BNFModel,
    config: ParserConfig
  ): Promise<CompiledParser<T>> {
    // Import PEG.js dynamically
    const peg = await this.loadPegJS();

    // Compile the grammar
    const pegParser = peg.generate(grammar, {
      allowedStartRules: [model.start],
      cache: true,
      optimize: config.optimize ? 'speed' : 'size',
      output: 'parser',
      trace: config.includeDebugInfo,
    });

    // Create wrapped parser
    return new PegParserWrapper<T>(pegParser, model, config);
  }

  /**
   * Load PEG.js library dynamically
   */
  private async loadPegJS(): Promise<any> {
    try {
      // Try to import PEG.js - in a real implementation you would install pegjs package
      // For now, we'll return a mock implementation since pegjs is not installed
      return {
        generate: (grammar: string, options: any) => {
          // Mock PEG.js parser - in a real implementation this would be the actual pegjs
          return {
            parse: (input: string, parseOptions: any) => {
              throw new Error('PEG.js parser not available - this is a mock implementation');
            }
          };
        }
      };
    } catch (error) {
      throw new Error(
        'PEG.js is not available. Please install pegjs package: npm install pegjs'
      );
    }
  }

  /**
   * Generate cache key for a model and config
   */
  private getCacheKey(model: BNFModel, config: ParserConfig): string {
    const modelHash = this.hashModel(model);
    const configHash = this.hashConfig(config);
    return `${modelHash}-${configHash}`;
  }

  /**
   * Create a simple hash of the model for caching
   */
  private hashModel(model: BNFModel): string {
    const str = JSON.stringify({
      name: model.name,
      version: model.version,
      start: model.start,
      nodeCount: Object.keys(model.nodes).length,
      nodeNames: Object.keys(model.nodes).sort(),
    });
    return btoa(str).slice(0, 12);
  }

  /**
   * Create a simple hash of the config for caching
   */
  private hashConfig(config: ParserConfig): string {
    const { errorFormatter, ...hashableConfig } = config;
    const str = JSON.stringify(hashableConfig);
    return btoa(str).slice(0, 8);
  }

  /**
   * Clear the parser cache
   */
  clearCache(): void {
    this.parsers.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.parsers.size,
      keys: Array.from(this.parsers.keys()),
    };
  }
}

/**
 * Wrapper around a compiled PEG.js parser
 */
class PegParserWrapper<T> implements CompiledParser<T> {
  constructor(
    private pegParser: any,
    private model: BNFModel,
    private config: ParserConfig
  ) { }

  parse(source: string, options: ParseOptions = {}): ParseResult<T> {
    try {
      const startRule = options.startRule || this.model.start;

      const pegOptions: any = {
        startRule,
      };

      if (options.includeLocation !== undefined) {
        pegOptions.includeLocation = options.includeLocation;
      } else if (this.config.includeLocation) {
        pegOptions.includeLocation = true;
      }

      if (options.actions) {
        pegOptions.actions = options.actions;
      }

      if (options.tracer) {
        pegOptions.tracer = options.tracer;
      }

      const ast = this.pegParser.parse(source, pegOptions);

      return {
        success: true,
        ast: ast as T,
      };
    } catch (error: any) {
      // Handle PEG.js syntax errors
      if (error.name === 'SyntaxError' && error.location) {
        const formattedError = this.config.errorFormatter
          ? this.config.errorFormatter(error)
          : this.formatError(error);

        return {
          success: false,
          error: formattedError,
          location: error.location,
        };
      }

      // Handle other errors
      return {
        success: false,
        error: `Parse error: ${error.message || String(error)}`,
      };
    }
  }

  getInfo() {
    return {
      grammarName: this.model.name,
      startRule: this.model.start,
      rules: Object.keys(this.model.nodes),
    };
  }

  validate(): boolean {
    try {
      // Basic validation - check if parser has required methods
      return (
        typeof this.pegParser.parse === 'function' &&
        typeof this.model.start === 'string' &&
        this.model.start.length > 0 &&
        this.model.nodes[this.model.start] !== undefined
      );
    } catch {
      return false;
    }
  }

  /**
   * Format PEG.js error into a user-friendly message
   */
  private formatError(error: PegError): string {
    const { location, expected, found } = error;
    const pos = `line ${location.start.line}, column ${location.start.column}`;

    let message = `Parse error at ${pos}`;

    if (found !== null) {
      message += `, found "${found}"`;
    } else {
      message += ', reached end of input';
    }

    if (expected && expected.length > 0) {
      const expectedList = expected
        .map(e => e.description || e.value || e.type)
        .filter(Boolean)
        .slice(0, 3); // Limit to avoid overwhelming the user

      if (expectedList.length === 1) {
        message += `, expected ${expectedList[0]}`;
      } else if (expectedList.length > 1) {
        message += `, expected one of: ${expectedList.join(', ')}`;
      }
    }

    return message;
  }
}

/**
 * Convenience function to create a parser manager
 */
export function createParserManager(config?: ParserConfig): PegParserManager {
  return new PegParserManager(config);
}

/**
 * Convenience function to compile and use a parser in one step
 */
export async function parseWithModel<T = any>(
  model: BNFModel,
  source: string,
  options?: ParseOptions & { parserConfig?: ParserConfig }
): Promise<ParseResult<T>> {
  const { parserConfig, ...parseOptions } = options || {};

  const manager = createParserManager(parserConfig);
  const compilationResult = await manager.compileParser<T>(model);

  if (!compilationResult.success) {
    return {
      success: false,
      error: compilationResult.error,
      warnings: compilationResult.warnings,
    };
  }

  const parseResult = compilationResult.parser.parse(source, parseOptions);

  // Merge warnings from compilation and parsing
  if (compilationResult.warnings || parseResult.warnings) {
    const allWarnings = [
      ...(compilationResult.warnings || []),
      ...(parseResult.warnings || []),
    ];

    if (parseResult.success) {
      return { ...parseResult, warnings: allWarnings };
    } else {
      return { ...parseResult, warnings: allWarnings };
    }
  }

  return parseResult;
}
