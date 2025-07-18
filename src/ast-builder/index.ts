import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../types';
import type { CreateNodeFn, NodeBuilderRegistry } from './types';

// 导入所有节点构建函数
import { createSourceFile } from './nodes/source-file';
import { createFunctionDeclaration } from './nodes/function-declaration';
import { createVariableStatement } from './nodes/variable-statement';
import { createVariableDeclarationList } from './nodes/variable-declaration-list';
import { createVariableDeclaration } from './nodes/variable-declaration';
import { createReturnStatement } from './nodes/return-statement';
import { createBlock } from './nodes/block';
import { createCallExpression } from './nodes/call-expression';
import { createIdentifier } from './nodes/identifier';
import { createLiteral } from './nodes/literal';
import { createToken } from './nodes/token';
import { createModifier } from './nodes/modifier';
import { createSyntaxList } from './nodes/syntax-list';

/**
 * 主要的节点创建函数
 * 这是整个系统的核心，根据 node.kind 调用相应的构建函数
 */
export function createNode<T extends ts.Node = ts.Node>(
  sourceFile: SourceFileAST,
  node: ASTNode
): T {
  switch (node.kind) {
    // 源文件节点
    case ts.SyntaxKind.SourceFile:
      return createSourceFile(createNode)(sourceFile, node) as unknown as T;
    
    // 声明节点
    case ts.SyntaxKind.FunctionDeclaration:
      return createFunctionDeclaration(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableStatement:
      return createVariableStatement(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclarationList:
      return createVariableDeclarationList(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.VariableDeclaration:
      return createVariableDeclaration(createNode)(sourceFile, node) as unknown as T;
    
    // 语句节点
    case ts.SyntaxKind.Block:
      return createBlock(createNode)(sourceFile, node) as unknown as T;
    case ts.SyntaxKind.ReturnStatement:
      return createReturnStatement(createNode)(sourceFile, node) as unknown as T;
    
    // 表达式节点
    case ts.SyntaxKind.CallExpression:
      return createCallExpression(createNode)(sourceFile, node) as unknown as T;
    
    // 基础节点
    case ts.SyntaxKind.Identifier:
      return createIdentifier(createNode)(sourceFile, node) as unknown as T;
    
    // 字面量节点
    case ts.SyntaxKind.StringLiteral:
    case ts.SyntaxKind.NumericLiteral:
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      return createLiteral(createNode)(sourceFile, node) as unknown as T;
    
    // 修饰符节点
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.PrivateKeyword:
    case ts.SyntaxKind.PublicKeyword:
    case ts.SyntaxKind.ProtectedKeyword:
    case ts.SyntaxKind.StaticKeyword:
    case ts.SyntaxKind.ReadonlyKeyword:
    case ts.SyntaxKind.ConstKeyword:
    case ts.SyntaxKind.LetKeyword:
    case ts.SyntaxKind.VarKeyword:
      return createModifier(createNode)(sourceFile, node) as unknown as T;
    
    // Token 节点
    case ts.SyntaxKind.OpenParenToken:
    case ts.SyntaxKind.CloseParenToken:
    case ts.SyntaxKind.OpenBraceToken:
    case ts.SyntaxKind.CloseBraceToken:
    case ts.SyntaxKind.SemicolonToken:
    case ts.SyntaxKind.CommaToken:
    case ts.SyntaxKind.DotToken:
    case ts.SyntaxKind.ColonToken:
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.PlusToken:
    case ts.SyntaxKind.MinusToken:
    case ts.SyntaxKind.AsteriskToken:
    case ts.SyntaxKind.SlashToken:
      return createToken(createNode)(sourceFile, node) as unknown as T;
    
    // 特殊节点
    case ts.SyntaxKind.SyntaxList:
      return createSyntaxList(createNode)(sourceFile, node) as unknown as T;
    
    // 未支持的节点类型
    default:
      console.warn(`Unsupported node type: ${ts.SyntaxKind[node.kind]} (${node.kind})`);
      return ts.factory.createIdentifier(`/* Unsupported: ${ts.SyntaxKind[node.kind]} */`) as unknown as T;
  }
}

// 导出主要的创建函数
export { createNode as default };

// 也导出类型
export type { CreateNodeFn, NodeBuilderFn } from './types';
