import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createYieldExpression: NodeBuilderFn<ts.YieldExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.YieldExpression => {
    const children = node.children || [];
    
    if (children.length < 1 || children.length > 3) {
      throw new Error(`YieldExpression should have 1-3 children, got ${children.length}`);
    }
    
    // YieldExpression 的结构：[yield], [*], [expression]
    // 可能的形式：yield, yield*, yield expression, yield* expression
    
    let expressionId: string | undefined;
    let hasAsteriskToken = false;
    
    if (children.length === 1) {
      // 只有 yield
      expressionId = undefined;
    } else if (children.length === 2) {
      // yield expression 或 yield*
      const secondChildId = children[1];
      if (secondChildId) {
        const secondChild = sourceFile.nodes[secondChildId];
        if (secondChild && secondChild.text === '*') {
          hasAsteriskToken = true;
        } else {
          expressionId = children[1];
        }
      }
    } else if (children.length === 3) {
      // yield * expression
      hasAsteriskToken = true;
      expressionId = children[2];
    }
    
    // 创建可选的表达式
    let expression: ts.Expression | undefined;
    if (expressionId) {
      const expressionNode = sourceFile.nodes[expressionId];
      if (expressionNode) {
        expression = createNode(sourceFile, expressionNode) as ts.Expression;
      }
    }
    
    // 根据是否有 asterisk token 选择正确的重载
    if (hasAsteriskToken) {
      return ts.factory.createYieldExpression(
        ts.factory.createToken(ts.SyntaxKind.AsteriskToken),
        expression || ts.factory.createVoidExpression(ts.factory.createNumericLiteral('0'))
      );
    } else {
      return ts.factory.createYieldExpression(undefined, expression);
    }
  };
};
