/**
 * StringLiteral AST Node
 * SyntaxKind: 11
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseLiteralNode, BaseTypedNode } from '../base';

export interface StringLiteralNode extends BaseLiteralNode<string> {
  kind: 11; // StringLiteral
  
  // 继承自 BaseLiteralNode:
  // - text: string (Token文本内容)
  // - value: string (字符串的实际值，去除引号)
  
  /** 字符串字面量的引号类型 */
  quoteKind?: 'single' | 'double' | 'template';
}

/**
 * 类型判定函数
 */
export function isStringLiteral(node: BaseTypedNode): node is StringLiteralNode {
  return node.kind === 11;
}
