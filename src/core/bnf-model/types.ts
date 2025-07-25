/**
 * BNF Model Core Types
 * 
 * This module defines the core TypeScript types for BNF (Backus-Naur Form) 
 * syntax rule modeling. It supports Token, Deduction, and Union rules for 
 * describing programming language syntax structures.
 */

/**
 * Base interface for all BNF nodes with optional metadata support
 */
export interface BaseNode<M = any> {
  /** Human-readable description of the rule */
  description: string;
  /** Optional metadata for extensibility */
  metadata?: M;
}

/**
 * Token pattern definition - can be a literal string or regex pattern
 */
export type TokenPattern =
  | string                    // Literal token like "class", "{"
  | { regex: string };        // Regular expression pattern

/**
 * Token node - represents terminal symbols in the grammar
 */
export interface TokenNode<M = any> extends BaseNode<M> {
  type: 'token';
  pattern: TokenPattern;
}

/**
 * Element in a deduction sequence
 */
export type DeductionElement =
  | string                    // Direct reference to a node name (must be a TokenNode with string pattern)
  | {
    node: string;           // Referenced node name
    prop: string;           // Property name in the parent node
  };

/**
 * Deduction node - represents production rules with sequences
 */
export interface DeductionNode<M = any> extends BaseNode<M> {
  type: 'deduction';
  sequence: DeductionElement[];
  precedence?: number;        // Operator precedence
  associativity?: 'left' | 'right' | 'non-associative';  // Operator associativity
}

/**
 * Union node - represents alternative choices in the grammar
 */
export interface UnionNode<M = any> extends BaseNode<M> {
  type: 'union';
  members: string[];          // List of member node names
}

/**
 * Union type for all possible BNF nodes
 */
export type BNFNode<M = any> = TokenNode<M> | DeductionNode<M> | UnionNode<M>;

/**
 * Complete BNF model definition
 */
export interface BNFModel<M = any> {
  /** Model name for identification */
  name: string;
  /** Version string */
  version: string;
  /** Starting node name for the grammar */
  start: string;
  /** Collection of all node definitions, keyed by node name */
  nodes: Record<string, BNFNode<M>>;
}

/**
 * Result type for BNF parsing operations
 */
export type ParseResult<M> =
  | { success: true; model: BNFModel<M>; warnings?: string[] }
  | { success: false; errors: string[]; warnings?: string[] };

/**
 * Metadata specifically for TypeScript SyntaxKind mapping
 */
export interface TypeScriptMetadata {
  /** TypeScript SyntaxKind enum value */
  syntaxKind: number;
  /** Human-readable SyntaxKind name */
  syntaxKindName: string;
}

/**
 * Type alias for BNF models with TypeScript metadata
 */
export type TypeScriptBNFModel = BNFModel<TypeScriptMetadata>;

/**
 * Helper type to extract the metadata type from a BNF model
 */
export type ExtractMetadata<T> = T extends BNFModel<infer M> ? M : never;

/**
 * Utility type for strongly typed node lookups
 */
export type NodeLookup<M = any> = Record<string, BNFNode<M>>;

/**
 * Options for code generation
 */
export interface GenerationOptions {
  /** Output directory for generated files */
  outputDir: string;
  /** Whether to include debug information */
  includeDebugInfo?: boolean;
  /** Custom file naming strategy */
  fileNaming?: 'kebab-case' | 'camelCase' | 'PascalCase';
  /** Whether to generate TypeScript declaration files */
  generateDeclarations?: boolean;
}

/**
 * Code generation result
 */
export interface GenerationResult {
  /** Generated files as a map of relative paths to content */
  files: Record<string, string>;
  /** Any warnings during generation */
  warnings: string[];
  /** Statistics about generation */
  stats: {
    totalFiles: number;
    totalNodes: number;
    tokenNodes: number;
    deductionNodes: number;
    unionNodes: number;
  };
}
