import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建 TypeLiteral 节点
 * Kind: 187
 * 例子: { [key: string]: JsonValue }
 */
export const createTypeLiteral: NodeBuilderFn<ts.TypeLiteralNode> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.TypeLiteralNode => {
    const children = node.children || [];
    
    // 查找 SyntaxList 作为成员列表（跳过大括号）
    let membersNodeId: string | undefined;
    
    for (const childId of children) {
      const child = sourceFile.nodes[childId];
      if (child && child.kind === ts.SyntaxKind.SyntaxList) {
        membersNodeId = childId;
        break;
      }
    }
    
    // 创建成员列表
    const members: ts.TypeElement[] = [];
    if (membersNodeId) {
      const membersNode = sourceFile.nodes[membersNodeId];
      if (membersNode && membersNode.children) {
        for (const memberId of membersNode.children) {
          const memberNode = sourceFile.nodes[memberId];
          if (memberNode) {
            const member = createNode(sourceFile, memberNode) as ts.TypeElement;
            members.push(member);
          }
        }
      }
    }
    
    return ts.factory.createTypeLiteralNode(members);
  };
};
