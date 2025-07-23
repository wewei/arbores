/**
 * RegularExpressionLiteral AST Node
 * SyntaxKind: 14
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface RegularExpressionLiteralNode extends BaseTokenNode {
  kind: 14; // RegularExpressionLiteral

  /** 正则表达式的完整文本，包括 / 分隔符和标志 */
  text: string;

  /** 正则表达式模式（不包含分隔符） */
  pattern: string;

  /** 正则表达式标志（如 'g', 'i', 'm' 等） */
  flags: string;
}

/**
 * 类型判定函数
 */
export function isRegularExpressionLiteral(node: BaseTokenNode): node is RegularExpressionLiteralNode {
  return node.kind === 14;
}
