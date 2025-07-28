/**
 * Header node definition
 * 
 * Generated from BNF model: BNFGrammar v1.0.0
 * Generation time: 2025-07-28T02:32:27.902Z
 * 
 * @fileoverview This file is auto-generated. Do not edit manually.
 */
import type { NameDeclarationNode } from './NameDeclaration.js';
import type { VersionDeclarationNode } from './VersionDeclaration.js';
import type { StartDeclarationNode } from './StartDeclaration.js';

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