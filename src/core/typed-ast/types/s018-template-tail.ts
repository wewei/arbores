/**
 * TemplateTail AST Node
 * SyntaxKind: 18
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface TemplateTailNode extends BaseTokenNode {
  kind: 18; // TemplateTail

  /** 模板尾部的原始文本，包括 } 和反引号 */
  text: string;

  /** 模板尾部的解析值（不包含 } 和反引号且已处理转义字符） */
  value: string;

  /** 原始字符串值（包含转义字符但不包含 } 和反引号） */
  rawText: string;
}

/**
 * 类型判定函数
 */
export function isTemplateTail(node: BaseTokenNode): node is TemplateTailNode {
  return node.kind === 18;
}
