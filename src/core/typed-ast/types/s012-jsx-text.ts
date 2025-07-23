/**
 * JsxText AST Node
 * SyntaxKind: 12
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface JsxTextNode extends BaseTokenNode {
  kind: 12; // JsxText

  /** JSX文本的原始内容 */
  text: string;

  /** 是否包含有意义的文本（非纯空白） */
  containsOnlyTriviaWhiteSpaces: boolean;
}

/**
 * 类型判定函数
 */
export function isJsxText(node: BaseTokenNode): node is JsxTextNode {
  return node.kind === 12;
}
