import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createAsExpression: NodeBuilderFn<ts.AsExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.AsExpression => {
    const children = node.children || [];
    
    if (children.length !== 3) {
      throw new Error(`AsExpression should have exactly 3 children (expression + as + type), got ${children.length}`);
    }
    
    // AsExpression 的结构：[表达式, 'as' 关键字, 类型]
    const expressionId = children[0];
    const asKeywordId = children[1]; // 'as' keyword
    const typeId = children[2];
    
    if (!expressionId || !typeId) {
      throw new Error('AsExpression missing required children');
    }
    
    // 创建被断言的表达式
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 创建目标类型
    const typeNode = sourceFile.nodes[typeId];
    if (!typeNode) {
      throw new Error(`Type node ${typeId} not found`);
    }
    
    const type = createNode(sourceFile, typeNode) as ts.TypeNode;
    
    return ts.factory.createAsExpression(expression, type);
  };
};
