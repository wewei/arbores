import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn } from '../types';

/**
 * 创建展开元素节点 (...expression)
 * 用于数组字面量、函数调用参数等场景中的展开语法
 */
export function createSpreadElement(createNode: CreateNodeFn) {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.SpreadElement => {
    // 获取被展开的表达式
    // SpreadElement 的结构是：[DotDotDotToken, expression]
    let expression: ts.Expression;
    if (node.children && node.children.length > 0) {
      // 查找表达式，跳过 DotDotDotToken
      let expressionNode: ASTNode | undefined;
      
      for (const childId of node.children) {
        const childNode = sourceFile.nodes[childId!];
        if (childNode && childNode.kind !== ts.SyntaxKind.DotDotDotToken) {
          expressionNode = childNode;
          break;
        }
      }
      
      if (expressionNode) {
        expression = createNode(sourceFile, expressionNode) as ts.Expression;
      } else {
        expression = ts.factory.createIdentifier('unknown');
      }
    } else {
      expression = ts.factory.createIdentifier('unknown');
    }

    return ts.factory.createSpreadElement(expression);
  };
}
