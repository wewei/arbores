/**
 * Roundtrip E2E Test Runner
 * 
 * 验证 TypeScript 文件的 parse → stringify → token 比较的往返测试
 */

import { describe, test, expect } from 'bun:test';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../../core/types';
import { getSyntaxKindName } from '../../../core/syntax-kind-names';

/**
 * AST 节点比较结果
 */
type ASTComparisonResult = {
  match: boolean;
  differences?: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }>;
};

/**
 * 递归比较两个 AST 节点
 */
function compareASTNodes(
  original: ASTNode,
  roundtrip: ASTNode,
  path: string = 'root'
): ASTComparisonResult {
  const differences: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }> = [];

  // 比较节点类型
  if (original.kind !== roundtrip.kind) {
    differences.push({
      path,
      original: `${original.kind}: ${original.text || ''}`,
      roundtrip: `${roundtrip.kind}: ${roundtrip.text || ''}`,
      reason: 'Node kind mismatch'
    });
    return { match: false, differences };
  }

  // 比较子节点
  const originalChildren = original.children || [];
  const roundtripChildren = roundtrip.children || [];
  
  if (originalChildren.length !== roundtripChildren.length) {
    differences.push({
      path,
      original: `${originalChildren.length} children`,
      roundtrip: `${roundtripChildren.length} children`,
      reason: 'Child count mismatch'
    });
    return { match: false, differences };
  }

  // 递归比较子节点
  for (let i = 0; i < originalChildren.length; i++) {
    const originalChildId = originalChildren[i];
    const roundtripChildId = roundtripChildren[i];
    
    if (!originalChildId || !roundtripChildId) {
      differences.push({
        path: `${path}.children[${i}]`,
        original: originalChildId ? 'exists' : 'undefined',
        roundtrip: roundtripChildId ? 'exists' : 'undefined',
        reason: 'Child node missing'
      });
      continue;
    }
    
    // 注意：这里我们需要从外部传入 nodes map，暂时跳过子节点比较
    // 在实际使用中，我们需要修改函数签名来传递 nodes map
  }

  return {
    match: differences.length === 0,
    differences: differences.length > 0 ? differences : undefined
  };
}

/**
 * 比较两个完整的 AST
 */
function compareASTs(
  original: SourceFileAST,
  roundtrip: SourceFileAST
): ASTComparisonResult {
  const differences: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }> = [];

  // 比较根节点
  const originalRootId = original.versions[0]?.root_node_id;
  const roundtripRootId = roundtrip.versions[0]?.root_node_id;
  
  if (!originalRootId || !roundtripRootId) {
    differences.push({
      path: 'root',
      original: originalRootId ? 'exists' : 'undefined',
      roundtrip: roundtripRootId ? 'exists' : 'undefined',
      reason: 'Root node missing'
    });
    return { match: false, differences };
  }
  
  const originalRoot = original.nodes[originalRootId];
  const roundtripRoot = roundtrip.nodes[roundtripRootId];
  
  if (!originalRoot || !roundtripRoot) {
    differences.push({
      path: 'root',
      original: originalRoot ? 'exists' : 'undefined',
      roundtrip: roundtripRoot ? 'exists' : 'undefined',
      reason: 'Root node not found in nodes map'
    });
    return { match: false, differences };
  }
  
  // 递归比较根节点
  return compareASTNodesRecursive(originalRoot, roundtripRoot, original.nodes, roundtrip.nodes);
}

/**
 * 深度优先前序遍历比较两个 AST 节点（带 nodes map）
 */
