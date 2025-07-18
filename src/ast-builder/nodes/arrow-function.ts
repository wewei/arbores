import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

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
  const parameters: ts.ParameterDeclaration[] = [];
  let body: ts.ConciseBody | undefined;
  
  // 查找参数和函数体
  const findParameters = (nodeId: string): void => {
    const child = sourceFile.nodes[nodeId];
    if (!child) return;
    
    if (child.kind === ts.SyntaxKind.Parameter) {
      const param = createNode(sourceFile, child) as ts.ParameterDeclaration;
      parameters.push(param);
    } else if (child.children) {
      // 递归查找参数 (在 SyntaxList 中)
      for (const grandChildId of child.children) {
        findParameters(grandChildId);
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
  
  // 处理参数
  for (const childId of children) {
    findParameters(childId);
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
    undefined, // modifiers
    undefined, // type parameters
    parameters,
    undefined, // return type
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    body
  );
};
