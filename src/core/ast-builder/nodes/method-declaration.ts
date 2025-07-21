import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers, isTypeNode } from '../utils';

/**
 * 创建方法声明节点
 * 
 * MethodDeclaration 结构:
 * - 方法名
 * - 参数列表
 * - 返回类型
 * - 方法体
 * 
 * 示例: add(x: number): number { ... }
 */
export const createMethodDeclaration: NodeBuilderFn<ts.MethodDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.MethodDeclaration => {
  const children = node.children || [];
  
  // 获取修饰符
  const modifiers = getModifiers(children, sourceFile, createNode);
  
  let methodName: ts.PropertyName | undefined;
  let asteriskToken: ts.AsteriskToken | undefined;
  let questionToken: ts.Token<ts.SyntaxKind.QuestionToken> | undefined;
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  const parameters: ts.ParameterDeclaration[] = [];
  let typeNode: ts.TypeNode | undefined;
  let body: ts.Block | undefined;
  
  // 查找方法名、类型参数、返回类型等
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.Identifier && !methodName) {
      methodName = createNode(sourceFile, child) as ts.PropertyName;
    } else if (child.kind === ts.SyntaxKind.AsteriskToken) {
      asteriskToken = createNode(sourceFile, child) as ts.AsteriskToken;
    } else if (child.kind === ts.SyntaxKind.QuestionToken) {
      questionToken = createNode(sourceFile, child) as ts.Token<ts.SyntaxKind.QuestionToken>;
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
    } else if (isTypeNode(child)) {
      typeNode = createNode(sourceFile, child) as ts.TypeNode;
    }
  }
  
  // 查找参数和方法体
  const findElements = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.Parameter) {
      try {
        const param = createNode(sourceFile, child) as ts.ParameterDeclaration;
        parameters.push(param);
      } catch (error) {
        // 忽略无法创建的参数
      }
    } else if (child.kind === ts.SyntaxKind.Block) {
      try {
        body = createNode(sourceFile, child) as ts.Block;
      } catch (error) {
        // 忽略无法创建的方法体
      }
    } else if (child.children) {
      for (const grandChildId of child.children) {
        findElements(grandChildId);
      }
    }
  };
  
  for (const childId of children) {
    findElements(childId);
  }
  
  if (!methodName) {
    methodName = ts.factory.createIdentifier('method');
  }
  
  // 如果是抽象方法，不应该有方法体
  const isAbstract = modifiers.some(mod => mod.kind === ts.SyntaxKind.AbstractKeyword);
  
  if (!body && !isAbstract) {
    body = ts.factory.createBlock([]);
  }
  
  return ts.factory.createMethodDeclaration(
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    asteriskToken, // asterisk token
    methodName,
    questionToken, // question token
    typeParameters.length > 0 ? typeParameters : undefined, // type parameters
    parameters,
    typeNode, // type
    body
  );
};
