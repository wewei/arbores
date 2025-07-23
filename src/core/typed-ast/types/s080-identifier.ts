/**
 * Identifier AST Node
 * SyntaxKind: 80
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface IdentifierNode extends BaseTokenNode {
  kind: 80; // Identifier

  /** 标识符的原始文本 */
  text: string;

  /** 标识符名称（通常与text相同，但可能经过处理） */
  escapedText: string;
}

/**
 * 类型判定函数
 */
export function isIdentifier(node: BaseTokenNode): node is IdentifierNode {
  return node.kind === 80;
}
