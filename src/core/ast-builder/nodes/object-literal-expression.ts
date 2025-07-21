import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建对象字面量表达式节点
 * 
 * ObjectLiteralExpression 结构:
 * - children[0]: 开括号 {
 * - children[1]: SyntaxList (包含属性赋值和逗号)
 * - children[2]: 闭括号 }
 * 
 * 示例: { x: 10, y: 20 }
 */
export const createObjectLiteralExpression: NodeBuilderFn<ts.ObjectLiteralExpression> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ObjectLiteralExpression => {
  const children = node.children || [];
  const properties: ts.ObjectLiteralElementLike[] = [];
  
  // 递归查找PropertyAssignment和ShorthandPropertyAssignment节点
  const findProperties = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.PropertyAssignment) {
      const property = createNode(sourceFile, child) as ts.PropertyAssignment;
      properties.push(property);
    } else if (child.kind === ts.SyntaxKind.ShorthandPropertyAssignment) {
      const property = createNode(sourceFile, child) as ts.ShorthandPropertyAssignment;
      properties.push(property);
    } else if (child.children) {
      // 递归查找子节点 (处理SyntaxList等容器节点)
      for (const grandChildId of child.children) {
        findProperties(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findProperties(childId);
  }

  return ts.factory.createObjectLiteralExpression(properties);
};
