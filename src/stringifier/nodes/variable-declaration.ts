import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { findChildByKind } from '../utils';
import { createAwaitExpressionNode } from './await-expression';
import { createCallExpressionNode } from './call-expression';

// 创建变量声明节点
export function createVariableDeclarationNode(node: ASTNode, ast: SourceFileAST): ts.VariableDeclaration {
  const children = node.children || [];
  const nameNode = findChildByKind(children, ast, ts.SyntaxKind.Identifier);
  
  // 查找初始值 - 跳过赋值符号
  let initializer: ts.Expression | undefined;
  for (const childId of children) {
    const childNode = ast.nodes[childId];
    if (childNode) {
      switch (childNode.kind) {
        case ts.SyntaxKind.AwaitExpression:
          initializer = createAwaitExpressionNode(childNode, ast);
          break;
        case ts.SyntaxKind.CallExpression:
          initializer = createCallExpressionNode(childNode, ast);
          break;
        case ts.SyntaxKind.StringLiteral:
          initializer = ts.factory.createStringLiteral(childNode.text || '');
          break;
        case ts.SyntaxKind.NumericLiteral:
          initializer = ts.factory.createNumericLiteral(childNode.text || '0');
          break;
        case ts.SyntaxKind.Identifier:
          // 跳过变量名，这是初始值标识符
          if (childNode !== nameNode) {
            initializer = ts.factory.createIdentifier(childNode.text || '');
          }
          break;
        // 跳过 FirstAssignment 等 token
        case ts.SyntaxKind.FirstAssignment:
        case ts.SyntaxKind.EqualsToken:
          break;
      }
    }
  }
  
  return ts.factory.createVariableDeclaration(
    nameNode ? ts.factory.createIdentifier(nameNode.text || '') : ts.factory.createIdentifier('var'),
    undefined, // exclamation token
    undefined, // type
    initializer // initializer
  );
} 