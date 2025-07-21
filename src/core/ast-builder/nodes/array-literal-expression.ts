import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';
import { extractFromSyntaxList, shouldSkipNode } from '../utils/syntax-list';

/**
 * 创建数组字面量表达式节点
 * 
 * ArrayLiteralExpression 结构:
 * - children[0]: 开括号 [
 * - children[1]: SyntaxList (包含元素和逗号)
 * - children[2]: 闭括号 ]
 * 
 * 示例: [1, 2, 3]
 */
export const createArrayLiteralExpression: NodeBuilderFn<ts.ArrayLiteralExpression> = (
  createNode: CreateNodeFn<any>
) => (
  sourceFile: SourceFileAST,
  node: ASTNode
): ts.ArrayLiteralExpression => {
  const children = node.children || [];
  
  // 提取所有子节点，自动处理 SyntaxList 包装器
  const allNodes = extractFromSyntaxList(children, sourceFile);
  
  // 过滤出表达式节点，跳过分隔符和括号
  const expressionNodes = allNodes.filter(child => {
    if (shouldSkipNode(child)) {
      return false;
    }
    
    // 跳过括号
    if (child.kind === ts.SyntaxKind.OpenBracketToken || 
        child.kind === ts.SyntaxKind.CloseBracketToken) {
      return false;
    }
    
    // 跳过 SyntaxList - 我们已经在 extractFromSyntaxList 中处理了它的内容
    if (child.kind === ts.SyntaxKind.SyntaxList) {
      return false;
    }
    
    return true;
  });

  const elements: ts.Expression[] = [];
  for (const elementNode of expressionNodes) {
    try {
      const element = createNode(sourceFile, elementNode) as ts.Expression;
      
      // 检查创建的元素是否有效
      if (element && element.kind !== undefined && element.kind !== ts.SyntaxKind.Unknown) {
        elements.push(element);
      }
    } catch (error) {
      console.warn(`Failed to create array element for ${ts.SyntaxKind[elementNode.kind]}:`, error);
    }
  }

  return ts.factory.createArrayLiteralExpression(elements);
};
