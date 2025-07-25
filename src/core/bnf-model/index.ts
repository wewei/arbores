/**
 * BNF Model System - Main Entry Point
 * 
 * This module provides a complete toolkit for working with BNF (Backus-Naur Form) 
 * grammar definitions, including parsing, validation, code generation, and 
 * roundtrip conversion capabilities.
 * 
 * Features:
 * - Parse and validate BNF models from YAML/JSON
 * - Generate TypeScript types from BNF models
 * - Generate stringifier functions for AST-to-code conversion
 * - Generate PEG.js parsers for code-to-AST conversion
 * - Complete roundtrip conversion support
 */

// Core types
export type {
  BNFModel,
  BNFNode,
  TokenNode,
  DeductionNode,
  UnionNode,
  DeductionElement,
  TokenPattern,
  ParseResult,
  TypeScriptMetadata,
  TypeScriptBNFModel,
  GenerationOptions,
  GenerationResult,
  NodeLookup,
  ExtractMetadata
} from './types.js';

// BNF Model Parser
export {
  parseBNF,
  findUnreachableNodes
} from './bnf-parser.js';

// Code Generation
export {
  BNFCodeGenerator,
  generateCode,
  type GenerationConfig,
  type GenerationResult as CodeGenerationResult
} from './generator.js';

// Stringifier Generation  
export {
  StringifierGenerator,
  generateStringifierFunctions,
  type StringifierConfig,
  type StringifierOptions
} from './stringifier-generator.js';

// PEG.js Parser Generation
export {
  PegGenerator,
  generatePegGrammar,
  PegGenerationError,
  type PegGeneratorOptions,
  type PegGenerationResult,
  type LeftRecursionInfo
} from './peg-generator.js';

// PEG.js Parser Wrapper
export {
  PegParserManager,
  createParserManager,
  parseWithModel,
  type ParserConfig,
  type ParseOptions,
  type PegError,
  type ParseResult as ParserParseResult,
  type CompiledParser,
  type CompilationResult
} from './parser-wrapper.js';

// Convenience re-exports for common use cases
export type {
  // Most commonly used types
  BNFModel as Grammar,
  TokenNode as Token,
  DeductionNode as Rule,
  UnionNode as Union
} from './types.js';
