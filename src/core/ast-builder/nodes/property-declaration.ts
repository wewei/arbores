import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { getModifiers, isTypeNode } from '../utils';

/**
 * 创建属性声明节点
 * 
 * PropertyDeclaration 结构:
 * - 修饰符 (private, public, etc.)
 * - 属性名
 * - 类型注解
 * - 初始化器
 * 
 * 示例: private value: number = 0;
 */
export const createPropertyDeclaration: NodeBuilderFn<ts.PropertyDeclaration> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.PropertyDeclaration => {
  const children = node.children || [];
  
  // 获取修饰符
  const modifiers = getModifiers(children, sourceFile, createNode);
  
  let propertyName: ts.PropertyName | undefined;
  let questionToken: ts.Token<ts.SyntaxKind.QuestionToken> | undefined;
  let typeNode: ts.TypeNode | undefined;
  let initializer: ts.Expression | undefined;
  
  // 查找属性名、类型注解和初始化器
  for (const childId of children) {
    const child = sourceFile.nodes[childId];
    if (!child) continue;
    
    if (child.kind === ts.SyntaxKind.Identifier && !propertyName) {
      propertyName = createNode(sourceFile, child) as ts.PropertyName;
    } else if (child.kind === ts.SyntaxKind.QuestionToken) {
      questionToken = createNode(sourceFile, child) as ts.Token<ts.SyntaxKind.QuestionToken>;
    } else if (isTypeNode(child)) {
      typeNode = createNode(sourceFile, child) as ts.TypeNode;
    } else if (child.kind === ts.SyntaxKind.BinaryExpression ||
               child.kind === ts.SyntaxKind.StringLiteral ||
               child.kind === ts.SyntaxKind.NumericLiteral ||
               child.kind === ts.SyntaxKind.ObjectLiteralExpression ||
               child.kind === ts.SyntaxKind.ArrayLiteralExpression ||
               child.kind === ts.SyntaxKind.NewExpression ||
               child.kind === ts.SyntaxKind.CallExpression) {
      // 初始化器
      initializer = createNode(sourceFile, child) as ts.Expression;
    }
  }
  
  if (!propertyName) {
    propertyName = ts.factory.createIdentifier('property');
  }
  
  return ts.factory.createPropertyDeclaration(
    modifiers.length > 0 ? modifiers : undefined, // modifiers
    propertyName,
    questionToken, // question token
    typeNode, // type
    initializer // initializer
  );
};
