import * as ts from 'typescript';
import type { ASTNode, SourceFileAST } from '../types';
import { createSourceFileNode } from './nodes/source-file';
import { createFunctionDeclarationNode } from './nodes/function-declaration';
import { createVariableStatementNode } from './nodes/variable-statement';
import { createClassDeclarationNode } from './nodes/class-declaration';
import { createInterfaceDeclarationNode } from './nodes/interface-declaration';
import { createReturnStatementNode } from './nodes/return-statement';
import { createIfStatementNode } from './nodes/if-statement';
import { createBlockNode } from './nodes/block';
import { createBinaryExpressionNode } from './nodes/binary-expression';
import { createCallExpressionNode } from './nodes/call-expression';
import { createParameterNode } from './nodes/parameter';
import { createVariableDeclarationNode } from './nodes/variable-declaration';
import { createVariableDeclarationListNode } from './nodes/variable-declaration-list';
import { createObjectLiteralExpressionNode } from './nodes/object-literal-expression';
import { createPropertyAssignmentNode } from './nodes/property-assignment';
import { createArrayLiteralExpressionNode } from './nodes/array-literal-expression';
import { createTypeReferenceNode } from './nodes/type-reference';
import { createPropertyDeclarationNode } from './nodes/property-declaration';
import { createMethodDeclarationNode } from './nodes/method-declaration';
import { createConstructorNode } from './nodes/constructor';
import { createModifierNode } from './nodes/modifier';
import { createSyntaxListNode } from './nodes/syntax-list';
import { createExpressionStatementNode } from './nodes/expression-statement';
import { createAwaitExpressionNode } from './nodes/await-expression';
import { createPropertyAccessExpressionNode } from './nodes/property-access-expression';
import { createParenthesizedExpressionNode } from './nodes/parenthesized-expression';
import { createTokenNode } from './nodes/token';

// 从 AST 节点生成 TypeScript 代码
export function stringifyNode(
  nodeId: string, 
  ast: SourceFileAST, 
  format: 'compact' | 'readable' | 'minified' = 'readable'
): string {
  const node = ast.nodes[nodeId];
  if (!node) {
    throw new Error(`Node with ID ${nodeId} not found`);
  }
  
  // 对于有文本的节点直接返回文本
  if (node.text) {
    return node.text;
  }
  
  // 对于复杂节点，尝试使用 TypeScript Factory API 重建
  try {
    const tsNode = createTSNode(node, ast);
    
    // 使用 TypeScript Printer API 生成代码
    const printer = ts.createPrinter({
      newLine: format === 'minified' ? ts.NewLineKind.CarriageReturnLineFeed : ts.NewLineKind.LineFeed,
      removeComments: format === 'minified',
      omitTrailingSemicolon: format === 'minified'
    });
    
    // 创建临时的 SourceFile 用于打印
    const tempSourceFile = ts.createSourceFile(
      'temp.ts',
      '',
      ts.ScriptTarget.Latest,
      true
    );
    
    return printer.printNode(
      ts.EmitHint.Unspecified,
      tsNode,
      tempSourceFile
    );
  } catch (error) {
    // 如果 Factory API 失败，返回节点信息
    return `/* ${ts.SyntaxKind[node.kind]} node */`;
  }
}

