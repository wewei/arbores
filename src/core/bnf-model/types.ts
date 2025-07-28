/**
 * BNF Model Core Types
 * 
 * This module defines the core TypeScript types for BNF (Backus-Naur Form) 
 * syntax rule modeling. It supports Token, Deduction, and Union rules for 
 * describing programming language syntax structures.
 */

/**
 * Base interface for all BNF nodes
 */
export interface BaseNode {
  /** Human-readable description of the rule */
  description: string;
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
export interface TokenNode extends BaseNode {
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
export interface DeductionNode extends BaseNode {
  type: 'deduction';
  sequence: DeductionElement[];
  precedence?: number;        // Operator precedence
  associativity?: 'left' | 'right' | 'non-associative';  // Operator associativity
}

/**
 * Union node - represents alternative choices in the grammar
 */
export interface UnionNode extends BaseNode {
  type: 'union';
  members: string[];          // List of member node names
}

/**
 * List node - represents a sequence of items separated by an optional specific separator
 */
export interface ListNode extends BaseNode {
  type: 'list';
  item: string;     // Name of the item node type
  separator?: {
    node: string;   // Name of the separator node type
    last:
    | 'required'  // The separator after the last item is required
    | 'optional'  // The separator after the last item is optional
    | 'none';     // The last item must not have a separator

  };
}

/**
 * Union type for all possible BNF nodes
 */
export type BNFNode = TokenNode | DeductionNode | UnionNode | ListNode;

/**
 * Complete BNF model definition
 */
export interface BNFModel {
  /** Model name for identification */
  name: string;
  /** Version string */
  version: string;
  /** Starting node name for the grammar */
  start: string;
  /** Collection of all node definitions, keyed by node name */
  nodes: Record<string, BNFNode>;
}

/**
 * Result type for BNF parsing operations
 */
export type ParseResult =
  | { success: true; model: BNFModel; warnings?: string[] }
  | { success: false; errors: string[]; warnings?: string[] };

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
    listNodes: number;
  };
}
