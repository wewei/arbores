/**
 * NonTextFileMarkerTrivia AST Node
 * SyntaxKind: 8
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface NonTextFileMarkerTriviaNode extends BaseTokenNode {
  kind: 8; // NonTextFileMarkerTrivia

  /** 非文本文件标记的完整文本 */
  text: string;
}

/**
 * 类型判定函数
 */
export function isNonTextFileMarkerTrivia(node: BaseTokenNode): node is NonTextFileMarkerTriviaNode {
  return node.kind === 8;
}