function compareASTNodesRecursive(
  original: ASTNode,
  roundtrip: ASTNode,
  originalNodes: Record<string, ASTNode>,
  roundtripNodes: Record<string, ASTNode>,
  path: string = '/root'
): ASTComparisonResult {
  const differences: Array<{
    path: string;
    original: string;
    roundtrip: string;
    reason: string;
  }> = [];

  // 深度优先前序遍历：先比较当前节点，再比较子节点
  
  // 1. 比较当前节点的类型
  if (original.kind !== roundtrip.kind) {
    differences.push({
      path,
      original: `${original.kind}: ${original.text || ''}`,
      roundtrip: `${roundtrip.kind}: ${roundtrip.text || ''}`,
      reason: 'Node kind mismatch'
    });
    // 节点类型不同，直接返回，不继续比较子节点
    return { match: false, differences };
  }

  // 2. 比较子节点数量
  const originalChildren = original.children || [];
  const roundtripChildren = roundtrip.children || [];
  
  if (originalChildren.length !== roundtripChildren.length) {
    differences.push({
      path,
      original: `${originalChildren.length} children`,
      roundtrip: `${roundtripChildren.length} children`,
      reason: 'Child count mismatch'
    });
    // 子节点数量不同，直接返回，不继续比较子节点
    return { match: false, differences };
  }

  // 3. 深度优先前序遍历比较子节点
  for (let i = 0; i < originalChildren.length; i++) {
    const originalChildId = originalChildren[i];
    const roundtripChildId = roundtripChildren[i];
    
    if (!originalChildId || !roundtripChildId) {
      differences.push({
        path: `${path}/missing-child[${i}]`,
        original: originalChildId ? 'exists' : 'undefined',
        roundtrip: roundtripChildId ? 'exists' : 'undefined',
        reason: 'Child node missing'
      });
      // 子节点缺失，继续检查下一个子节点
      continue;
    }
    
    const originalChild = originalNodes[originalChildId];
    const roundtripChild = roundtripNodes[roundtripChildId];
    
    if (!originalChild || !roundtripChild) {
      differences.push({
        path: `${path}/child[${i}]`,
        original: originalChild ? 'exists' : 'undefined',
        roundtrip: roundtripChild ? 'exists' : 'undefined',
        reason: 'Child node not found in nodes map'
      });
      // 子节点未找到，继续检查下一个子节点
      continue;
    }
    
    // 构建子节点路径：/node-id(kind-code:kind-name)
    const childPath = `${path}/${originalChildId}(${originalChild.kind}:${getSyntaxKindName(originalChild.kind)})`;
    
    // 递归比较子节点（深度优先前序遍历）
    const childResult = compareASTNodesRecursive(originalChild, roundtripChild, originalNodes, roundtripNodes, childPath);
    
    if (!childResult.match) {
      // 子节点比较失败，收集差异并立即返回，不继续检查其他子节点
      differences.push(...(childResult.differences || []));
      return { match: false, differences };
    }
  }

  return {
    match: differences.length === 0,
    differences: differences.length > 0 ? differences : undefined
  };
}



/**
 * 执行 arbores 命令
 */
