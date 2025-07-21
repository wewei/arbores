import * as ts from 'typescript';

/**
 * 检查节点是否为类型节点
 * 这个函数统一处理所有可能的类型节点类型，避免在各个构建器中重复定义
 */
export function isTypeNode(node: { kind: ts.SyntaxKind }): boolean {
  return (
    // 基础类型关键字
    node.kind === ts.SyntaxKind.NumberKeyword ||
    node.kind === ts.SyntaxKind.StringKeyword ||
    node.kind === ts.SyntaxKind.BooleanKeyword ||
    node.kind === ts.SyntaxKind.AnyKeyword ||
    node.kind === ts.SyntaxKind.VoidKeyword ||
    node.kind === ts.SyntaxKind.UnknownKeyword ||
    node.kind === ts.SyntaxKind.NeverKeyword ||
    node.kind === ts.SyntaxKind.NullKeyword ||
    node.kind === ts.SyntaxKind.UndefinedKeyword ||
    node.kind === ts.SyntaxKind.SymbolKeyword ||
    node.kind === ts.SyntaxKind.BigIntKeyword ||
    node.kind === ts.SyntaxKind.ObjectKeyword ||
    // 复杂类型
    node.kind === ts.SyntaxKind.TypeReference ||
    node.kind === ts.SyntaxKind.UnionType ||
    node.kind === ts.SyntaxKind.IntersectionType ||
    node.kind === ts.SyntaxKind.LiteralType ||
    node.kind === ts.SyntaxKind.TypeLiteral ||
    node.kind === ts.SyntaxKind.ArrayType ||
    node.kind === ts.SyntaxKind.TupleType ||
    node.kind === ts.SyntaxKind.ConditionalType ||
    node.kind === ts.SyntaxKind.MappedType ||
    node.kind === ts.SyntaxKind.IndexedAccessType ||
    node.kind === ts.SyntaxKind.TemplateLiteralType ||
    node.kind === ts.SyntaxKind.ParenthesizedType ||
    node.kind === ts.SyntaxKind.FunctionType ||
    node.kind === ts.SyntaxKind.ConstructorType ||
    node.kind === ts.SyntaxKind.ImportType ||
    node.kind === ts.SyntaxKind.TypePredicate
  );
} 