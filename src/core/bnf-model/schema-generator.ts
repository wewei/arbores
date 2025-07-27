/**
 * BNF Model Code Generator
 * 
 * Generates TypeScript type definitions and related code from BNF models.
 * 
 * Features:
 * - Generate Token type definitions
 * - Generate Deduction node interfaces  
 * - Generate Union type definitions
 * - Manage file structure and dependencies
 * - Generate constant registries
 * - Validate generated code quality
 */

import type { BNFModel, BNFNode, TokenNode, DeductionNode, UnionNode } from './types.js';

/**
 * Configuration for code generation
 */
export interface GenerationConfig {
  /** Base output directory */
  outputDir: string;
  /** Whether to generate separate files for each node type */
  separateFiles?: boolean;
  /** Whether to include JSDoc comments */
  includeDocumentation?: boolean;
  /** Custom naming conventions */
  naming?: {
    /** Suffix for token type names (default: 'Token') */
    tokenSuffix?: string;
    /** Suffix for node interface names (default: 'Node') */
    nodeSuffix?: string;
  };
}

/**
 * Result of code generation
 */
export interface GenerationResult {
  /** Whether generation was successful */
  success: boolean;
  /** Generated file paths and their contents */
  files?: Map<string, string>;
  /** Warnings during generation */
  warnings?: string[];
  /** Errors during generation */
  errors?: string[];
}

/**
 * Information about a generated file
 */
export interface GeneratedFile {
  /** Relative file path */
  path: string;
  /** File contents */
  content: string;
  /** File type for organization */
  type: 'token' | 'node' | 'union' | 'constants' | 'index';
}

/**
 * Main generator class for BNF models
 */
export class BNFCodeGenerator<M = any> {
  private model: BNFModel<M>;
  private config: GenerationConfig;
  private files: Map<string, string> = new Map();
  private warnings: string[] = [];
  private errors: string[] = [];

  constructor(model: BNFModel<M>, config: GenerationConfig) {
    this.model = model;
    this.config = {
      separateFiles: true,
      includeDocumentation: true,
      naming: {
        tokenSuffix: 'Token',
        nodeSuffix: 'Node',
      },
      ...config,
    };
  }

