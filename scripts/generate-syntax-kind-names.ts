#!/usr/bin/env bun

import * as ts from 'typescript';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type SyntaxKindMap = Record<number, string>;

function parseSyntaxKindEnum(): SyntaxKindMap {
  const typescriptDefPath = join(process.cwd(), 'node_modules', 'typescript', 'lib', 'typescript.d.ts');
  const sourceText = readFileSync(typescriptDefPath, 'utf-8');
  
  const sourceFile = ts.createSourceFile(
    'typescript.d.ts',
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const syntaxKindMap: SyntaxKindMap = {};

  function visit(node: ts.Node) {
    if (ts.isEnumDeclaration(node) && node.name.text === 'SyntaxKind') {
      node.members.forEach(member => {
        if (ts.isEnumMember(member) && member.name && member.initializer) {
          const name = member.name.getText(sourceFile);
          const value = member.initializer.getText(sourceFile);
          
          // Parse the numeric value
          const numericValue = parseInt(value, 10);
          if (!isNaN(numericValue)) {
            syntaxKindMap[numericValue] = name;
          }
        }
      });
      return; // Don't visit children of the enum declaration
    }
    
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
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
  const outputPath = join(process.cwd(), 'src', 'syntax-kind-names.ts');
  
  writeFileSync(outputPath, generatedCode, 'utf-8');
  console.log(`Generated syntax kind names file: ${outputPath}`);
  
  // Also generate a JSON file for reference
  const jsonOutputPath = join(process.cwd(), 'src', 'syntax-kind-names.json');
  writeFileSync(jsonOutputPath, JSON.stringify(syntaxKindMap, null, 2), 'utf-8');
  console.log(`Generated JSON reference file: ${jsonOutputPath}`);
}

if (require.main === module) {
  main();
} 