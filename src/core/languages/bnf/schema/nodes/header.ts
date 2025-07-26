/**
 * Header node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-26T07:58:08.210Z
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