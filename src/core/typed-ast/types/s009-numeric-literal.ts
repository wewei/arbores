/**
 * NumericLiteral AST Node
 * SyntaxKind: 9
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface NumericLiteralNode extends BaseTokenNode {
  kind: 9; // NumericLiteral
  
  /** 数字字面量的原始文本，可能包含下划线分隔符 */
  text: string;
  
  /** 数字的解析值 */
  value: number;
  
  /** 数字的进制 (2, 8, 10, 16) */
  base: 2 | 8 | 10 | 16;
}

/**
 * 类型判定函数
 */
export function isNumericLiteral(node: BaseTokenNode): node is NumericLiteralNode {
  return node.kind === 9;
}
