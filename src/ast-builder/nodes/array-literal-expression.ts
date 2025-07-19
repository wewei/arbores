import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建数组字面量表达式节点
 * 
 * ArrayLiteralExpression 结构:
 * - children[0]: 开括号 [
 * - children[1]: SyntaxList (包含元素和逗号)
 * - children[2]: 闭括号 ]
 * 
 * 示例: [1, 2, 3]
 */
export const createArrayLiteralExpression: NodeBuilderFn<ts.ArrayLiteralExpression> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ArrayLiteralExpression => {
  const children = node.children || [];
  const elements: ts.Expression[] = [];
  
  // 递归查找表达式元素节点 (排除逗号)
  const findElements = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    // 跳过逗号、括号等token
    if (child.kind === ts.SyntaxKind.CommaToken || 
        child.kind === ts.SyntaxKind.OpenBracketToken ||
        child.kind === ts.SyntaxKind.CloseBracketToken) {
      return;
    }
    
    // 如果是具体的表达式节点
    if (child.kind === ts.SyntaxKind.NumericLiteral ||
        child.kind === ts.SyntaxKind.StringLiteral ||
        child.kind === ts.SyntaxKind.TrueKeyword ||
        child.kind === ts.SyntaxKind.FalseKeyword ||
        child.kind === ts.SyntaxKind.Identifier ||
        child.kind === ts.SyntaxKind.BinaryExpression ||
        child.kind === ts.SyntaxKind.CallExpression ||
        child.kind === ts.SyntaxKind.PropertyAccessExpression ||
        child.kind === ts.SyntaxKind.ObjectLiteralExpression ||
        child.kind === ts.SyntaxKind.ArrayLiteralExpression ||
        child.kind === ts.SyntaxKind.SpreadElement) {
      const element = createNode(sourceFile, child) as ts.Expression;
      elements.push(element);
    } else if (child.children) {
      // 递归查找子节点 (处理SyntaxList等容器节点)
      for (const grandChildId of child.children) {
        findElements(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findElements(childId);
  }

  return ts.factory.createArrayLiteralExpression(elements);
};
