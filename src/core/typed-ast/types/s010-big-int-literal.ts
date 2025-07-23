/**
 * BigIntLiteral AST Node
 * SyntaxKind: 10
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface BigIntLiteralNode extends BaseTokenNode {
  kind: 10; // BigIntLiteral

  /** BigInt字面量的原始文本，包含 'n' 后缀 */
  text: string;

  /** BigInt的字符串值（不包含 'n' 后缀） */
  value: string;

  /** 数字的进制 (2, 8, 10, 16) */
  base: 2 | 8 | 10 | 16;
}

/**
 * 类型判定函数
 */
export function isBigIntLiteral(node: BaseTokenNode): node is BigIntLiteralNode {
  return node.kind === 10;
}
