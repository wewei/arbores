import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../../types';
import { createParameterNode } from './parameter';
import { createVariableStatementNode } from './variable-statement';
import { createReturnStatementNode } from './return-statement';
import { createExpressionStatementNode } from './expression-statement';

// 递归处理语法列表节点
export function createSyntaxListNode(node: ASTNode, ast: SourceFileAST): ts.NodeArray<ts.Node> {
  const nodes: ts.Node[] = [];
  if (node.children) {
    for (const childId of node.children) {
      const childNode = ast.nodes[childId];
      if (!childNode) continue;
      switch (childNode.kind) {
        case ts.SyntaxKind.Parameter:
          nodes.push(createParameterNode(childNode, ast));
          break;
        case ts.SyntaxKind.VariableStatement:
          nodes.push(createVariableStatementNode(childNode, ast));
          break;
        case ts.SyntaxKind.ReturnStatement:
          nodes.push(createReturnStatementNode(childNode, ast));
          break;
        case ts.SyntaxKind.ExpressionStatement:
          nodes.push(createExpressionStatementNode(childNode, ast));
          break;
        default:
          // 其它类型可扩展
          break;
      }
    }
  }
  return ts.factory.createNodeArray(nodes);
} 