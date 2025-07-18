import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createSyntaxListNode } from './syntax-list';

// 创建调用表达式节点
export function createCallExpressionNode(node: ASTNode, ast: SourceFileAST): ts.CallExpression {
  const children = node.children || [];
  let expression: ts.Expression = ts.factory.createIdentifier('func');
  const args: ts.Expression[] = [];
  
  // 按顺序处理子节点
  for (const childId of children) {
    const childNode = ast.nodes[childId];
    if (!childNode) continue;
    
    switch (childNode.kind) {
      case ts.SyntaxKind.Identifier:
        // 函数名
        expression = ts.factory.createIdentifier(childNode.text || 'func');
        break;
      case ts.SyntaxKind.PropertyAccessExpression:
        // 属性访问表达式，如 response.json
        const { createPropertyAccessExpressionNode } = require('./property-access-expression');
        expression = createPropertyAccessExpressionNode(childNode, ast);
        break;
      case ts.SyntaxKind.SyntaxList:
        // 参数列表
        if (childNode.children) {
          for (const argId of childNode.children) {
            const argNode = ast.nodes[argId];
            if (argNode) {
              switch (argNode.kind) {
                case ts.SyntaxKind.Identifier:
                  args.push(ts.factory.createIdentifier(argNode.text || 'arg'));
                  break;
                case ts.SyntaxKind.StringLiteral:
                  args.push(ts.factory.createStringLiteral(argNode.text || ''));
                  break;
                case ts.SyntaxKind.NumericLiteral:
                  args.push(ts.factory.createNumericLiteral(argNode.text || '0'));
                  break;
                // 可以添加更多表达式类型
              }
            }
          }
        }
        break;
      // 跳过 OpenParenToken 和 CloseParenToken
      case ts.SyntaxKind.OpenParenToken:
      case ts.SyntaxKind.CloseParenToken:
        break;
    }
  }

  return ts.factory.createCallExpression(expression, undefined, args);
} 