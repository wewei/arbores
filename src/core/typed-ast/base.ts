/**
 * 类型化AST基础节点类型
 * 
 * 此文件定义了类型化AST系统的基础接口，用于在重构过程中提供
 * 灵活的基础类型扩展能力。
 * 
 * @author Typed AST Team
 * @since 2025-07-23
 */

import type { CommentInfo } from '../types';

/**
 * 类型化AST节点基类
 * 
 * 所有类型化AST节点的基础接口，仅保留必要的标识信息。
 * 移除了通用字段如text、children、properties，这些信息应该
 * 通过具体节点类型的强类型属性来表达。
 * 
 * @example
 * ```typescript
 * interface MyCustomNode extends BaseTypedNode {
 *   kind: 123;
 *   customProperty: string;
 * }
 * ```
 */
export interface BaseTypedNode {
  /** 节点唯一标识符 */
  id: string;
  
  /** TypeScript SyntaxKind 值 */
  kind: number;
  
  /** 前置注释信息 */
  leadingComments?: CommentInfo[];
  
  /** 后置注释信息 */
  trailingComments?: CommentInfo[];
}

/**
 * Token节点基类
 * 
 * 所有Token类型节点的基础接口，包含text属性用于表示
 * 其在源代码中的文本内容。适用于关键字、标点符号、
 * 字面量等不包含子节点的语法元素。
 * 
 * @example
 * ```typescript
 * interface IdentifierNode extends BaseTokenNode {
 *   kind: 80; // SyntaxKind.Identifier
 *   // text 属性继承自 BaseTokenNode
 * }
 * ```
 */
export interface BaseTokenNode extends BaseTypedNode {
  /** Token在源代码中的文本内容 */
  text: string;
}

/**
 * 具有值的节点基类
 * 
 * 适用于字面量类型，如数字、字符串、布尔值等。
 * 提供强类型的 value 属性，避免使用通用的 text 属性。
 * 
 * @template T - 值的类型
 * @example
 * ```typescript
 * interface NumericLiteralNode extends BaseLiteralNode<number> {
 *   kind: 9; // SyntaxKind.NumericLiteral
 * }
 * ```
 */
export interface BaseLiteralNode<T = unknown> extends BaseTokenNode {
  /** 字面量的值 */
  value: T;
}

/**
 * 具有名称的节点基类
 * 
 * 适用于声明节点、标识符等具有名称概念的语法元素。
 * 
 * @example
 * ```typescript
 * interface FunctionDeclarationNode extends BaseNamedNode {
 *   kind: 262; // SyntaxKind.FunctionDeclaration
 *   parameters: ParameterNode[];
 * }
 * ```
 */
export interface BaseNamedNode extends BaseTypedNode {
  /** 节点名称 */
  name: string;
}

/**
 * 具有修饰符的节点基类
 * 
 * 适用于类成员、函数声明等可以有修饰符的语法元素。
 * 
 * @example
 * ```typescript
 * interface MethodDeclarationNode extends BaseModifiableNode {
 *   kind: 174; // SyntaxKind.MethodDeclaration
 *   name: string;
 * }
 * ```
 */
export interface BaseModifiableNode extends BaseTypedNode {
  /** 修饰符列表，如 public, private, static, async 等 */
  modifiers?: Array<{
    kind: number;
    text: string;
  }>;
}

/**
 * 具有类型注解的节点基类
 * 
 * 适用于参数、变量声明、函数返回值等具有类型注解的语法元素。
 * 
 * @example
 * ```typescript
 * interface ParameterNode extends BaseTypedAnnotationNode {
 *   kind: 169; // SyntaxKind.Parameter
 *   name: string;
 * }
 * ```
 */
export interface BaseTypedAnnotationNode extends BaseTypedNode {
  /** 类型注解节点 */
  typeAnnotation?: BaseTypedNode;
}