// 使用 TypeScript Factory API 创建节点
// 注意：这个函数在多个文件中重复实现（syntax-list.ts, source-file.ts, node-factory.ts）
// 推荐的重构方案：
// 1. 将这个函数移到一个单独的模块 (如 node-factory.ts)
// 2. 更新所有节点创建函数接受 CreateTSNodeFn 参数
// 3. 在各个文件中导入并使用统一的函数
// 4. 这样可以避免重复代码并提高可维护性
function createTSNode(node: ASTNode, ast: SourceFileAST): ts.Node {
  switch (node.kind) {
    case ts.SyntaxKind.SourceFile:
      return createSourceFileNode(node, ast);
    case ts.SyntaxKind.FunctionDeclaration:
      return createFunctionDeclarationNode(node, ast);
    case ts.SyntaxKind.VariableStatement:
      return createVariableStatementNode(node, ast);
    case ts.SyntaxKind.ClassDeclaration:
      return createClassDeclarationNode(node, ast);
    case ts.SyntaxKind.InterfaceDeclaration:
      return createInterfaceDeclarationNode(node, ast);
    case ts.SyntaxKind.Identifier:
      return ts.factory.createIdentifier(node.text || '');
    case ts.SyntaxKind.StringLiteral:
      return ts.factory.createStringLiteral(node.text || '');
    case ts.SyntaxKind.NumericLiteral:
      return ts.factory.createNumericLiteral(node.text || '0');
    case ts.SyntaxKind.TrueKeyword:
      return ts.factory.createTrue();
    case ts.SyntaxKind.FalseKeyword:
      return ts.factory.createFalse();
    case ts.SyntaxKind.StringKeyword:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    case ts.SyntaxKind.NumberKeyword:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
    case ts.SyntaxKind.AnyKeyword:
      return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
    case ts.SyntaxKind.AsyncKeyword:
      return ts.factory.createToken(ts.SyntaxKind.AsyncKeyword);
    case ts.SyntaxKind.AwaitKeyword:
      return ts.factory.createToken(ts.SyntaxKind.AwaitKeyword);
    case ts.SyntaxKind.ConstKeyword:
      return ts.factory.createToken(ts.SyntaxKind.ConstKeyword);
    case ts.SyntaxKind.VarKeyword:
      return ts.factory.createToken(ts.SyntaxKind.VarKeyword);
    case ts.SyntaxKind.LetKeyword:
      return ts.factory.createToken(ts.SyntaxKind.LetKeyword);
    case ts.SyntaxKind.ReturnStatement:
      return createReturnStatementNode(node, ast);
    case ts.SyntaxKind.IfStatement:
      return createIfStatementNode(node, ast);
    case ts.SyntaxKind.Block:
      return createBlockNode(node, ast);
    case ts.SyntaxKind.BinaryExpression:
      return createBinaryExpressionNode(node, ast);
    case ts.SyntaxKind.CallExpression:
      return createCallExpressionNode(node, ast);
    case ts.SyntaxKind.Parameter:
      return createParameterNode(node, ast);
    case ts.SyntaxKind.VariableDeclaration:
      return createVariableDeclarationNode(node, ast);
    case ts.SyntaxKind.VariableDeclarationList:
      return createVariableDeclarationListNode(node, ast);
    case ts.SyntaxKind.ObjectLiteralExpression:
      return createObjectLiteralExpressionNode(node, ast);
    case ts.SyntaxKind.PropertyAssignment:
      return createPropertyAssignmentNode(node, ast);
    case ts.SyntaxKind.ArrayLiteralExpression:
      return createArrayLiteralExpressionNode(node, ast);
    case ts.SyntaxKind.TypeReference:
      return createTypeReferenceNode(node, ast);
    case ts.SyntaxKind.PropertyDeclaration:
      return createPropertyDeclarationNode(node, ast);
    case ts.SyntaxKind.MethodDeclaration:
      return createMethodDeclarationNode(node, ast);
    case ts.SyntaxKind.Constructor:
      return createConstructorNode(node, ast);
    case ts.SyntaxKind.AsyncKeyword:
    case ts.SyntaxKind.PrivateKeyword:
    case ts.SyntaxKind.PublicKeyword:
    case ts.SyntaxKind.ProtectedKeyword:
    case ts.SyntaxKind.StaticKeyword:
    case ts.SyntaxKind.ReadonlyKeyword:
      return createModifierNode(node);
    case ts.SyntaxKind.SyntaxList:
      // SyntaxList nodes contain multiple statements/expressions
      // We need to process them individually, not as a single node
      throw new Error('SyntaxList nodes should be processed by their parent nodes, not directly');
    case ts.SyntaxKind.ExpressionStatement:
      return createExpressionStatementNode(node, ast);
    case ts.SyntaxKind.AwaitExpression:
      return createAwaitExpressionNode(node, ast);
    case ts.SyntaxKind.PropertyAccessExpression:
      return createPropertyAccessExpressionNode(node, ast);
    case ts.SyntaxKind.ParenthesizedExpression:
      return createParenthesizedExpressionNode(node, ast);
    case ts.SyntaxKind.PlusToken:
    case ts.SyntaxKind.MinusToken:
    case ts.SyntaxKind.AsteriskToken:
    case ts.SyntaxKind.SlashToken:
    case ts.SyntaxKind.EqualsToken:
    case ts.SyntaxKind.SemicolonToken:
    case ts.SyntaxKind.CommaToken:
    case ts.SyntaxKind.DotToken:
    case ts.SyntaxKind.OpenParenToken:
    case ts.SyntaxKind.CloseParenToken:
    case ts.SyntaxKind.OpenBraceToken:
    case ts.SyntaxKind.CloseBraceToken:
    case ts.SyntaxKind.OpenBracketToken:
    case ts.SyntaxKind.CloseBracketToken:
    case ts.SyntaxKind.ColonToken:
    case ts.SyntaxKind.LessThanToken:
    case ts.SyntaxKind.GreaterThanToken:
    case ts.SyntaxKind.FirstPunctuation:
    case ts.SyntaxKind.FirstStatement:
    case ts.SyntaxKind.FirstAssignment:
    case ts.SyntaxKind.FirstBinaryOperator:
      return createTokenNode(node);
    default:
      // 对于不支持的节点类型，返回一个占位符
      return ts.factory.createIdentifier(`/* Unsupported node type: ${ts.SyntaxKind[node.kind]} */`);
  }
}

// 导出辅助函数供其他模块使用
export { getModifiers, findChildByKind } from './utils'; 