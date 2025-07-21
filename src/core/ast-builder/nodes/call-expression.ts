import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建调用表达式节点
 */
export const createCallExpression: NodeBuilderFn<ts.CallExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.CallExpression => {
    const children = getChildNodes(node, sourceFile);
    
    // 找到表达式（函数名、属性访问或 super）
    let expression: ts.Expression | undefined;
    const args: ts.Expression[] = [];
    
    for (const child of children) {
      switch (child.kind) {
        case ts.SyntaxKind.Identifier:
          expression = createNode(sourceFile, child) as ts.Identifier;
          break;
        case ts.SyntaxKind.SuperKeyword:
          expression = ts.factory.createSuper();
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          expression = createNode(sourceFile, child) as ts.PropertyAccessExpression;
          break;
        case ts.SyntaxKind.SyntaxList:
          // 参数列表
          const argNodes = getChildNodes(child, sourceFile);
          for (const argNode of argNodes) {
            if (argNode.kind !== ts.SyntaxKind.CommaToken) {
              const argExpr = createNode(sourceFile, argNode) as ts.Expression;
              args.push(argExpr);
            }
          }
          break;
        // 忽略括号
        case ts.SyntaxKind.OpenParenToken:
        case ts.SyntaxKind.CloseParenToken:
          break;
      }
    }
    
    // 如果没有找到表达式，使用默认值
    if (!expression) {
      expression = ts.factory.createIdentifier('func');
    }
    
    return ts.factory.createCallExpression(expression, undefined, args);
  };
};
