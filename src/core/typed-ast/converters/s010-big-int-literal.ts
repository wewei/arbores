/**
 * BigIntLiteral 转换器
 * SyntaxKind: 10
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改转换逻辑，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import * as ts from 'typescript';
import type { ASTNode } from '../../types';
import type { BigIntLiteralNode } from '../types/s010-big-int-literal';

/**
 * 解析 BigInt 字面量的值和进制
 */
function parseBigIntLiteral(text: string): { value: string; base: 2 | 8 | 10 | 16 } {
  // 移除末尾的 'n' 后缀
  const cleanText = text.replace(/n$/, '');

  if (cleanText.startsWith('0x') || cleanText.startsWith('0X')) {
    // 十六进制
    return { value: cleanText.slice(2), base: 16 };
  } else if (cleanText.startsWith('0b') || cleanText.startsWith('0B')) {
    // 二进制
    return { value: cleanText.slice(2), base: 2 };
  } else if (cleanText.startsWith('0o') || cleanText.startsWith('0O')) {
    // 八进制
    return { value: cleanText.slice(2), base: 8 };
  } else {
    // 十进制
    return { value: cleanText, base: 10 };
  }
}

/**
 * 从通用ASTNode转换为类型化BigIntLiteralNode
 */
export function bigIntLiteralFromASTNode(node: ASTNode): BigIntLiteralNode {
  const text = node.text || '';

  // 解析 BigInt 的值和进制
  const { value, base } = parseBigIntLiteral(text);

  return {
    id: node.id,
    kind: 10,
    text,
    value,
    base,
    leadingComments: node.leadingComments,
    trailingComments: node.trailingComments,
  };
}

/**
 * 从类型化BigIntLiteralNode转换为通用ASTNode
 */
export function bigIntLiteralToASTNode(node: BigIntLiteralNode): ASTNode {
  return {
    id: node.id,
    kind: node.kind,
    text: node.text,
    leadingComments: node.leadingComments,
    trailingComments: node.trailingComments
  };
}

/**
 * 从TypeScript AST节点转换为类型化BigIntLiteralNode
 */
export function bigIntLiteralFromTsNode(node: ts.BigIntLiteral): BigIntLiteralNode {
  const text = node.text;
  const { value, base } = parseBigIntLiteral(text);

  return {
    id: `bigint-${node.pos}-${node.end}`,
    kind: 10,
    text,
    value,
    base,
  };
}

/**
 * 从类型化BigIntLiteralNode转换为TypeScript AST节点
 */
export function bigIntLiteralToTsNode(node: BigIntLiteralNode): ts.BigIntLiteral {
  // TODO: 实现 TypeScript 节点创建逻辑
  // 这通常需要使用 TypeScript factory 函数
  throw new Error('Converting to TypeScript AST node not yet implemented');
}
