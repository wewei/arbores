import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建类声明节点
 * 
 * ClassDeclaration 结构:
 * - class 关键字
 * - 类名 (Identifier)
 * - 开括号 {
 * - 类成员列表 (SyntaxList)
 * - 闭括号 }
 * 
 * 示例: class Calculator { ... }
 */
export const createClassDeclaration: NodeBuilderFn<ts.ClassDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ClassDeclaration => {
  const children = node.children || [];
  let className: ts.Identifier | undefined;
  const members: ts.ClassElement[] = [];
  
  // 查找类名
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (child && child.kind === ts.SyntaxKind.Identifier) {
      className = createNode(sourceFile, child) as ts.Identifier;
      break;
    }
  }
  
  // 递归查找类成员
  const findMembers = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.PropertyDeclaration ||
        child.kind === ts.SyntaxKind.MethodDeclaration ||
        child.kind === ts.SyntaxKind.Constructor) {
      try {
        const member = createNode(sourceFile, child) as ts.ClassElement;
        members.push(member);
      } catch (error) {
        // 如果无法创建成员，跳过并继续
        console.warn(`Failed to create class member: ${error}`);
      }
    } else if (child.children) {
      // 递归查找
      for (const grandChildId of child.children) {
        findMembers(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findMembers(childId);
  }
  
  // 如果没有找到类名，使用默认名称
  if (!className) {
    className = ts.factory.createIdentifier('UnnamedClass');
  }
  
  return ts.factory.createClassDeclaration(
    undefined, // modifiers
    className,
    undefined, // type parameters
    undefined, // heritage clauses
    members
  );
};
