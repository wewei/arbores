/**
 * BNF Model Stringifier Generator
 * 
 * Generates recursive code stringification functions from BNF models.
 * This is a key component for CLI tools that need to convert BNF syntax trees
 * back to source code with proper formatting and indentation.
 * 
 * Features:
 * - Generate stringifier functions for each node type
 * - Handle Token, Deduction, and Union node output logic
 * - Support configurable formatting and indentation
 * - Generate recursive traversal logic
 * - Output TypeScript functions ready for use
 */

import type { BNFModel, BNFNode, TokenNode, DeductionNode, UnionNode } from './types.js';

/**
 * Configuration for stringifier function generation
 */
export interface StringifierConfig {
  /** Function name prefix (default: 'stringifier') */
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
 * Options passed to stringifier functions at runtime
 */
export interface StringifierOptions {
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
 * Result of stringifier generation
 */
export interface StringifierGenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated file paths and their contents */
  files?: Map<string, string>;
  /** Deprecated: Combined code for backward compatibility */
  code?: string;
  /** Deprecated: Type definitions for backward compatibility */
  types?: string;
  /** Warnings during generation */
  warnings?: string[];
  /** Errors during generation */
  errors?: string[];
}

/**
 * Main generator class for stringifier functions
 */
export class StringifierGenerator {
  private model: BNFModel;
  private config: StringifierConfig;
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(model: BNFModel, config: StringifierConfig = {}) {
    this.model = model;
    this.config = {
      functionPrefix: 'stringifier',
      indentStyle: '  ',
      includeWhitespace: true,
      includeFormatting: true,
      ...config,
    };
  }

