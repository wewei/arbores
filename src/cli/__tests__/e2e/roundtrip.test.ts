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
 * 递归比较两个 AST 节点（带 nodes map）
 */
function compareASTNodesRecursive(
  original: ASTNode,
  roundtrip: ASTNode,
  originalNodes: Record<string, ASTNode>,
  roundtripNodes: Record<string, ASTNode>,
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
    
    const originalChild = originalNodes[originalChildId];
    const roundtripChild = roundtripNodes[roundtripChildId];
    
    if (!originalChild || !roundtripChild) {
      differences.push({
        path: `${path}.children[${i}]`,
        original: originalChild ? 'exists' : 'undefined',
        roundtrip: roundtripChild ? 'exists' : 'undefined',
        reason: 'Child node not found in nodes map'
      });
      continue;
    }
    
    // 递归比较子节点
    const childPath = `${path}.children[${i}]`;
    const childResult = compareASTNodesRecursive(originalChild, roundtripChild, originalNodes, roundtripNodes, childPath);
    
    if (!childResult.match) {
      differences.push(...(childResult.differences || []));
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
    console.log('Original AST tree:');
    const originalTreeResult = executeArboresCommand(['tree', astFile]);
    if (originalTreeResult.success) {
      console.log(originalTreeResult.output);
    }
    
    console.log('\nRoundtrip AST tree:');
    const roundtripTreeResult = executeArboresCommand(['tree', roundtripAstFile]);
    if (roundtripTreeResult.success) {
      console.log(roundtripTreeResult.output);
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