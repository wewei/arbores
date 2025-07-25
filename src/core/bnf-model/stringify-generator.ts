/**
 * BNF Model Stringify Generator
 * 
 * Generates recursive code stringification functions from BNF models.
 * This is a key component for CLI tools that need to convert BNF syntax trees
 * back to source code with proper formatting and indentation.
 * 
 * Features:
 * - Generate stringify functions for each node type
 * - Handle Token, Deduction, and Union node output logic
 * - Support configurable formatting and indentation
 * - Generate recursive traversal logic
 * - Output TypeScript functions ready for use
 */

import type { BNFModel, BNFNode, TokenNode, DeductionNode, UnionNode } from './types.js';

/**
 * Configuration for stringify function generation
 */
export interface StringifyConfig {
  /** Function name prefix (default: 'stringify') */
  functionPrefix?: string;
  /** Indentation style (default: '  ') */
  indentStyle?: string;
  /** Whether to include whitespace handling (default: true) */
  includeWhitespace?: boolean;
  /** Whether to include formatting options (default: true) */
  includeFormatting?: boolean;
  /** Custom type mappings for generated nodes */
  typeMapping?: Record<string, string>;
}

/**
 * Options passed to stringify functions at runtime
 */
export interface StringifyOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}

/**
 * Result of stringify generation
 */
export interface StringifyGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated function code */
  code?: string;
  /** Type definitions for the stringify functions */
  types?: string;
  /** Warnings during generation */
  warnings?: string[];
  /** Errors during generation */
  errors?: string[];
}

/**
 * Main generator class for stringify functions
 */
export class StringifyGenerator<M = any> {
  private model: BNFModel<M>;
  private config: StringifyConfig;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(model: BNFModel<M>, config: StringifyConfig = {}) {
    this.model = model;
    this.config = {
      functionPrefix: 'stringify',
      indentStyle: '  ',
      includeWhitespace: true,
      includeFormatting: true,
      ...config,
    };
  }

  /**
   * Generate all stringify functions for the BNF model
   */
  public generate(): StringifyGenerationResult {
    try {
      this.reset();

      // Validate model before generation
      const validationErrors = this.validateModel();
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors,
        };
      }

      // Generate function code
      const code = this.generateStringifyFunctions();
      const types = this.generateTypeDefinitions();

      return {
        success: this.errors.length === 0,
        code,
        types,
        warnings: [...this.warnings],
        errors: [...this.errors],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`Stringify generation failed: ${errorMsg}`],
      };
    }
  }

  /**
   * Reset internal state
   */
  private reset(): void {
    this.warnings.length = 0;
    this.errors.length = 0;
  }

  /**
   * Validate the BNF model before generation
   */
  private validateModel(): string[] {
    const errors: string[] = [];

    if (!this.model.nodes || Object.keys(this.model.nodes).length === 0) {
      errors.push('BNF model must have at least one node');
    }

    if (!this.model.start || !this.model.nodes[this.model.start]) {
      errors.push('BNF model start node must exist in nodes');
    }

    return errors;
  }

  /**
   * Generate the main stringify functions
   */
  private generateStringifyFunctions(): string {
    const parts: string[] = [];

    // Add file header
    parts.push(this.generateFileHeader());
    parts.push('');

    // Add imports and type definitions
    parts.push(this.generateImports());
    parts.push('');

    // Generate main stringify function
    parts.push(this.generateMainStringifyFunction());
    parts.push('');

    // Generate individual node stringify functions
    for (const [nodeName, node] of Object.entries(this.model.nodes)) {
      parts.push(this.generateNodeStringifyFunction(nodeName, node));
      parts.push('');
    }

    // Generate utility functions
    parts.push(this.generateUtilityFunctions());

    return parts.join('\n');
  }

  /**
   * Generate file header with metadata
   */
  private generateFileHeader(): string {
    return `/**
 * Stringify functions for ${this.model.name} grammar
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
  }

  /**
   * Generate import statements
   */
  private generateImports(): string {
    const imports: string[] = [];

    // Import node types
    const nodeTypes = this.getUniqueNodeTypes();
    if (nodeTypes.length > 0) {
      imports.push(`import type { ${nodeTypes.join(', ')} } from './index.js';`);
    }

    return imports.join('\n');
  }

  /**
   * Generate the main stringify function that dispatches to specific node functions
   */
  private generateMainStringifyFunction(): string {
    const functionName = `${this.config.functionPrefix}${this.model.name}`;
    const rootType = this.getNodeTypeName(this.model.start);

    return `/**
 * Main stringify function for ${this.model.name} nodes
 */
export function ${functionName}(node: ${rootType}, options: StringifyOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '${this.config.indentStyle}',
    includeWhitespace: ${this.config.includeWhitespace},
    format: ${this.config.includeFormatting},
    ...options,
  };

  return ${this.config.functionPrefix}Node(node, opts);
}

