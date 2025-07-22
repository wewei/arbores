import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers } from '../utils';

/**
 * 创建接口声明节点
 * 
 * InterfaceDeclaration 结构:
 * - 修饰符 (export等)
 * - interface 关键字
 * - 接口名 (Identifier)
 * - 开括号 {
 * - 属性签名列表 (SyntaxList)
 * - 闭括号 }
 * 
 * 示例: export interface User { id: number; name: string; }
 */
export const createInterfaceDeclaration: NodeBuilderFn<ts.InterfaceDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.InterfaceDeclaration => {
  const children = node.children || [];
  
  // 获取修饰符
  const modifiers = getModifiers(children, sourceFile, createNode);
  
  let interfaceName: ts.Identifier | undefined;
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const members: ts.TypeElement[] = [];
  
  // 查找接口名和类型参数
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    // 跳过 JSDoc 节点，因为它们通过 leadingComments 处理
    if (child.kind === ts.SyntaxKind.JSDoc) continue;
    
    if (child.kind === ts.SyntaxKind.Identifier) {
      interfaceName = createNode(sourceFile, child) as ts.Identifier;
    } else if (child.kind === ts.SyntaxKind.TypeParameter) {
      const typeParameter = createNode(sourceFile, child) as ts.TypeParameterDeclaration;
      typeParameters.push(typeParameter);
    } else if (child.kind === ts.SyntaxKind.SyntaxList) {
      // 处理 SyntaxList，它可能包含类型参数
      const syntaxListChildren = child.children || [];
      for (const specifierId of syntaxListChildren) {
        const specifierNode = sourceFile.nodes[specifierId];
        if (!specifierNode) continue;
        
        if (specifierNode.kind === ts.SyntaxKind.TypeParameter) {
          const typeParameter = createNode(sourceFile, specifierNode) as ts.TypeParameterDeclaration;
          typeParameters.push(typeParameter);
        }
      }
    }
  }
  
  // 递归查找接口成员
  const findMembers = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.PropertySignature ||
        child.kind === ts.SyntaxKind.MethodSignature) {
      try {
        const member = createNode(sourceFile, child) as ts.TypeElement;
        members.push(member);
      } catch (error) {
        // 如果无法创建成员，跳过并继续
        console.warn(`Failed to create interface member: ${error}`);
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
  
  // 如果没有找到接口名，使用默认名称
  if (!interfaceName) {
    interfaceName = ts.factory.createIdentifier('UnnamedInterface');
  }
  
  return ts.factory.createInterfaceDeclaration(
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    interfaceName,
    typeParameters.length > 0 ? typeParameters : undefined, // type parameters
    undefined, // heritage clauses
    members
  );
};
