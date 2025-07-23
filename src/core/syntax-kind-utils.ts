/**
 * SyntaxKind utilities and query functions
 * 
 * This file provides convenient access to SyntaxKind data loaded from YAML.
 * It includes lookup functions, group analysis, and categorization helpers.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as yaml from 'js-yaml';

// Types for the YAML data structure
export interface SyntaxKindData {
  syntax_kinds: Array<[number, string]>;
  syntax_kind_markers: Array<[number, string]>;
  syntax_kind_aliases: Record<string, number>;
  metadata: {
    version: string;
    generated_at: string;
    total_kinds: number;
    total_markers: number;
    total_aliases: number;
    source: string;
    generator: string;
  };
}

// Lazy-loaded data
let _data: SyntaxKindData | null = null;

/**
 * Load SyntaxKind data from YAML file
 */
function loadData(): SyntaxKindData {
  if (_data === null) {
    const yamlPath = resolve(__dirname, 'syntax-kind-data.yaml');
    const yamlContent = readFileSync(yamlPath, 'utf8');
    _data = yaml.load(yamlContent) as SyntaxKindData;
  }
  return _data;
}

// Cached lookups for performance
let _kindToName: Map<number, string> | null = null;
let _nameToKind: Map<string, number> | null = null;
let _aliasToKind: Map<string, number> | null = null;

/**
 * Get the lookup maps, creating them if needed
 */
function getLookupMaps() {
  if (_kindToName === null) {
    const data = loadData();
    
    _kindToName = new Map();
    _nameToKind = new Map();
    
    // Add actual syntax kinds first (higher priority)
    for (const [kind, name] of data.syntax_kinds) {
      _kindToName.set(kind, name);
      _nameToKind.set(name, kind);
    }
    
    // Add markers only if not already present (lower priority)
    for (const [kind, name] of data.syntax_kind_markers) {
      if (!_kindToName.has(kind)) {
        _kindToName.set(kind, name);
      }
      if (!_nameToKind.has(name)) {
        _nameToKind.set(name, kind);
      }
    }
    
    // Add aliases
    _aliasToKind = new Map(Object.entries(data.syntax_kind_aliases).map(([name, kind]) => [name, kind]));
    for (const [name, kind] of _aliasToKind) {
      if (!_nameToKind.has(name)) {
        _nameToKind.set(name, kind);
      }
    }
  }
  
  return { kindToName: _kindToName!, nameToKind: _nameToKind!, aliasToKind: _aliasToKind! };
}

/**
 * Get a human-readable name for a SyntaxKind enum value.
 */
export function getSyntaxKindName(kind: number): string {
  const { kindToName } = getLookupMaps();
  return kindToName.get(kind) || 'Unknown';
}

/**
 * Get the numeric value for a SyntaxKind name.
 */
export function getSyntaxKindValue(name: string): number | undefined {
  const { nameToKind } = getLookupMaps();
  return nameToKind.get(name);
}

/**
 * Check if a name is an alias (deprecated or alternative name).
 */
export function isSyntaxKindAlias(name: string): boolean {
  const { aliasToKind } = getLookupMaps();
  return aliasToKind.has(name);
}

/**
 * Get all actual SyntaxKind values (excluding markers and aliases).
 */
export function getAllSyntaxKinds(): Array<[number, string]> {
  const data = loadData();
  return [...data.syntax_kinds];
}

/**
 * Get all marker values (FirstXxx, LastXxx, Count, Unknown).
 */
export function getAllSyntaxKindMarkers(): Array<[number, string]> {
  const data = loadData();
  return [...data.syntax_kind_markers];
}

/**
 * Get all aliases and their canonical values.
 */
export function getAllSyntaxKindAliases(): Record<string, number> {
  const data = loadData();
  return { ...data.syntax_kind_aliases };
}

/**
 * Get generation metadata.
 */
export function getSyntaxKindMetadata() {
  const data = loadData();
  return { ...data.metadata };
}

// Predefined groups based on TypeScript's ranges
const SYNTAX_KIND_GROUPS = {
  // Tokens
  TriviaTokens: { start: 2, end: 7, description: 'Comments and whitespace tokens' },
  LiteralTokens: { start: 9, end: 15, description: 'Literal value tokens' },
  TemplateTokens: { start: 15, end: 18, description: 'Template string tokens' },
  PunctuationTokens: { start: 19, end: 79, description: 'Punctuation and operator tokens' },
  BinaryOperators: { start: 30, end: 79, description: 'Binary operator tokens' },
  AssignmentOperators: { start: 64, end: 79, description: 'Assignment operator tokens' },
  
  // Keywords
  ReservedWords: { start: 83, end: 118, description: 'Reserved language keywords' },
  FutureReservedWords: { start: 119, end: 127, description: 'Future reserved words' },
  ContextualKeywords: { start: 128, end: 165, description: 'Context-dependent keywords' },
  
  // AST Nodes
  TypeNodes: { start: 182, end: 205, description: 'TypeScript type system nodes' },
  Statements: { start: 243, end: 259, description: 'Executable statement nodes' },
  JSDocNodes: { start: 309, end: 351, description: 'JSDoc documentation nodes' },
  JSDocTags: { start: 327, end: 351, description: 'JSDoc tag nodes' },
} as const;

