/**
 * TemplateHead AST Node
 * SyntaxKind: 16
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTokenNode } from '../base';

export interface TemplateHeadNode extends BaseTokenNode {
  kind: 16; // TemplateHead

  /** 模板头部的原始文本，包括反引号和 ${ */
  text: string;

  /** 模板头部的解析值（不包含反引号和 ${ 且已处理转义字符） */
  value: string;

  /** 原始字符串值（包含转义字符但不包含反引号和 ${） */
  rawText: string;
}

/**
 * 类型判定函数
 */
export function isTemplateHead(node: BaseTokenNode): node is TemplateHeadNode {
  return node.kind === 16;
}
