import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 TypeOperator 节点
 * Kind: 198
 * 例子: readonly T[] 或 keyof T
 */
export const createTypeOperator: NodeBuilderFn<ts.TypeOperatorNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeOperatorNode => {
    const children = node.children || [];
    
    if (children.length !== 2) {
      throw new Error(`TypeOperator should have exactly 2 children (operator, type), got ${children.length}`);
    }
    
    // 结构：[操作符, 类型]
    const operatorNodeId = children[0]!;
    const typeNodeId = children[1]!;
    
    const operatorNode = sourceFile.nodes[operatorNodeId];
    const typeNode = sourceFile.nodes[typeNodeId];
    
    if (!operatorNode) {
      throw new Error(`TypeOperator: operator node not found: ${operatorNodeId}`);
    }
    if (!typeNode) {
      throw new Error(`TypeOperator: type node not found: ${typeNodeId}`);
    }
    
    // 确定操作符类型
    let operator: ts.SyntaxKind;
    if (operatorNode.kind === ts.SyntaxKind.ReadonlyKeyword) {
      operator = ts.SyntaxKind.ReadonlyKeyword;
    } else if (operatorNode.kind === ts.SyntaxKind.KeyOfKeyword) {
      operator = ts.SyntaxKind.KeyOfKeyword;
    } else if (operatorNode.kind === ts.SyntaxKind.UniqueKeyword) {
      operator = ts.SyntaxKind.UniqueKeyword;
    } else {
      throw new Error(`Unsupported type operator: ${operatorNode.kind}`);
    }
    
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
    return ts.factory.createTypeOperatorNode(operator, type);
  };
};
