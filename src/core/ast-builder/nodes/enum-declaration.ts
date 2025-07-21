import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers } from '../utils/modifiers';

/**
 * 创建 EnumDeclaration 节点
 * Kind: 266
 * 例子: export enum Color { Red = 'red', Green = 'green' }
 */
export const createEnumDeclaration: NodeBuilderFn<ts.EnumDeclaration> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.EnumDeclaration => {
    const children = node.children || [];
    
    // 获取修饰符
    const modifiers = getModifiers(children, sourceFile, createNode);
    
    // 查找关键部分
    let nameNodeId: string | undefined;
    let membersNodeId: string | undefined;
    let isConst = false;
    
    for (let i = 0; i < children.length; i++) {
      const childId = children[i]!;
      const child = sourceFile.nodes[childId];
      if (!child) continue;
      
      // 检查是否有 const 修饰符
      if (child.kind === ts.SyntaxKind.SyntaxList && i === 0) {
        // 这可能是修饰符列表
        if (child.children) {
          for (const modifierId of child.children) {
            const modifier = sourceFile.nodes[modifierId];
            if (modifier && modifier.kind === ts.SyntaxKind.ConstKeyword) {
              isConst = true;
            }
          }
        }
      }
      // 查找标识符作为枚举名
      else if (child.kind === ts.SyntaxKind.Identifier && !nameNodeId) {
        nameNodeId = childId;
      }
      // 查找 SyntaxList 作为成员列表（在大括号内）
      else if (child.kind === ts.SyntaxKind.SyntaxList && nameNodeId) {
        membersNodeId = childId;
      }
    }
    
    if (!nameNodeId) {
      throw new Error('EnumDeclaration: enum name not found');
    }
    
    const nameNode = sourceFile.nodes[nameNodeId];
    if (!nameNode) {
      throw new Error(`EnumDeclaration: name node not found: ${nameNodeId}`);
    }
    
    const name = createNode(sourceFile, nameNode) as ts.Identifier;
    
    // 创建成员列表
    const members: ts.EnumMember[] = [];
    if (membersNodeId) {
      const membersNode = sourceFile.nodes[membersNodeId];
      if (membersNode && membersNode.children) {
        for (const memberId of membersNode.children) {
          const memberNode = sourceFile.nodes[memberId];
          if (memberNode && memberNode.kind === ts.SyntaxKind.EnumMember) {
            const member = createNode(sourceFile, memberNode) as ts.EnumMember;
            members.push(member);
          }
        }
      }
    }
    
    // 添加 const 修饰符如果需要
    if (isConst) {
      // const 修饰符已经在 getModifiers 中处理了，这里不需要重复添加
    }
    
    return ts.factory.createEnumDeclaration(
      modifiers.length > 0 ? modifiers : undefined,
      name,
      members
    );
  };
};
