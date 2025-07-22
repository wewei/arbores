import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createElementAccessExpression: NodeBuilderFn<ts.ElementAccessExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.ElementAccessExpression => {
    const children = node.children || [];
    
    if (children.length < 4) {
      throw new Error(`ElementAccessExpression should have at least 4 children (expression + [ + argumentExpression + ]), got ${children.length}`);
    }
    
    // ElementAccessExpression 的结构可能是：
    // - 普通访问：[表达式, '[', 参数表达式, ']'] (4个子节点)  
    // - 可选访问：[表达式, '?.', '[', 参数表达式, ']'] (5个子节点)
    let expressionId: string;
    let argumentExpressionId: string;
    let isOptional = false;
    
    if (children.length === 5) {
      // 可选链访问：arr?.  [  0  ]
      //           [0] [1] [2] [3] [4]
      if (!children[0] || !children[3]) {
        throw new Error('ElementAccessExpression missing required children for optional chain');
      }
      expressionId = children[0];
      // children[1] 应该是 '?.' (QuestionDotToken, kind 29)
      // children[2] 应该是 '[' (OpenBracketToken, kind 23)
      argumentExpressionId = children[3];
      // children[4] 应该是 ']' (CloseBracketToken, kind 24)
      
      // 检查是否确实是可选链
      if (children[1]) {
        const questionDotNode = sourceFile.nodes[children[1]];
        if (questionDotNode && questionDotNode.kind === 29) { // QuestionDotToken
          isOptional = true;
        }
      }
    } else {
      // 普通访问：arr [ 0 ]
      //         [0] [1] [2] [3]
      if (!children[0] || !children[2]) {
        throw new Error('ElementAccessExpression missing required children for normal access');
      }
      expressionId = children[0];
      // children[1] 应该是 '[' (OpenBracketToken, kind 23)
      argumentExpressionId = children[2];
      // children[3] 应该是 ']' (CloseBracketToken, kind 24)
    }
    
    // 创建主表达式 (被访问的对象/数组)
    const expressionNode = sourceFile.nodes[expressionId];
    if (!expressionNode) {
      throw new Error(`Expression node ${expressionId} not found`);
    }
    
    const expression = createNode(sourceFile, expressionNode) as ts.Expression;
    
    // 创建参数表达式 (索引/键)
    const argumentExpressionNode = sourceFile.nodes[argumentExpressionId];
    if (!argumentExpressionNode) {
      throw new Error(`Argument expression node ${argumentExpressionId} not found`);
    }
    
    const argumentExpression = createNode(sourceFile, argumentExpressionNode) as ts.Expression;
    
    // 创建ElementAccessExpression，根据是否可选链决定
    if (isOptional) {
      return ts.factory.createElementAccessChain(expression, ts.factory.createToken(ts.SyntaxKind.QuestionDotToken), argumentExpression);
    } else {
      return ts.factory.createElementAccessExpression(expression, argumentExpression);
    }
  };
};
