import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 EnumMember 节点
 * Kind: 306
 * 例子: Red = 'red' 或 Up = 1 或 Down (自增)
 */
export const createEnumMember: NodeBuilderFn<ts.EnumMember> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.EnumMember => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error('EnumMember should have at least 1 child (name)');
    }
    
    // 第一个子节点是名称
    const nameNodeId = children[0]!;
    const nameNode = sourceFile.nodes[nameNodeId];
    
    if (!nameNode) {
      throw new Error(`EnumMember: name node not found: ${nameNodeId}`);
    }
    
    const name = createNode(sourceFile, nameNode) as ts.Identifier;
    
    // 查找初始化器（如果存在）
    let initializer: ts.Expression | undefined;
    
    // 如果有 3 个子节点：[name, =, initializer]
    if (children.length === 3) {
      const initializerNodeId = children[2]!;
      const initializerNode = sourceFile.nodes[initializerNodeId];
      if (initializerNode) {
        initializer = createNode(sourceFile, initializerNode) as ts.Expression;
      }
    }
    
    return ts.factory.createEnumMember(name, initializer);
  };
};
