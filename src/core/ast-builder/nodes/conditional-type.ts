import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ConditionalType 节点
 * Kind: 194
 * 例子: T extends U ? X : Y
 */
export const createConditionalType: NodeBuilderFn<ts.ConditionalTypeNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ConditionalTypeNode => {
    const children = node.children || [];
    
    if (children.length !== 7) {
      throw new Error(`ConditionalType should have exactly 7 children (checkType, extends, extendsType, ?, trueType, :, falseType), got ${children.length}`);
    }
    
    // 结构：[checkType, extends, extendsType, ?, trueType, :, falseType]
    const checkTypeNodeId = children[0]!;
    const extendsTypeNodeId = children[2]!;
    const trueTypeNodeId = children[4]!;
    const falseTypeNodeId = children[6]!;
    
    const checkTypeNode = sourceFile.nodes[checkTypeNodeId];
    const extendsTypeNode = sourceFile.nodes[extendsTypeNodeId];
    const trueTypeNode = sourceFile.nodes[trueTypeNodeId];
    const falseTypeNode = sourceFile.nodes[falseTypeNodeId];
    
    if (!checkTypeNode) {
      throw new Error(`ConditionalType: check type node not found: ${checkTypeNodeId}`);
    }
    if (!extendsTypeNode) {
      throw new Error(`ConditionalType: extends type node not found: ${extendsTypeNodeId}`);
    }
    if (!trueTypeNode) {
      throw new Error(`ConditionalType: true type node not found: ${trueTypeNodeId}`);
    }
    if (!falseTypeNode) {
      throw new Error(`ConditionalType: false type node not found: ${falseTypeNodeId}`);
    }
    
    const checkType = createNode(sourceFile, checkTypeNode) as ts.TypeNode;
    const extendsType = createNode(sourceFile, extendsTypeNode) as ts.TypeNode;
    const trueType = createNode(sourceFile, trueTypeNode) as ts.TypeNode;
    const falseType = createNode(sourceFile, falseTypeNode) as ts.TypeNode;
    
    return ts.factory.createConditionalTypeNode(
      checkType,
      extendsType,
      trueType,
      falseType
    );
  };
};
