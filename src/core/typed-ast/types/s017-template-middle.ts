/**
 * TemplateMiddle AST Node
 * SyntaxKind: 17
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface TemplateMiddleNode extends BaseTokenNode {
  kind: 17; // TemplateMiddle

  /** 模板中间部分的原始文本，包括 } 和 ${ */
  text: string;

  /** 模板中间部分的解析值（不包含 } 和 ${ 且已处理转义字符） */
  value: string;

  /** 原始字符串值（包含转义字符但不包含 } 和 ${） */
  rawText: string;
}

/**
 * 类型判定函数
 */
export function isTemplateMiddle(node: BaseTokenNode): node is TemplateMiddleNode {
  return node.kind === 17;
}
