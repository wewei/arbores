/**
 * 基础AST节点类型
 * 
 * ⚠️ 警告：此文件由生成器自动生成，请勿手动修改！
 * 如需修改，请编辑 scripts/generate-typed-ast-nodes.ts 中的 createBaseTypes() 函数
 */

import type { CommentInfo } from '../types';

/**
 * 类型化AST节点基类
 * 仅保留必要的标识信息，移除通用字段如text、children、properties
 * 这些信息应该通过具体节点类型的强类型属性来表达
 */
export interface BaseTypedNode {
  id: string;
  kind: number;
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
}

/**
 * Token节点基类
 * 所有Token类型都包含text属性，表示其在源代码中的文本内容
 */
export interface BaseTokenNode extends BaseTypedNode {
  /** Token在源代码中的文本内容 */
  text: string;
}