export type SyntaxKindGroupName = keyof typeof SYNTAX_KIND_GROUPS;

/**
 * Get the group name for a SyntaxKind value.
 */
export function getSyntaxKindGroup(kind: number): SyntaxKindGroupName | undefined {
  for (const [groupName, groupInfo] of Object.entries(SYNTAX_KIND_GROUPS)) {
    if (kind >= groupInfo.start && kind <= groupInfo.end) {
      return groupName as SyntaxKindGroupName;
    }
  }
  return undefined;
}

/**
 * Check if a SyntaxKind belongs to a specific group.
 */
export function isSyntaxKindInGroup(kind: number, groupName: SyntaxKindGroupName): boolean {
  const group = SYNTAX_KIND_GROUPS[groupName];
  if (!group) return false;
  return kind >= group.start && kind <= group.end;
}

/**
 * Get all SyntaxKind values in a specific group.
 */
export function getSyntaxKindsInGroup(groupName: SyntaxKindGroupName): Array<[number, string]> {
  const group = SYNTAX_KIND_GROUPS[groupName];
  if (!group) return [];
  
  const data = loadData();
  return data.syntax_kinds.filter(([kind]) => kind >= group.start && kind <= group.end);
}

/**
 * Get group information.
 */
export function getSyntaxKindGroupInfo(groupName: SyntaxKindGroupName) {
  return SYNTAX_KIND_GROUPS[groupName] ? { ...SYNTAX_KIND_GROUPS[groupName] } : undefined;
}

/**
 * Get all available group names.
 */
export function getAllSyntaxKindGroupNames(): SyntaxKindGroupName[] {
  return Object.keys(SYNTAX_KIND_GROUPS) as SyntaxKindGroupName[];
}

/**
 * Check if a SyntaxKind is a token (vs an AST node).
 */
export function isSyntaxKindToken(kind: number): boolean {
  const data = loadData();
  const aliases = data.syntax_kind_aliases;
  return kind >= (aliases.FirstToken || 0) && kind <= (aliases.LastToken || 165);
}

/**
 * Check if a SyntaxKind is an AST node (vs a token).
 */
export function isSyntaxKindNode(kind: number): boolean {
  const data = loadData();
  const aliases = data.syntax_kind_aliases;
  return kind >= (aliases.FirstNode || 166);
}

/**
 * Check if a SyntaxKind is a statement.
 */
export function isSyntaxKindStatement(kind: number): boolean {
  return isSyntaxKindInGroup(kind, 'Statements');
}

/**
 * Check if a SyntaxKind is a type node.
 */
export function isSyntaxKindTypeNode(kind: number): boolean {
  return isSyntaxKindInGroup(kind, 'TypeNodes');
}

/**
 * Check if a SyntaxKind is a JSDoc node.
 */
export function isSyntaxKindJSDocNode(kind: number): boolean {
  return isSyntaxKindInGroup(kind, 'JSDocNodes');
}

/**
 * Create a Record mapping SyntaxKind values to names for convenience.
 */
export function createSyntaxKindNamesRecord(): Record<number, string> {
  const data = loadData();
  const record: Record<number, string> = {};
  
  // Add actual kinds
  for (const [kind, name] of data.syntax_kinds) {
    record[kind] = name;
  }
  
  // Add markers
  for (const [kind, name] of data.syntax_kind_markers) {
    record[kind] = name;
  }
  
  return record;
}

/**
 * Get statistics about SyntaxKind distribution.
 */
export function getSyntaxKindStatistics() {
  const data = loadData();
  const groupStats: Record<string, number> = {};
  
  for (const groupName of getAllSyntaxKindGroupNames()) {
    const kindsInGroup = getSyntaxKindsInGroup(groupName);
    groupStats[groupName] = kindsInGroup.length;
  }
  
  return {
    total: data.metadata.total_kinds,
    markers: data.metadata.total_markers,
    aliases: data.metadata.total_aliases,
    groups: groupStats,
    version: data.metadata.version,
    generatedAt: data.metadata.generated_at,
  };
}
