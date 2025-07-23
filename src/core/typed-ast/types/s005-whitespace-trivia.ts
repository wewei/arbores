/**
 * WhitespaceTrivia AST Node
 * SyntaxKind: 5
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface WhitespaceTriviaNode extends BaseTokenNode {
  kind: 5; // WhitespaceTrivia
  
  /** 空白符的文本内容，可能包含空格、制表符等 */
  text: string;
}

/**
 * 类型判定函数
 */
export function isWhitespaceTrivia(node: BaseTokenNode): node is WhitespaceTriviaNode {
  return node.kind === 5;
}
