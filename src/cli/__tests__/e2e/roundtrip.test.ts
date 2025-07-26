/**
 * Roundtrip E2E Test Runner - Curated Test Suite
 * 
 * 验证精选的 TypeScript 文件的完整往返测试：
 * 1. 原始文件 → 原始 AST JSON
 * 2. 原始 AST JSON → roundtrip 代码
 * 3. roundtrip 代码 → roundtrip AST JSON
 * 4. 比较原始 AST 和 roundtrip AST
 */

import { describe, test, expect } from 'bun:test';
import { testSingleRoundtrip } from './roundtrip-utils';
import * as fs from 'fs';
import { join } from 'path';

/**
 * 发现测试文件
 * 从 fixtures 文件夹自动读取所有 .ts 文件
 */
function discoverTestFiles(): string[] {
  const fixturesDir = 'src/cli/__tests__/fixtures';
  
  try {
    const files = fs.readdirSync(fixturesDir);
    const tsFiles = files
      .filter(file => file.endsWith('.ts'))
      .sort(); // 按字母顺序排序
    
    return tsFiles.map(file => `${fixturesDir}/${file}`);
  } catch (error) {
    console.error(`Error reading fixtures directory: ${error}`);
    return [];
  }
}

/**
 * 已知问题文件（暂时跳过的文件）
 */
const knownIssues = new Set<string>([
  'complex.ts', // JSDoc子节点问题 - 已知issue，之后修复
  // 'optional-chain-test.ts', // 双重可选链问题 - 需要修复CallExpression处理 (暂时取消跳过来测试修复)
]);

describe('Roundtrip Tests - Curated Suite', () => {
  const testFiles = discoverTestFiles();
  
  for (const testFile of testFiles) {
    const fileName = testFile.split('/').pop() || '';
    
    if (knownIssues.has(fileName)) {
      test.skip(`Roundtrip: ${fileName} (known issue)`, () => {
        // Skipped due to known issues
      });
    } else {
      test(`Roundtrip: ${fileName}`, () => {
        testSingleRoundtrip(testFile, { verbose: true });
      });
    }
  }
});
