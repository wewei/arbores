/**
 * StringLiteral AST Node
 * SyntaxKind: 11
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface StringLiteralNode extends BaseTokenNode {
  kind: 11; // StringLiteral
  
  /** 字符串字面量的原始文本，包括引号 */
  text: string;
  
  /** 字符串的解析值，不包含引号且已处理转义字符 */
  value: string;
  
  /** 引号类型 */
  quoteKind: 'single' | 'double';
}

/**
 * 类型判定函数
 */
export function isStringLiteral(node: BaseTokenNode): node is StringLiteralNode {
  return node.kind === 11;
}