function executeArboresCommand(args: string[]): { success: boolean; output: string; error?: string } {
  try {
    const output = execSync(`bun run arbores ${args.join(' ')}`, { 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    return { success: true, output };
  } catch (error: any) {
    return { 
      success: false, 
      output: error.stdout || '', 
      error: error.stderr || error.message 
    };
  }
}

/**
 * 测试单个文件的 roundtrip
 */
function testRoundtrip(tsFile: string): void {
  const fileName = tsFile.split('/').pop()!.split('\\').pop()!;
  const baseName = fileName.replace('.ts', '');
  
  // 创建临时文件路径
  const tempDir = tmpdir();
  const astFile = join(tempDir, `${baseName}.ast.json`);
  const roundtripFile = join(tempDir, `${baseName}-roundtrip.ts`);
  const roundtripAstFile = join(tempDir, `${baseName}-roundtrip.ast.json`);
  
  console.log(`Testing roundtrip for ${fileName}...`);
  
  // 步骤1: 解析原始文件为 AST
  const parseResult = executeArboresCommand(['parse', tsFile, '--output', astFile]);
  if (!parseResult.success) {
    throw new Error(`Parse failed for ${fileName}: ${parseResult.error}`);
  }
  
  // 步骤2: 从 AST 生成代码
  const stringifyResult = executeArboresCommand(['stringify', astFile, '--format', 'readable', '--output', roundtripFile]);
  if (!stringifyResult.success) {
    throw new Error(`Stringify failed for ${fileName}: ${stringifyResult.error}`);
  }
  
  // 步骤3: 解析生成的代码为 AST
  const roundtripParseResult = executeArboresCommand(['parse', roundtripFile, '--output', roundtripAstFile]);
  if (!roundtripParseResult.success) {
    throw new Error(`Roundtrip parse failed for ${fileName}: ${roundtripParseResult.error}`);
  }
  
  // 步骤4: 比较 AST 结构
  const originalAST = JSON.parse(readFileSync(astFile, 'utf-8')) as SourceFileAST;
  const roundtripAST = JSON.parse(readFileSync(roundtripAstFile, 'utf-8')) as SourceFileAST;
  
  const comparison = compareASTs(originalAST, roundtripAST);
  
  if (!comparison.match) {
    console.log(`❌ Roundtrip failed for ${fileName}`);
    console.log('AST differences:');
    comparison.differences?.forEach(diff => {
      console.log(`  ${diff.path}: ${diff.reason}`);
      console.log(`    Original: ${diff.original}`);
      console.log(`    Roundtrip: ${diff.roundtrip}`);
    });
    
    // 显示树结构差异
    console.log('\nTree structure comparison:');
    
    // 收集所有差异路径和对应的节点ID
    const diffNodes = new Map<string, { originalId?: string; roundtripId?: string }>();
    
    comparison.differences?.forEach(diff => {
      // 从路径中提取节点ID
      const pathParts = diff.path.split('.');
      const nodeIndex = pathParts[pathParts.length - 1];
      
      // 尝试找到对应的节点ID
      if (nodeIndex && nodeIndex.includes('children[')) {
        const match = nodeIndex?.match(/children\[(\d+)\]/);
        if (match && match[1]) {
          const childIndex = parseInt(match[1]);
          const parentPath = pathParts.slice(0, -1).join('.');
          
          // 这里我们需要从AST中找到对应的节点ID
          // 暂时简化处理，只显示差异信息
          diffNodes.set(diff.path, {});
        }
      }
    });
    
    // 显示差异详情
    console.log('\nDetailed differences:');
    comparison.differences?.forEach(diff => {
      console.log(`\n--- ${diff.reason} at ${diff.path} ---`);
      console.log(`Original: ${diff.original}`);
      console.log(`Roundtrip: ${diff.roundtrip}`);
    });
    
    // 显示根节点的树结构对比（简化版本）
    console.log('\n--- Root level comparison ---');
    console.log('Original AST root:');
    const originalTreeResult = executeArboresCommand(['tree', astFile]);
    if (originalTreeResult.success) {
      // 只显示前几行，避免输出过多
      const lines = originalTreeResult.output.split('\n').slice(0, 20);
      console.log(lines.join('\n'));
      if (originalTreeResult.output.split('\n').length > 20) {
        console.log('... (truncated)');
      }
    }
    
    console.log('\nRoundtrip AST root:');
    const roundtripTreeResult = executeArboresCommand(['tree', roundtripAstFile]);
    if (roundtripTreeResult.success) {
      // 只显示前几行，避免输出过多
      const lines = roundtripTreeResult.output.split('\n').slice(0, 20);
      console.log(lines.join('\n'));
      if (roundtripTreeResult.output.split('\n').length > 20) {
        console.log('... (truncated)');
      }
    }
    
    throw new Error(`Roundtrip failed for ${fileName}: AST structure mismatch`);
  }
  
  console.log(`✅ Roundtrip passed for ${fileName}`);
}

/**
 * 发现测试文件
 */
function discoverTestFiles(): string[] {
  const fixturesDir = 'src/cli/__tests__/fixtures';
  const files = [
    'simple.ts',
    'function-test.ts',
    'class-test.ts',
    'generics-test.ts',
    'advanced-features.ts',
    'complex.ts',
    'statements-test.ts',
    'enum-test.ts',
    'export-test.ts',
    'export-simple.ts'
  ];
  
  return files.map(file => `${fixturesDir}/${file}`);
}

describe('Roundtrip Tests', () => {
  const testFiles = discoverTestFiles();
  
  for (const testFile of testFiles) {
    test(`Roundtrip: ${testFile.split('/').pop()}`, () => {
      console.log(`Starting test for ${testFile}...`);
      testRoundtrip(testFile);
    });
  }
});