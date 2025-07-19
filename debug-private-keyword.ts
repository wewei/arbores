#!/usr/bin/env bun

import { readFileSync } from 'fs';
import createNode from './src/ast-builder/index.ts';
import * as ts from 'typescript';

// 读取 AST 文件
const ast = JSON.parse(readFileSync('samples/private-param-test.ast.json', 'utf-8'));

// 找到 PrivateKeyword 节点 (58e57b17ef56c6be)
const privateKeywordNode = ast.nodes['58e57b17ef56c6be'];
console.log('Private keyword AST node:', privateKeywordNode);

// 创建 TypeScript 节点
const tsNode = createNode<ts.PrivateKeyword>(ast, privateKeywordNode);
console.log('Created TS node:', {
  kind: tsNode.kind,
  kindName: ts.SyntaxKind[tsNode.kind]
});

// 尝试打印节点
const printer = ts.createPrinter();
try {
  const sourceFile = ts.createSourceFile('temp.ts', '', ts.ScriptTarget.Latest);
  const result = printer.printNode(ts.EmitHint.Unspecified, tsNode, sourceFile);
  console.log('Printed result:', result);
} catch (error: any) {
  console.log('Print error:', error.message);
  console.log('Node details:', tsNode);
}

// 让我们检查这个节点是否通过了 TypeScript 的类型检查
console.log('Node properties:');
console.log('- isToken:', ts.isToken && ts.isToken(tsNode));
console.log('- node.kind === SyntaxKind.PrivateKeyword:', tsNode.kind === ts.SyntaxKind.PrivateKeyword);
