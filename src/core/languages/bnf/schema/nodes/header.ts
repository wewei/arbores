/**
 * Header node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T08:02:29.782Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { NameDeclarationNode } from './name-declaration.js';
import type { VersionDeclarationNode } from './version-declaration.js';
import type { StartDeclarationNode } from './start-declaration.js';

/**
 * Grammar header with metadata
 *
 */
export interface HeaderNode {
  readonly type: 'Header';
  readonly name: NameDeclarationNode;
  readonly version: VersionDeclarationNode;
  readonly start: StartDeclarationNode;
}