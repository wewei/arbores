import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 ModuleDeclaration 节点（命名空间）
 * Kind: 267
 * 例子: namespace Geometry { ... }
 */
export const createModuleDeclaration: NodeBuilderFn<ts.ModuleDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ModuleDeclaration => {
    const children = node.children || [];
    
    if (children.length < 3) {
      throw new Error(`ModuleDeclaration should have at least 3 children (namespace, name, body), got ${children.length}`);
    }
    
    // 结构：[namespace 关键字, 名称, 模块体]
    const nameNodeId = children[1]!;
    const bodyNodeId = children[2]!;
    
    const nameNode = sourceFile.nodes[nameNodeId];
    const bodyNode = sourceFile.nodes[bodyNodeId];
    
    if (!nameNode) {
      throw new Error(`ModuleDeclaration: name node not found: ${nameNodeId}`);
    }
    if (!bodyNode) {
      throw new Error(`ModuleDeclaration: body node not found: ${bodyNodeId}`);
    }
    
    const name = createNode(sourceFile, nameNode) as ts.Identifier;
    const body = createNode(sourceFile, bodyNode) as ts.ModuleBody;
    
    return ts.factory.createModuleDeclaration(
      undefined, // modifiers
      name,
      body,
      ts.NodeFlags.Namespace // 标记为命名空间
    );
  };
};
