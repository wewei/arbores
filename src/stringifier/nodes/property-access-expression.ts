import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';

// 创建属性访问表达式节点
export function createPropertyAccessExpressionNode(node: ASTNode, ast: SourceFileAST): ts.PropertyAccessExpression {
  const children = node.children || [];
  let expression: ts.Expression = ts.factory.createIdentifier('obj');
  let name: ts.Identifier = ts.factory.createIdentifier('prop');
  
  // 按顺序处理子节点：对象 -> DotToken -> 属性名
  let foundObject = false;
  for (const childId of children) {
    const childNode = ast.nodes[childId];
    if (!childNode) continue;
    
    switch (childNode.kind) {
      case ts.SyntaxKind.Identifier:
        if (!foundObject) {
          // 第一个 Identifier 是对象
          expression = ts.factory.createIdentifier(childNode.text || 'obj');
          foundObject = true;
        } else {
          // 第二个 Identifier 是属性名
          name = ts.factory.createIdentifier(childNode.text || 'prop');
        }
        break;
      case ts.SyntaxKind.DotToken:
        // 跳过点符号
        break;
    }
  }
  
  return ts.factory.createPropertyAccessExpression(expression, name);
} 