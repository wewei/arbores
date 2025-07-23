/**
 * NewLineTrivia AST Node
 * SyntaxKind: 4
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface NewLineTriviaNode extends BaseTokenNode {
  kind: 4; // NewLineTrivia
  
  /** 换行符的文本内容，可能是 '\n'、'\r' 或 '\r\n' */
  text: '\n' | '\r' | '\r\n';
}

/**
 * 类型判定函数
 */
export function isNewLineTrivia(node: BaseTokenNode): node is NewLineTriviaNode {
  return node.kind === 4;
}