  /**
   * Generate all stringifier functions for the BNF model
   */
  public generate(): StringifierGenerationResult {
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

      // Generate files
      const files = this.generateStringifierFiles();

      // For backward compatibility, merge all files into a single code string
      const code = this.mergeFilesForBackwardCompatibility(files);
      const types = this.generateTypeDefinitions();

      return {
        success: this.errors.length === 0,
        files,
        code,
        types,
        warnings: [...this.warnings],
        errors: [...this.errors],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`stringifier generation failed: ${errorMsg}`],
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
   * Generate the main stringifier functions
   */
  private generateStringifierFunctions(): string {
    const parts: string[] = [];

    // Add file header
    parts.push(this.generateFileHeader());
    parts.push('');

    // Add type definitions at the top
    parts.push(this.generateStringifierOptionsType());
    parts.push('');

    // Add main function type
    parts.push(this.generateMainFunctionType());
    parts.push('');

    // Add imports
    parts.push(this.generateImports());
    parts.push('');

    // Generate main stringifier function
    parts.push(this.generateMainstringifierFunction());
    parts.push('');

    // Generate individual node stringifier functions
    for (const [nodeName, node] of Object.entries(this.model.nodes)) {
      parts.push(this.generateNodestringifierFunction(nodeName, node));
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
 * stringifier functions for ${this.model.name} grammar
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
      imports.push(`import type { ${nodeTypes.join(', ')} } from '../schema/index.js';`);
    }

    return imports.join('\n');
  }

  /**
   * Generate StringifierOptions type definition for the output file
   */
  private generateStringifierOptionsType(): string {
    return `/**
 * Options for stringifier functions
 */
export interface StringifierOptions {
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
}`;
  }

  /**
   * Generate the main function type definition
   */
  private generateMainFunctionType(): string {
    const mainFunctionName = `${this.config.functionPrefix}${this.model.name}`;
    const rootType = this.getNodeTypeName(this.model.start);

    return `/**
 * Main stringifier function type
 */
export type ${this.capitalize(mainFunctionName)}Function = (
  node: ${rootType}, 
  options?: StringifierOptions
) => string;`;
  }

  /**
   * Generate the main stringifier function that dispatches to specific node functions
   */
  private generateMainstringifierFunction(): string {
    const functionName = `${this.config.functionPrefix}${this.model.name}`;
    const rootType = this.getNodeTypeName(this.model.start);

    return `/**
 * Main stringifier function for ${this.model.name} nodes
 */
export function ${functionName}(node: ${rootType}, options: StringifierOptions = {}): string {
  const opts = {
    indent: 0,
    indentString: '${this.config.indentStyle}',
    includeWhitespace: ${this.config.includeWhitespace},
    format: ${this.config.includeFormatting},
    ...options,
  };

  return stringifyNode(node, opts);
}

/**
 * Generic node stringifier function that dispatches to specific node types
 */
export function stringifyNode(node: any, options: StringifierOptions): string {
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
   * Generate stringifier function for a specific node
   */
  private generateNodestringifierFunction(nodeName: string, node: BNFNode): string {
    const functionName = `${this.config.functionPrefix}${nodeName}`;
    const nodeType = this.getNodeTypeName(nodeName);

    switch (node.type) {
      case 'token':
        return this.generateTokenstringifierFunction(functionName, nodeName, nodeType, node as TokenNode);
      case 'deduction':
        return this.generateDeductionstringifierFunction(functionName, nodeName, nodeType, node as DeductionNode);
      case 'union':
        return this.generateUnionstringifierFunction(functionName, nodeName, nodeType, node as UnionNode);
      default:
        this.errors.push(`Unknown node type for ${nodeName}: ${(node as any).type}`);
        return '';
    }
  }

  /**
   * Generate stringifier function for a token node
   */
  private generateTokenstringifierFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: TokenNode
  ): string {
    return `/**
 * stringifier ${nodeName} token
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  return node.value;
}`;
  }

  /**
   * Generate stringifier function for a deduction node
   */
  private generateDeductionstringifierFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: DeductionNode
  ): string {
    const sequenceCode = this.generateSequenceStringification(node);

    return `/**
 * stringifier ${nodeName} deduction node
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  const parts: string[] = [];
  const indent = getIndentation(options);
  
${sequenceCode}

  return parts.join('');
}`;
  }

  /**
   * Generate stringifier function for a union node
   */
  private generateUnionstringifierFunction(
    functionName: string,
    nodeName: string,
    nodeType: string,
    node: UnionNode
  ): string {
    return `/**
 * stringifier ${nodeName} union node
 * ${node.description}
 */
export function ${functionName}(node: ${nodeType}, options: StringifierOptions): string {
  // Union nodes delegate to their actual type
  return stringifyNode(node, options);
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
          parts.push(`  parts.push(stringifyNode(node, options));`);
        } else {
          this.warnings.push(`String reference "${element}" in sequence should point to a token node`);
        }
      } else if (typeof element === 'object' && element.prop) {
        // Property reference
        const referencedNode = this.model.nodes[element.node];
        if (referencedNode) {
          parts.push(`  // Property: ${element.prop} (${element.node})`);
          parts.push(`  if (node.${element.prop}) {`);
          parts.push(`    parts.push(stringifyNode(node.${element.prop}, options));`);
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
export function getIndentation(options: StringifierOptions): string {
  const level = options.indent || 0;
  const indentStr = options.indentString || '  ';
  return indentStr.repeat(level);
}

/**
 * Add formatting whitespace if enabled
 */
export function addWhitespace(parts: string[], options: StringifierOptions, type: 'space' | 'newline' = 'space'): void {
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
export function formatToken(value: string, options: StringifierOptions, context?: string): string {
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
   * Merge multiple files into a single code string for backward compatibility
   */
  private mergeFilesForBackwardCompatibility(files: Map<string, string>): string {
    const parts: string[] = [];

    // Add main index file content (which contains the main function and utilities)
    const indexFile = files.get('index.ts');
    if (indexFile) {
      parts.push(indexFile);
    }

    return parts.join('\n');
  }

  /**
   * Generate type definitions (for backward compatibility)
   */
  private generateTypeDefinitions(): string {
    return `// Type definitions are now included in the generated code files`;
  }

  /**
   * Generate stringifier files for all nodes
   */
  private generateStringifierFiles(): Map<string, string> {
    const files = new Map<string, string>();

    // Generate shared types file
    const typesContent = this.generateSharedTypesFile();
    files.set('types.ts', typesContent);

    // Generate utility functions file
    const utilsContent = this.generateUtilityFunctionsFile();
    files.set('utils.ts', utilsContent);

    // Generate individual node stringifier files in nodes/ directory
    for (const [nodeName, node] of Object.entries(this.model.nodes)) {
      const fileName = `nodes/${nodeName}.ts`;
      const content = this.generateNodeStringifierFile(nodeName, node);
      files.set(fileName, content);
    }

    // Generate main index file
    const indexContent = this.generateStringifierIndexFile();
    files.set('index.ts', indexContent);

    return files;
  }

  /**
   * Generate stringifier file for a single node
   */
  private generateNodeStringifierFile(nodeName: string, node: BNFNode): string {
    const parts: string[] = [];

    // Add file header
    parts.push(`/**
 * Stringifier for ${nodeName} node
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
    parts.push('');

    // Add imports - only import the specific node type and any referenced types
    const requiredTypes = this.getRequiredTypesForNode(nodeName, node);
    if (requiredTypes.length > 0) {
      parts.push(`import type { ${requiredTypes.join(', ')} } from '../../schema/index.js';`);
    }
    
    parts.push(`import type { StringifierOptions } from '../types.js';`);
    
    // Import utility functions and stringifyNode if needed
    if (node.type === 'deduction' || node.type === 'union') {
      parts.push(`import { stringifyNode } from '../index.js';`);
    }
    
    // Import utility functions if this is a deduction node
    if (node.type === 'deduction') {
      parts.push(`import { getIndentation, addWhitespace, formatToken } from '../utils.js';`);
    }
    
    parts.push('');

    // Generate the node stringifier function
    parts.push(this.generateNodestringifierFunction(nodeName, node));

    return parts.join('\n');
  }

  /**
   * Generate the main index file that exports all stringifiers
   */
  private generateStringifierIndexFile(): string {
    const parts: string[] = [];

    // Add file header
    parts.push(`/**
 * Stringifier functions for ${this.model.name} grammar
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
    parts.push('');

    // Add imports for schema types
    parts.push(this.generateImports());
    parts.push('');
    
    // Import StringifierOptions type
    parts.push(`import type { StringifierOptions } from './types.js';`);
    parts.push('');

    // Add imports for all node stringifiers from nodes/ directory
    const nodeNames = Object.keys(this.model.nodes);
    for (const nodeName of nodeNames) {
      const functionName = `${this.config.functionPrefix}${nodeName}`;
      parts.push(`import { ${functionName} } from './nodes/${nodeName}.js';`);
    }
    parts.push('');

    // Re-export all stringifier functions
    for (const nodeName of nodeNames) {
      const functionName = `${this.config.functionPrefix}${nodeName}`;
      parts.push(`export { ${functionName} };`);
    }
    parts.push('');

    // Re-export types and utilities
    parts.push(`export type { StringifierOptions } from './types.js';`);
    parts.push(`export { getIndentation, addWhitespace, formatToken } from './utils.js';`);
    parts.push('');

    // Add main stringifier function type
    parts.push(this.generateMainFunctionType());
    parts.push('');

    // Generate main dispatch stringifier function
    parts.push(this.generateMainstringifierFunction());

    return parts.join('\n');
  }

  /**
   * Generate imports for individual node files
   */
  private generateNodeFileImports(): string {
    return this.generateImports();
  }

  /**
   * Generate shared types file
   */
  private generateSharedTypesFile(): string {
    const parts: string[] = [];

    parts.push(`/**
 * Shared types for ${this.model.name} stringifier
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
    parts.push('');

    parts.push(this.generateStringifierOptionsType());

    return parts.join('\n');
  }

  /**
   * Generate utility functions file
   */
  private generateUtilityFunctionsFile(): string {
    const parts: string[] = [];

    parts.push(`/**
 * Utility functions for ${this.model.name} stringifier
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`);
    parts.push('');

    parts.push(`import type { StringifierOptions } from './types.js';`);
    parts.push('');

    parts.push(this.generateUtilityFunctions());

    return parts.join('\n');
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

  /**
   * Get the types required for a specific node
   */
  private getRequiredTypesForNode(nodeName: string, node: BNFNode): string[] {
    const types = new Set<string>();
    
    // Always include the node's own type
    types.add(this.getNodeTypeName(nodeName));

    // For deduction nodes, include types of referenced properties
    if (node.type === 'deduction') {
      const deductionNode = node as DeductionNode;
      for (const element of deductionNode.sequence) {
        if (typeof element === 'object' && element.prop) {
          const referencedNodeType = this.getNodeTypeName(element.node);
          types.add(referencedNodeType);
        }
      }
    }

    return Array.from(types).sort();
  }
}

/**
 * Convenience function to generate stringifier functions
 */
export function generateStringifierFunctions(
  model: BNFModel,
  config: StringifierConfig = {}
): StringifierGenerationResult {
  const generator = new StringifierGenerator(model, config);
  return generator.generate();
}
