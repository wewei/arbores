import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers, isTypeNode } from '../utils';

/**
 * 创建箭头函数节点
 * 
 * ArrowFunction 结构:
 * - 参数列表 (可能在 SyntaxList 中，或直接参数)
 * - => 箭头操作符
 * - 函数体 (表达式或块语句)
 * 
 * 示例: (x) => x * 2, data => data
 */
export const createArrowFunction: NodeBuilderFn<ts.ArrowFunction> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ArrowFunction => {
  const children = node.children || [];
  
  // 获取修饰符 (包括 async)
  const modifiers = getModifiers(children, sourceFile, createNode);
  
  const parameters: ts.ParameterDeclaration[] = [];
  const typeParameters: ts.TypeParameterDeclaration[] = [];
  let typeNode: ts.TypeNode | undefined;
  let body: ts.ConciseBody | undefined;
  
  // 查找参数、类型参数、返回类型和函数体
  const findElements = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.Parameter) {
      const param = createNode(sourceFile, child) as ts.ParameterDeclaration;
      parameters.push(param);
    } else if (child.kind === ts.SyntaxKind.TypeParameter) {
      const typeParameter = createNode(sourceFile, child) as ts.TypeParameterDeclaration;
      typeParameters.push(typeParameter);
    } else if (child.kind === ts.SyntaxKind.SyntaxList) {
      // 处理 SyntaxList，它可能包含类型参数或参数
      const syntaxListChildren = child.children || [];
      for (const specifierId of syntaxListChildren) {
        const specifierNode = sourceFile.nodes[specifierId];
        if (!specifierNode) continue;
        
        if (specifierNode.kind === ts.SyntaxKind.TypeParameter) {
          const typeParameter = createNode(sourceFile, specifierNode) as ts.TypeParameterDeclaration;
          typeParameters.push(typeParameter);
        } else if (specifierNode.kind === ts.SyntaxKind.Parameter) {
          const param = createNode(sourceFile, specifierNode) as ts.ParameterDeclaration;
          parameters.push(param);
        }
      }
    } else if (isTypeNode(child)) {
      typeNode = createNode(sourceFile, child) as ts.TypeNode;
    } else if (child.children) {
      // 递归查找其他元素
      for (const grandChildId of child.children) {
        findElements(grandChildId);
      }
    }
  };
  
  // 查找函数体 (最后一个非操作符子节点)
  let bodyNodeId: string | undefined;
  for (let i = children.length - 1; i >= 0; i--) {
    const childId = children[i]!;
    const child = sourceFile.nodes[childId];
    if (child && child.kind !== ts.SyntaxKind.EqualsGreaterThanToken) {
      // 如果不是箭头操作符，可能是函数体
      const isArrow = child.kind === ts.SyntaxKind.EqualsGreaterThanToken;
      const isParens = child.kind === ts.SyntaxKind.OpenParenToken || 
                      child.kind === ts.SyntaxKind.CloseParenToken;
      
      if (!isArrow && !isParens) {
        bodyNodeId = childId;
        break;
      }
    }
  }
  
  // 处理所有元素
  for (const childId of children) {
    findElements(childId);
  }
  
  // 处理函数体
  if (bodyNodeId) {
    const bodyNode = sourceFile.nodes[bodyNodeId];
    if (bodyNode) {
      body = createNode(sourceFile, bodyNode) as ts.ConciseBody;
    }
  }
  
  // 如果没有找到函数体，创建一个默认的
  if (!body) {
    body = ts.factory.createIdentifier('undefined');
  }

  return ts.factory.createArrowFunction(
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    typeParameters.length > 0 ? typeParameters : undefined, // type parameters
    parameters,
    typeNode, // return type
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    body
  );
};
