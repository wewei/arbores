#!/usr/bin/env bun

import { getSyntaxKindName, getAllSyntaxKindNames, getAllSyntaxKindValues } from '../src/syntax-kind-names';
import * as ts from 'typescript';

/**
 * Example: Parse a TypeScript file and show the syntax kinds of all nodes
 */
async function analyzeFile(filePath: string) {
  const sourceText = await Bun.file(filePath).text();
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  console.log(`Analyzing file: ${filePath}\n`);

  function visitNode(node: ts.Node, depth: number = 0) {
    const indent = '  '.repeat(depth);
    const kindName = getSyntaxKindName(node.kind);
    const nodeText = node.getText(sourceFile).substring(0, 50);
    
    console.log(`${indent}${kindName} (${node.kind}): "${nodeText}${nodeText.length >= 50 ? '...' : ''}"`);
    
    ts.forEachChild(node, child => visitNode(child, depth + 1));
  }

  visitNode(sourceFile);
}

/**
 * Example: Find all function declarations in a file
 */
async function findFunctions(filePath: string) {
  const sourceText = await Bun.file(filePath).text();
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const functions: ts.FunctionDeclaration[] = [];

  function visitNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      functions.push(node as ts.FunctionDeclaration);
    }
    ts.forEachChild(node, visitNode);
  }

  visitNode(sourceFile);

  console.log(`Found ${functions.length} function declarations:`);
  functions.forEach(func => {
    const name = func.name?.text || 'anonymous';
    console.log(`  - ${name}`);
  });
}

// Example usage
if (import.meta.main) {
  const testFile = './test.ts';
  
  // Create a simple test file if it doesn't exist
  if (!Bun.file(testFile).size) {
    const testCode = `
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

const result = greet("World");
console.log(result);
`;
    Bun.write(testFile, testCode);
  }

  console.log('=== Syntax Kind Analysis ===');
  await analyzeFile(testFile);
  
  console.log('\n=== Function Discovery ===');
  await findFunctions(testFile);
  
  console.log('\n=== Syntax Kind Statistics ===');
  console.log(`Total SyntaxKind values: ${getAllSyntaxKindValues().length}`);
  console.log(`Total SyntaxKind names: ${getAllSyntaxKindNames().length}`);
  
  // Show some common syntax kinds
  console.log('\n=== Common Syntax Kinds ===');
  const commonKinds = [
    ts.SyntaxKind.Identifier,
    ts.SyntaxKind.FunctionDeclaration,
    ts.SyntaxKind.ClassDeclaration,
    ts.SyntaxKind.VariableStatement,
    ts.SyntaxKind.CallExpression,
    ts.SyntaxKind.BinaryExpression,
    ts.SyntaxKind.StringLiteral,
    ts.SyntaxKind.NumericLiteral,
  ];
  
  commonKinds.forEach(kind => {
    console.log(`  ${kind} -> ${getSyntaxKindName(kind)}`);
  });
} 