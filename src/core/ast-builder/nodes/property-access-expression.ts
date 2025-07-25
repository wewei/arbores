import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

/**
 * 创建属性访问表达式节点
 * 
 * PropertyAccessExpression 结构:
 * - children[0]: 左侧表达式
 * - children[1]: 点号操作符 (. 或 ?.)
 * - children[2]: 属性名称
 * 
 * 示例: config.database.host, user.name, api.getData, user?.profile
 */
export const createPropertyAccessExpression: NodeBuilderFn<ts.PropertyAccessExpression> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.PropertyAccessExpression => {
  const children = node.children || [];
  
  if (children.length < 3) {
    throw new Error(`PropertyAccessExpression requires at least 3 children (expression + dot + name), got ${children.length}`);
  }

  // children[0] 是左侧表达式
  const leftExpressionNode = sourceFile.nodes[children[0]!];
  if (!leftExpressionNode) {
    throw new Error(`Cannot find left expression node with id: ${children[0]}`);
  }
  
  // children[1] 是点号操作符 (检查是否是可选链)
  const dotTokenNode = sourceFile.nodes[children[1]!];
  const isOptionalChaining = dotTokenNode && dotTokenNode.kind === 29; // QuestionDotToken
  
  // children[2] 是属性名称
  const propertyNameNode = sourceFile.nodes[children[2]!];
  if (!propertyNameNode) {
    throw new Error(`Cannot find property name node with id: ${children[2]}`);
  }

  // 检查属性名称是否为标识符
  if (!propertyNameNode.text) {
    throw new Error(`Property name node must have text property`);
  }

  const leftExpression = createNode(sourceFile, leftExpressionNode);
  const propertyName = ts.factory.createIdentifier(propertyNameNode.text);

  // 根据是否是可选链来创建不同的节点
  if (isOptionalChaining) {
    const questionDotToken = ts.factory.createToken(ts.SyntaxKind.QuestionDotToken);
    return ts.factory.createPropertyAccessChain(leftExpression, questionDotToken, propertyName);
  } else {
    return ts.factory.createPropertyAccessExpression(leftExpression, propertyName);
  }
};
