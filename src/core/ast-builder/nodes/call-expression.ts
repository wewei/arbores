import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { findChildByKind, getChildNodes } from '../utils/find-child';

/**
 * 创建调用表达式节点
 */
export const createCallExpression: NodeBuilderFn<ts.CallExpression> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.CallExpression => {
    const children = getChildNodes(node, sourceFile);
    
    // 找到表达式（函数名、属性访问或 super）
    let expression: ts.Expression | undefined;
    const args: ts.Expression[] = [];
    let hasQuestionDotToken = false;
    
    for (const child of children) {
      switch (child.kind) {
        case ts.SyntaxKind.Identifier:
          expression = createNode(sourceFile, child) as ts.Identifier;
          break;
        case ts.SyntaxKind.SuperKeyword:
          expression = ts.factory.createSuper();
          break;
        case ts.SyntaxKind.PropertyAccessExpression:
          expression = createNode(sourceFile, child) as ts.PropertyAccessExpression;
          // 检查这个 PropertyAccessExpression 是否包含 QuestionDotToken
          if (child.children) {
            for (const grandChildId of child.children) {
              const grandChild = sourceFile.nodes[grandChildId];
              if (grandChild && grandChild.kind === ts.SyntaxKind.QuestionDotToken) {
                hasQuestionDotToken = true;
                break;
              }
            }
          }
          break;
        case ts.SyntaxKind.QuestionDotToken:
          hasQuestionDotToken = true;
          break;
        case ts.SyntaxKind.SyntaxList:
          // 参数列表
          const argNodes = getChildNodes(child, sourceFile);
          for (const argNode of argNodes) {
            if (argNode.kind !== ts.SyntaxKind.CommaToken) {
              const argExpr = createNode(sourceFile, argNode) as ts.Expression;
              args.push(argExpr);
            }
          }
          break;
        // 忽略括号
        case ts.SyntaxKind.OpenParenToken:
        case ts.SyntaxKind.CloseParenToken:
          break;
      }
    }
    
    // 如果没有找到表达式，使用默认值
    if (!expression) {
      expression = ts.factory.createIdentifier('func');
    }
    
    // 根据是否有可选链来创建不同的调用表达式
    if (hasQuestionDotToken) {
      // 对于可选链调用，不需要额外的 QuestionDotToken，因为表达式本身已经包含了
      return ts.factory.createCallChain(expression, undefined, undefined, args) as any;
    } else {
      return ts.factory.createCallExpression(expression, undefined, args);
    }
  };
};