  /**
   * Generate all code files from the BNF model
   */
  public generate(): GenerationResult {
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

      // Generate different types of definitions
      this.generateTokenTypes();
      this.generateDeductionNodes();
      this.generateUnionTypes();
      this.generateConstants();
      this.generateIndexFile();

      // Validate generated code
      const codeValidationErrors = this.validateGeneratedCode();
      if (codeValidationErrors.length > 0) {
        this.errors.push(...codeValidationErrors);
      }

      return {
        success: this.errors.length === 0,
        files: new Map(this.files),
        warnings: [...this.warnings],
        errors: [...this.errors],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        errors: [`Code generation failed: ${errorMsg}`],
      };
    }
  }

  /**
   * Reset internal state for fresh generation
   */
  private reset(): void {
    this.files.clear();
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
   * Generate TypeScript type definitions for token nodes
   */
  private generateTokenTypes(): void {
    const tokenNodes = this.getNodesByType('token') as Array<[string, TokenNode]>;

    if (tokenNodes.length === 0) {
      this.warnings.push('No token nodes found in BNF model');
      return;
    }

    const imports: string[] = [];
    const tokenTypes: string[] = [];
    const tokenUnion: string[] = [];

    // Generate individual token types
    for (const [name, node] of tokenNodes) {
      const typeName = this.getTokenTypeName(name);
      tokenUnion.push(typeName);

      const docs = this.config.includeDocumentation
        ? this.generateJSDoc(node.description, {
          pattern: typeof node.pattern === 'string'
            ? node.pattern
            : `regex: ${node.pattern.regex}`
        })
        : '';

      // Generate token interface
      const tokenInterface = `${docs}${docs ? '\n' : ''}export interface ${typeName} {
  readonly type: '${name}';
  readonly value: string;
${this.generateMetadataProperty(node)}
}`;

      tokenTypes.push(tokenInterface);
    }

    // Generate token union type
    const tokenUnionType = `/**
 * Union of all token types in the ${this.model.name} grammar
 */
export type ${this.model.name}Token = ${tokenUnion.join(' | ')};`;

    // Generate token constants
    const tokenConstants = tokenNodes.map(([name]) =>
      `export const ${name.toUpperCase()}_TOKEN = '${name}' as const;`
    ).join('\n');

    // Combine all token definitions
    const content = [
      this.generateFileHeader('Token type definitions'),
      ...imports,
      '',
      ...tokenTypes,
      '',
      tokenUnionType,
      '',
      '// Token constants',
      tokenConstants,
    ].join('\n');

    this.files.set('token-types.ts', content);
  }

  /**
   * Generate TypeScript interfaces for deduction nodes
   */
  private generateDeductionNodes(): void {
    const deductionNodes = this.getNodesByType('deduction') as Array<[string, DeductionNode]>;

    if (deductionNodes.length === 0) {
      this.warnings.push('No deduction nodes found in BNF model');
      return;
    }

    if (this.config.separateFiles) {
      // Generate separate file for each deduction node
      for (const [name, node] of deductionNodes) {
        this.generateDeductionNodeFile(name, node);
      }
    } else {
      // Generate single file with all deduction nodes
      this.generateAllDeductionNodesFile(deductionNodes);
    }
  }

  /**
   * Generate a separate file for a single deduction node
   */
  private generateDeductionNodeFile(name: string, node: DeductionNode): void {
    const imports = this.generateDeductionNodeImports(node);
    const interface_ = this.generateDeductionNodeInterface(name, node);

    const content = [
      this.generateFileHeader(`${name} node definition`),
      ...imports,
      '',
      interface_,
    ].join('\n');

    this.files.set(`nodes/${name}.ts`, content);
  }

  /**
   * Generate imports needed for a deduction node
   */
  private generateDeductionNodeImports(node: DeductionNode): string[] {
    const unionImports = new Set<string>();
    const tokenImports = new Set<string>();
    const nodeImports = new Set<string>();

    for (const element of node.sequence) {
      // Only process elements that have 'prop' - these become interface properties
      if (typeof element === 'object' && element.prop && element.node) {
        const referencedNode = this.model.nodes[element.node];
        if (referencedNode?.type === 'token') {
          tokenImports.add(this.getTokenTypeName(element.node));
        } else if (referencedNode?.type === 'union') {
          unionImports.add(this.getUnionTypeName(element.node));
        } else if (referencedNode?.type === 'deduction') {
          nodeImports.add(this.getNodeTypeName(element.node));
        }
      }
      // Note: String references and object references without 'prop' 
      // don't become interface properties, so we don't need to import them
    }

    const importLines: string[] = [];

    if (tokenImports.size > 0) {
      importLines.push(`import type { ${Array.from(tokenImports).join(', ')} } from '../token-types.js';`);
    }

    if (unionImports.size > 0) {
      importLines.push(`import type { ${Array.from(unionImports).join(', ')} } from '../union-types.js';`);
    }

    // For deduction nodes, we need to import from sibling files
    for (const nodeType of nodeImports) {
      // Find the original node name for this type
      let originalName = '';
      for (const [name] of this.getNodesByType('deduction')) {
        if (this.getNodeTypeName(name) === nodeType) {
          originalName = name;
          break;
        }
      }
      if (originalName) {
        importLines.push(`import type { ${nodeType} } from './${originalName}.js';`);
      }
    }

    return importLines;
  }

  /**
   * Generate TypeScript interface for a deduction node
   */
  private generateDeductionNodeInterface(name: string, node: DeductionNode): string {
    const typeName = this.getNodeTypeName(name);
    const properties: string[] = [];

    // Add type discriminator
    properties.push(`readonly type: '${name}';`);

    // Generate properties from sequence elements
    for (const element of node.sequence) {
      if (typeof element === 'object' && element.prop) {
        const propType = this.getElementType(element.node);
        properties.push(`readonly ${element.prop}: ${propType};`);
      }
    }

    // Add metadata if present
    if (node.metadata) {
      properties.push(this.generateMetadataProperty(node));
    }

    const docs = this.config.includeDocumentation
      ? this.generateJSDoc(node.description, {
        precedence: node.precedence,
        associativity: node.associativity,
      })
      : '';

    return `${docs}${docs ? '\n' : ''}export interface ${typeName} {
  ${properties.join('\n  ')}
}`;
  }

  /**
   * Generate TypeScript union types for union nodes
   */
  private generateUnionTypes(): void {
    const unionNodes = this.getNodesByType('union') as Array<[string, UnionNode]>;

    if (unionNodes.length === 0) {
      this.warnings.push('No union nodes found in BNF model');
      return;
    }

    const tokenImports = new Set<string>();
    const nodeImports = new Set<string>();
    const unionTypes: string[] = [];

    for (const [name, node] of unionNodes) {
      const typeName = this.getUnionTypeName(name);
      const memberTypes: string[] = [];

      for (const member of node.members) {
        const memberNode = this.model.nodes[member];
        if (memberNode) {
          let memberType: string;
          if (memberNode.type === 'token') {
            memberType = this.getTokenTypeName(member);
            tokenImports.add(memberType);
          } else if (memberNode.type === 'deduction') {
            memberType = this.getNodeTypeName(member);
            nodeImports.add(`nodes/${member}`);
          } else if (memberNode.type === 'union') {
            memberType = this.getUnionTypeName(member);
            // Self-reference or other union - handle carefully
          }

          if (memberType!) {
            memberTypes.push(memberType);
          }
        }
      }

      const docs = this.config.includeDocumentation
        ? this.generateJSDoc(node.description, { members: node.members })
        : '';

      const unionType = `${docs}${docs ? '\n' : ''}export type ${typeName} = ${memberTypes.join(' | ')};`;
      unionTypes.push(unionType);
    }

    // Generate all node types union and root type
    const allNodeTypes: string[] = [];
    const allTokenImports = new Set<string>();
    const allNodeImports = new Set<string>();
    const allUnionImports = new Set<string>();

    for (const [name, node] of Object.entries(this.model.nodes)) {
      if (node.type === 'token') {
        const typeName = this.getTokenTypeName(name);
        allNodeTypes.push(typeName);
        allTokenImports.add(typeName);
      } else if (node.type === 'deduction') {
        const typeName = this.getNodeTypeName(name);
        allNodeTypes.push(typeName);
        allNodeImports.add(`nodes/${name}`);
      } else if (node.type === 'union') {
        const typeName = this.getUnionTypeName(name);
        allNodeTypes.push(typeName);
        // Union types are in the same file, no need to import
      }
    }

    const allNodeUnion = `
/**
 * Union of all node types in the ${this.model.name} grammar
 */
export type ${this.model.name}Node = ${allNodeTypes.join(' | ')};

/**
 * The root node type for the grammar
 */
export type ${this.model.name}Root = ${this.getElementType(this.model.start)};`;

    // Generate import statements
    const importLines: string[] = [];

    // Combine token imports from unions and all nodes
    const combinedTokenImports = new Set([...tokenImports, ...allTokenImports]);
    if (combinedTokenImports.size > 0) {
      importLines.push(`import type { ${Array.from(combinedTokenImports).join(', ')} } from './token-types.js';`);
    }

    // Combine node imports from unions and all nodes
    const combinedNodeImports = new Set([...nodeImports, ...allNodeImports]);
    for (const nodeImport of combinedNodeImports) {
      const nodeName = nodeImport.replace('nodes/', '');
      const nodeTypeName = this.getNodeTypeName(nodeName);
      importLines.push(`import type { ${nodeTypeName} } from './${nodeImport}.js';`);
    }

    const content = [
      this.generateFileHeader('Union type definitions'),
      ...importLines,
      '',
      ...unionTypes,
      allNodeUnion,
    ].join('\n');

    this.files.set('union-types.ts', content);
  }

  /**
   * Generate constants registry file
   */
  private generateConstants(): void {
    const tokenNodes = this.getNodesByType('token') as Array<[string, TokenNode]>;
    const deductionNodes = this.getNodesByType('deduction') as Array<[string, DeductionNode]>;

    const constants: string[] = [];

    // Token pattern registry
    constants.push('/**');
    constants.push(' * Token pattern registry for the grammar');
    constants.push(' */');
    constants.push('export const TOKEN_PATTERNS = {');

    for (const [name, node] of tokenNodes) {
      let pattern: string;
      if (typeof node.pattern === 'string') {
        // Escape single quotes in string literals
        const escapedPattern = node.pattern.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        pattern = `'${escapedPattern}'`;
      } else {
        // Escape single quotes and backslashes in regex patterns
        const escapedRegex = node.pattern.regex.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        pattern = `{ regex: '${escapedRegex}' }`;
      }
      constants.push(`  ${name}: ${pattern},`);
    }
    constants.push('} as const;');
    constants.push('');

    // Precedence registry
    const precedenceNodes = deductionNodes.filter(([, node]) => node.precedence !== undefined);
    if (precedenceNodes.length > 0) {
      constants.push('/**');
      constants.push(' * Precedence registry for deduction rules');
      constants.push(' */');
      constants.push('export const PRECEDENCE = {');

      for (const [name, node] of precedenceNodes) {
        constants.push(`  ${name}: ${node.precedence},`);
      }
      constants.push('} as const;');
      constants.push('');
    }

    // Associativity registry
    const associativityNodes = deductionNodes.filter(([, node]) => node.associativity !== undefined);
    if (associativityNodes.length > 0) {
      constants.push('/**');
      constants.push(' * Associativity registry for deduction rules');
      constants.push(' */');
      constants.push('export const ASSOCIATIVITY = {');

      for (const [name, node] of associativityNodes) {
        constants.push(`  ${name}: '${node.associativity}',`);
      }
      constants.push('} as const;');
    }

    const content = [
      this.generateFileHeader('Constants and registries'),
      ...constants,
    ].join('\n');

    this.files.set('constants.ts', content);
  }

  /**
   * Generate index file that exports everything
   */
  private generateIndexFile(): void {
    const exports: string[] = [];

    // Export token types
    exports.push("export * from './token-types.js';");

    // Export union types
    if (this.getNodesByType('union').length > 0) {
      exports.push("export * from './union-types.js';");
    }

    // Export deduction nodes
    const deductionNodes = this.getNodesByType('deduction');
    if (this.config.separateFiles && deductionNodes.length > 0) {
      for (const [name] of deductionNodes) {
        exports.push(`export * from './nodes/${name}.js';`);
      }
    }

    // Export constants
    exports.push("export * from './constants.js';");

    const content = [
      this.generateFileHeader(`${this.model.name} grammar type definitions`),
      ...exports,
    ].join('\n');

    this.files.set('index.ts', content);
  }

  // Utility methods

  private getNodesByType(type: BNFNode['type']): Array<[string, BNFNode]> {
    return Object.entries(this.model.nodes).filter(([, node]) => node.type === type);
  }

  private getTokenTypeName(name: string): string {
    return `${name}${this.config.naming?.tokenSuffix || 'Token'}`;
  }

  private getNodeTypeName(name: string): string {
    return `${name}${this.config.naming?.nodeSuffix || 'Node'}`;
  }

  private getUnionTypeName(name: string): string {
    return name; // Union types keep their original name
  }

  private getElementType(nodeName: string): string {
    const node = this.model.nodes[nodeName];
    if (!node) return 'unknown';

    switch (node.type) {
      case 'token':
        return this.getTokenTypeName(nodeName);
      case 'deduction':
        return this.getNodeTypeName(nodeName);
      case 'union':
        return this.getUnionTypeName(nodeName);
      default:
        return 'unknown';
    }
  }

  private generateFileHeader(description: string): string {
    return `/**
 * ${description}
 * 
 * Generated from BNF model: ${this.model.name} v${this.model.version}
 * Generation time: ${new Date().toISOString()}
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */`;
  }

  private generateJSDoc(description: string, metadata?: Record<string, any>): string {
    if (!this.config.includeDocumentation) return '';

    const lines = [`/**`, ` * ${description}`];

    if (metadata) {
      lines.push(' *');
      for (const [key, value] of Object.entries(metadata)) {
        if (value !== undefined) {
          lines.push(` * @${key} ${value}`);
        }
      }
    }

    lines.push(' */');
    return lines.join('\n');
  }

  private generateMetadataProperty(node: BNFNode): string {
    if (!node.metadata) return '';

    return `  /** Node metadata */
  readonly metadata?: any;`;
  }

  /**
   * Convert string to kebab-case
   * @deprecated No longer used - file names now match node names exactly
   */
  private kebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  private generateAllDeductionNodesFile(nodes: Array<[string, DeductionNode]>): void {
    // Implementation for single file approach
    // This is left as a future enhancement
    this.warnings.push('Single file mode for deduction nodes not yet implemented');
  }

  /**
   * Validate the generated TypeScript code for syntax and type correctness
   */
  private validateGeneratedCode(): string[] {
    const errors: string[] = [];

    // Basic syntax validation (simplified)
    for (const [path, content] of this.files) {
      try {
        // Check for basic TypeScript syntax issues
        this.validateTypeScriptSyntax(content, path);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Syntax error in ${path}: ${errorMsg}`);
      }
    }

    return errors;
  }

  /**
   * Basic TypeScript syntax validation
   */
  private validateTypeScriptSyntax(content: string, filePath: string): void {
    // Basic checks for common syntax issues
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim() || '';
      const lineNum = i + 1;

      // Check for unmatched braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;

      // Check for missing semicolons in interface properties
      if (line.includes('readonly') && !line.includes(';') && !line.includes('{') && line.length > 0) {
        throw new Error(`Missing semicolon at line ${lineNum}: ${line}`);
      }

      // Check for invalid type syntax
      if (line.includes('export type') && !line.includes('=')) {
        throw new Error(`Invalid type declaration at line ${lineNum}: ${line}`);
      }
    }
  }
}

/**
 * Convenience function to generate code from a BNF model
 */
export function generateCode<M = any>(
  model: BNFModel<M>,
  config: GenerationConfig
): GenerationResult {
  const generator = new BNFCodeGenerator(model, config);
  return generator.generate();
}
