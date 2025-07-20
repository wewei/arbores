import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../core/types';

// 通用节点创建函数类型
export type CreateNodeFn<T extends ts.Node = ts.Node> = (sourceFile: SourceFileAST, node: ASTNode) => T;

// 具体节点构建函数类型
export type NodeBuilderFn<T extends ts.Node> = (createNode: CreateNodeFn<ts.Node>) => CreateNodeFn<T>;

// 节点构建器注册表类型
export type NodeBuilderRegistry = {
  [K in ts.SyntaxKind]?: NodeBuilderFn<ts.Node>;
};

// 常用的节点创建函数类型别名
export type CreateSourceFileFn = CreateNodeFn<ts.SourceFile>;
export type CreateFunctionDeclarationFn = CreateNodeFn<ts.FunctionDeclaration>;
export type CreateVariableStatementFn = CreateNodeFn<ts.VariableStatement>;
export type CreateBlockFn = CreateNodeFn<ts.Block>;
export type CreateCallExpressionFn = CreateNodeFn<ts.CallExpression>;
export type CreateExpressionFn = CreateNodeFn<ts.Expression>;
export type CreateStatementFn = CreateNodeFn<ts.Statement>;
export type CreateParameterFn = CreateNodeFn<ts.ParameterDeclaration>;
export type CreateTypeNodeFn = CreateNodeFn<ts.TypeNode>;
export type CreateIdentifierFn = CreateNodeFn<ts.Identifier>;
export type CreateLiteralFn = CreateNodeFn<ts.LiteralExpression>;
export type CreateTokenFn = CreateNodeFn<ts.Token<ts.SyntaxKind>>;
export type CreateModifierFn = CreateNodeFn<ts.Modifier>;

// 特殊类型：NodeArray 不是 Node 的子类型，需要特殊处理
export type CreateSyntaxListFn = (createNode: CreateNodeFn) => (sourceFile: SourceFileAST, node: ASTNode) => ts.NodeArray<ts.Node>;
