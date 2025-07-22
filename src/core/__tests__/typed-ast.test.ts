/**
 * 类型化AST系统集成测试
 */
import { expect, test, describe } from 'bun:test';
import { parseCode } from '../parser';
import { isSuccess } from '../types';
import type { SourceFileAST, ASTNode } from '../types';
import type { IdentifierNode } from '../typed-ast/types/s080-identifier';
import { identifierFromASTNode } from '../typed-ast/converters/s080-identifier';

describe('Typed AST Integration Tests', () => {
  test('should generate base typed AST interfaces correctly', () => {
    // 测试基本的类型化节点结构
    const mockIdentifierNode: IdentifierNode = {
      id: 'test-id',
      kind: 80, // Identifier
    };

    expect(mockIdentifierNode.kind).toBe(80);
    expect(mockIdentifierNode.id).toBe('test-id');
  });

  test('should have converter functions available', () => {
    // 测试转换器函数是否存在
    expect(typeof identifierFromASTNode).toBe('function');
  });

  test('should parse code and potentially convert to typed AST', () => {
    const code = 'const x = 42;';
    const baseAST: SourceFileAST = {
      file_name: 'test.ts',
      versions: [],
      nodes: {}
    };
    
    const result = parseCode(code, baseAST);
    
    expect(result.success).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.ast).toBeDefined();
      expect(result.data.rootNodeId).toBeDefined();
      expect(result.data.stats).toBeDefined();
      
      // 检查AST节点
      const nodes = result.data.ast.nodes;
      expect(Object.keys(nodes).length).toBeGreaterThan(0);
      
      // 查找标识符节点
      const identifierNodes = Object.values(nodes).filter((node: ASTNode) => node.kind === 80);
      expect(identifierNodes.length).toBeGreaterThan(0);
    }
  });
});
