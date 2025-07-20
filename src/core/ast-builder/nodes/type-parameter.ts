import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 TypeParameter 节点
 * Kind: 168
 * 例子: T, K extends keyof T
 */
export const createTypeParameter: NodeBuilderFn<ts.TypeParameterDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeParameterDeclaration => {
    const children = node.children || [];
    
    if (children.length === 0) {
      throw new Error('TypeParameter should have at least one child (name)');
    }
    
    // 第一个子节点是类型参数名称
    const nameNodeId = children[0]!;
    const nameNode = sourceFile.nodes[nameNodeId];
    
    if (!nameNode) {
      throw new Error(`TypeParameter: name node not found: ${nameNodeId}`);
    }
    
    const name = createNode(sourceFile, nameNode) as ts.Identifier;
    
    // 检查是否有约束 (extends 子句)
    let constraint: ts.TypeNode | undefined;
    if (children.length > 2) {
      // 结构通常是: [name, extends, constraintType]
      const constraintNodeId = children[2];
      const constraintNode = sourceFile.nodes[constraintNodeId!];
      if (constraintNode) {
        constraint = createNode(sourceFile, constraintNode) as ts.TypeNode;
      }
    }
    
    // 检查是否有默认类型
    let defaultType: ts.TypeNode | undefined;
    if (children.length > 4) {
      // 结构通常是: [name, extends, constraintType, =, defaultType]
      const defaultNodeId = children[4];
      const defaultNode = sourceFile.nodes[defaultNodeId!];
      if (defaultNode) {
        defaultType = createNode(sourceFile, defaultNode) as ts.TypeNode;
      }
    }
    
    return ts.factory.createTypeParameterDeclaration(
      undefined, // modifiers
      name,
      constraint,
      defaultType
    );
  };
};
