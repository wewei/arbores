#!/usr/bin/env bun

import * as ts from 'typescript';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type SyntaxKindMap = Record<number, string>;

function parseSyntaxKindEnum(): SyntaxKindMap {
  const syntaxKindMap: SyntaxKindMap = {};

  // 需要过滤的位置标记枚举值
  const positionMarkers = [
    'FirstToken', 'LastToken', 'FirstTriviaToken', 'LastTriviaToken',
    'FirstLiteralToken', 'LastLiteralToken', 'FirstTemplateToken', 'LastTemplateToken',
    'FirstPunctuation', 'LastPunctuation', 'FirstBinaryOperator', 'LastBinaryOperator',
    'FirstAssignment', 'FirstCompoundAssignment', 'FirstKeyword', 'LastKeyword',
    'FirstReservedWord', 'LastReservedWord', 'FirstFutureReservedWord', 'LastFutureReservedWord',
    'FirstNode', 'FirstTypeNode', 'LastTypeNode', 'FirstStatement',
    'LastStatement', 'FirstJSDocNode', 'FirstJSDocTagNode', 'LastJSDocNode',
    'LastJSDocTagNode', 'Count'
  ];

  function isPositionMarker(name: string): boolean {
    // 除了显式列表，还检查以First或Last开头的名称
    return positionMarkers.includes(name) || 
           name.startsWith('First') || 
           name.startsWith('Last') ||
           name === 'Count' ||
           name === 'Unknown';
  }

  // 直接遍历 ts.SyntaxKind 枚举，使用编译时的准确值
  for (const key in ts.SyntaxKind) {
    if (isNaN(Number(key))) {
      // key是枚举名称，获取对应的数值
      const enumValue = (ts.SyntaxKind as any)[key];
      if (typeof enumValue === 'number') {
        // 跳过位置标记枚举值
        if (isPositionMarker(key)) {
          console.log(`跳过位置标记枚举值: ${key} (${enumValue})`);
          continue;
        }
        
        syntaxKindMap[enumValue] = key;
      }
    }
  }

  return syntaxKindMap;
}

function generateSyntaxKindNamesFunction(syntaxKindMap: SyntaxKindMap): string {
  const entries = Object.entries(syntaxKindMap)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([value, name]) => `  ${value}: '${name}'`)
    .join(',\n');

  return `/**
 * Human-readable names for TypeScript SyntaxKind enum values.
 * Generated automatically from TypeScript definition file.
 */
export const SYNTAX_KIND_NAMES: Record<number, string> = {
${entries}
};

/**
 * Get a human-readable name for a SyntaxKind enum value.
 * @param kind The SyntaxKind enum value
 * @returns The human-readable name, or 'Unknown' if not found
 */
export function getSyntaxKindName(kind: number): string {
  return SYNTAX_KIND_NAMES[kind] || 'Unknown';
}

/**
 * Get all known SyntaxKind names as an array.
 * @returns Array of all SyntaxKind names
 */
export function getAllSyntaxKindNames(): string[] {
  return Object.values(SYNTAX_KIND_NAMES);
}

/**
 * Get all known SyntaxKind values as an array.
 * @returns Array of all SyntaxKind numeric values
 */
export function getAllSyntaxKindValues(): number[] {
  return Object.keys(SYNTAX_KIND_NAMES).map(Number);
}
`;
}

function main() {
  console.log('Parsing TypeScript definition file...');
  const syntaxKindMap = parseSyntaxKindEnum();
  
  if (Object.keys(syntaxKindMap).length === 0) {
    console.error('Failed to parse SyntaxKind enum from TypeScript definition file');
    process.exit(1);
  }

  console.log(`Found ${Object.keys(syntaxKindMap).length} SyntaxKind values`);
  
  const generatedCode = generateSyntaxKindNamesFunction(syntaxKindMap);
  const outputPath = join(process.cwd(), 'src', 'core', 'syntax-kind-names.ts');
  
  writeFileSync(outputPath, generatedCode, 'utf-8');
  console.log(`Generated syntax kind names file: ${outputPath}`);
  
  // Also generate a JSON file for reference
  const jsonOutputPath = join(process.cwd(), 'src', 'core', 'syntax-kind-names.json');
  writeFileSync(jsonOutputPath, JSON.stringify(syntaxKindMap, null, 2), 'utf-8');
  console.log(`Generated JSON reference file: ${jsonOutputPath}`);
}

if (require.main === module) {
  main();
} 