/**
 * Generic node stringify function that dispatches to specific node types
 */
function ${this.config.functionPrefix}Node(node: any, options: StringifyOptions): string {
  if (!node || typeof node !== 'object' || !node.type) {
    throw new Error('Invalid node: must have a type property');
  }

  switch (node.type) {${this.generateDispatchCases()}
    default:
      throw new Error(\`Unknown node type: \${node.type}\`);
  }
}`;
  }

  /**
   * Generate switch cases for the main dispatch function
   */
  private generateDispatchCases(): string {
    const cases: string[] = [];

    for (const [nodeName, node] of Object.entries(this.model.nodes)) {
      const functionName = `${this.config.functionPrefix}${nodeName}`;
      cases.push(`
    case '${nodeName}':
      return ${functionName}(node, options);`);
    }

    return cases.join('');
  }

  /**
   * Generate stringify function for a specific node
   */
  private generateNodeStringifyFunction(nodeName: string, node: BNFNode): string {
    const functionName = `${this.config.functionPrefix}${nodeName}`;
    const nodeType = this.getNodeTypeName(nodeName);

    switch (node.type) {
      case 'token':
        return this.generateTokenStringifyFunction(functionName, nodeName, nodeType, node as TokenNode);
      case 'deduction':
        return this.generateDeductionStringifyFunction(functionName, nodeName, nodeType, node as DeductionNode);
      case 'union':
        return this.generateUnionStringifyFunction(functionName, nodeName, nodeType, node as UnionNode);
      default:
        this.errors.push(`Unknown node type for ${nodeName}: ${(node as any).type}`);
        return '';
    }
  }

  /**
   * Generate stringify function for a token node
   */
  private generateTokenStringifyFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: TokenNode
  ): string {
    return `/**
 * Stringify ${nodeName} token
 * ${node.description}
 */
function ${functionName}(node: ${nodeType}, options: StringifyOptions): string {
  return node.value;
}`;
  }

  /**
   * Generate stringify function for a deduction node
   */
  private generateDeductionStringifyFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: DeductionNode
  ): string {
    const sequenceCode = this.generateSequenceStringification(node);

    return `/**
 * Stringify ${nodeName} deduction node
 * ${node.description}
 */
function ${functionName}(node: ${nodeType}, options: StringifyOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
${sequenceCode}

  return parts.join('');
}`;
  }

  /**
   * Generate stringify function for a union node
   */
  private generateUnionStringifyFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: UnionNode
  ): string {
    return `/**
 * Stringify ${nodeName} union node
 * ${node.description}
 */
function ${functionName}(node: ${nodeType}, options: StringifyOptions): string {
  // Union nodes delegate to their actual type
  return ${this.config.functionPrefix}Node(node, options);
}`;
  }

  /**
   * Generate sequence stringification logic for deduction nodes
   */
  private generateSequenceStringification(node: DeductionNode): string {
    const parts: string[] = [];

    for (let i = 0; i < node.sequence.length; i++) {
      const element = node.sequence[i];

      if (typeof element === 'string') {
        // String reference to token
        const referencedNode = this.model.nodes[element];
        if (referencedNode?.type === 'token') {
          parts.push(`  // Token reference: ${element}`);
          parts.push(`  parts.push(${this.config.functionPrefix}Node(node, options));`);
        } else {
          this.warnings.push(`String reference "${element}" in sequence should point to a token node`);
        }
      } else if (typeof element === 'object' && element.prop) {
        // Property reference
        const referencedNode = this.model.nodes[element.node];
        if (referencedNode) {
          parts.push(`  // Property: ${element.prop} (${element.node})`);
          parts.push(`  if (node.${element.prop}) {`);
          parts.push(`    parts.push(${this.config.functionPrefix}Node(node.${element.prop}, options));`);
          parts.push(`  }`);

          // Add formatting logic
          if (this.config.includeFormatting && i < node.sequence.length - 1) {
            parts.push(`  if (options.format && options.includeWhitespace) {`);
            parts.push(`    parts.push(' ');`);
            parts.push(`  }`);
          }
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Generate utility functions
   */
  private generateUtilityFunctions(): string {
    return `/**
 * Get indentation string based on options
 */
function getIndentation(options: StringifyOptions): string {
  const level = options.indent || 0;
  const indentStr = options.indentString || '${this.config.indentStyle}';
  return indentStr.repeat(level);
}

/**
 * Add formatting whitespace if enabled
 */
function addWhitespace(parts: string[], options: StringifyOptions, type: 'space' | 'newline' = 'space'): void {
  if (options.format && options.includeWhitespace) {
    if (type === 'newline') {
      parts.push('\\n');
    } else {
      parts.push(' ');
    }
  }
}

/**
 * Format token output with optional spacing
 */
function formatToken(value: string, options: StringifyOptions, context?: string): string {
  if (!options.format || !options.includeWhitespace) {
    return value;
  }

  // Add context-specific formatting rules here
  if (options.formatting?.spaceAround?.includes(value)) {
    return \` \${value} \`;
  }

  return value;
}`;
  }

  /**
   * Generate TypeScript type definitions for the stringify functions
   */
  private generateTypeDefinitions(): string {
    const mainFunctionName = `${this.config.functionPrefix}${this.model.name}`;
    const rootType = this.getNodeTypeName(this.model.start);

    return `/**
 * Type definitions for stringify functions
 */

export interface StringifyOptions {
  /** Current indentation level */
  indent?: number;
  /** Indentation string (spaces or tabs) */
  indentString?: string;
  /** Whether to include whitespace */
  includeWhitespace?: boolean;
  /** Whether to format output */
  format?: boolean;
  /** Custom formatting rules */
  formatting?: {
    /** Insert newlines after certain tokens */
    newlineAfter?: string[];
    /** Insert spaces around certain tokens */
    spaceAround?: string[];
    /** Compact mode (minimal whitespace) */
    compact?: boolean;
  };
}

/**
 * Main stringify function type
 */
export type ${this.capitalize(mainFunctionName)}Function = (
  node: ${rootType}, 
  options?: StringifyOptions
) => string;

/**
 * Export the main stringify function
 */
export declare const ${mainFunctionName}: ${this.capitalize(mainFunctionName)}Function;`;
  }

  // Utility methods

  private getUniqueNodeTypes(): string[] {
    const types = new Set<string>();

    for (const nodeName of Object.keys(this.model.nodes)) {
      types.add(this.getNodeTypeName(nodeName));
    }

    return Array.from(types).sort();
  }

  private getNodeTypeName(nodeName: string): string {
    const node = this.model.nodes[nodeName];
    if (!node) return 'unknown';

    // Use custom type mapping if provided
    if (this.config.typeMapping?.[nodeName]) {
      return this.config.typeMapping[nodeName];
    }

    // Default naming convention based on node type
    switch (node.type) {
      case 'token':
        return `${nodeName}Token`;
      case 'deduction':
        return `${nodeName}Node`;
      case 'union':
        return nodeName;
      default:
        return nodeName;
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Convenience function to generate stringify functions
 */
export function generateStringifyFunctions<M = any>(
  model: BNFModel<M>,
  config: StringifyConfig = {}
): StringifyGenerationResult {
  const generator = new StringifyGenerator(model, config);
  return generator.generate();
}
