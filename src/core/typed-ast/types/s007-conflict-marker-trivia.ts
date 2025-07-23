/**
 * ConflictMarkerTrivia AST Node
 * SyntaxKind: 7
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface ConflictMarkerTriviaNode extends BaseTokenNode {
  kind: 7; // ConflictMarkerTrivia

  /** 冲突标记的完整文本，如 '<<<<<<< HEAD' */
  text: string;

  /** 冲突标记类型 */
  markerType: 'start' | 'middle' | 'end';

  /** 标记内容（不包含 <<<<<<< 等前缀） */
  content?: string;
}

/**
 * 类型判定函数
 */
export function isConflictMarkerTrivia(node: BaseTokenNode): node is ConflictMarkerTriviaNode {
  return node.kind === 7;
}
