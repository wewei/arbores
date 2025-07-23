/**
 * JsxTextAllWhiteSpaces AST Node
 * SyntaxKind: 13
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface JsxTextAllWhiteSpacesNode extends BaseTokenNode {
  kind: 13; // JsxTextAllWhiteSpaces

  /** JSX文本内容，仅包含空白字符 */
  text: string;
}

/**
 * 类型判定函数
 */
export function isJsxTextAllWhiteSpaces(node: BaseTokenNode): node is JsxTextAllWhiteSpacesNode {
  return node.kind === 13;
}
