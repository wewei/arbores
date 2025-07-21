import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers } from '../utils';

/**
 * 创建类声明节点
 * 
 * ClassDeclaration 结构:
 * - 修饰符 (export, abstract等)
 * - class 关键字
 * - 类名 (Identifier)
 * - 开括号 {
 * - 类成员列表 (SyntaxList)
 * - 闭括号 }
 * 
 * 示例: export class Calculator { ... }
 */
export const createClassDeclaration: NodeBuilderFn<ts.ClassDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ClassDeclaration => {
  const children = node.children || [];
  
  // 获取修饰符
  const modifiers = getModifiers(children, sourceFile, createNode);
  
  let className: ts.Identifier | undefined;
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const heritageClauses: ts.HeritageClause[] = [];
  const members: ts.ClassElement[] = [];
  
  // 查找类名、类型参数和继承子句
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.Identifier) {
      className = createNode(sourceFile, child) as ts.Identifier;
    } else if (child.kind === ts.SyntaxKind.TypeParameter) {
      const typeParameter = createNode(sourceFile, child) as ts.TypeParameterDeclaration;
      typeParameters.push(typeParameter);
    } else if (child.kind === ts.SyntaxKind.HeritageClause) {
      const heritageClause = createNode(sourceFile, child) as ts.HeritageClause;
      heritageClauses.push(heritageClause);
    } else if (child.kind === ts.SyntaxKind.SyntaxList) {
      // 处理 SyntaxList，它可能包含类型参数或继承子句
      const syntaxListChildren = child.children || [];
      for (const specifierId of syntaxListChildren) {
        const specifierNode = sourceFile.nodes[specifierId];
        if (!specifierNode) continue;
        
        if (specifierNode.kind === ts.SyntaxKind.TypeParameter) {
          const typeParameter = createNode(sourceFile, specifierNode) as ts.TypeParameterDeclaration;
          typeParameters.push(typeParameter);
        } else if (specifierNode.kind === ts.SyntaxKind.HeritageClause) {
          const heritageClause = createNode(sourceFile, specifierNode) as ts.HeritageClause;
          heritageClauses.push(heritageClause);
        }
      }
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
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    className,
    typeParameters.length > 0 ? typeParameters : undefined, // type parameters
    heritageClauses.length > 0 ? heritageClauses : undefined, // heritage clauses
    members
  );
};
