import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createNewExpression: NodeBuilderFn<ts.NewExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.NewExpression => {
    const children = node.children || [];
    
    if (children.length < 2) {
      throw new Error(`NewExpression should have at least 2 children (new keyword + expression), got ${children.length}`);
    }
    
    // NewExpression 的结构：[new关键字, 表达式, 可选的类型参数, 可选的参数列表]
    const newKeywordId = children[0]; // 'new' keyword
    const expressionId = children[1]; // 构造函数表达式
    
    if (!newKeywordId || !expressionId) {
      throw new Error('NewExpression missing required children');
    }
    
    // 创建构造函数表达式
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 处理类型参数 (如果有)
    let typeArguments: ts.TypeNode[] | undefined;
    let argumentsArray: ts.Expression[] | undefined;
    
    // 查找类型参数和参数列表
    // 这里需要根据实际的AST结构来判断哪些是类型参数，哪些是普通参数
    if (children.length > 2) {
      const remainingChildren = children.slice(2);
      
      // 简单的启发式方法：如果存在SyntaxList，则处理参数
      for (const childId of remainingChildren) {
        const childNode = sourceFile.nodes[childId];
        if (childNode && childNode.kind === ts.SyntaxKind.SyntaxList) {
          // 这是参数列表
          const argNodes = (childNode.children || [])
            .map(argId => sourceFile.nodes[argId])
            .filter(argNode => argNode != null);
          
          // 即使参数列表为空，也要创建空数组
          argumentsArray = argNodes.map(argNode => createNode(sourceFile, argNode) as ts.Expression);
        }
      }
    }
    
    return ts.factory.createNewExpression(
      expression,
      typeArguments,
      argumentsArray
    );
  };
};
