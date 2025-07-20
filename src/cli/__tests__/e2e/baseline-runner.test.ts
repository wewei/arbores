/**
 * E2E Baseline Test Runner
 * 
 * 自动发现并运行基于基准文件的端到端测试
 */

import { describe, test, expect } from 'bun:test';
import { join } from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { executeCommand, normalizeOutput, type BaselineMetadata } from '../../../../scripts/generate-e2e-baseline';

// 基准测试目录
const BASELINES_DIR = join(__dirname, 'baselines');

/**
 * 发现所有基准测试文件
 */
function discoverBaselines(): Array<{
  path: string;
  testName: string;
  metadata: BaselineMetadata;
}> {
  const baselines: Array<{
    path: string;
    testName: string;
    metadata: BaselineMetadata;
  }> = [];

  if (!fs.existsSync(BASELINES_DIR)) {
    console.warn(`Baselines directory not found: ${BASELINES_DIR}`);
    return baselines;
  }

  // 递归搜索基准文件
  function searchDir(dir: string, prefix: string = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name);
      } else if (entry.name === 'metadata.yaml') {
        try {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const metadata = yaml.load(content) as BaselineMetadata;
          
          baselines.push({
            path: dir,
            testName: prefix || 'root',
            metadata
          });
        } catch (error) {
          console.warn(`Failed to parse baseline metadata: ${fullPath}`, error);
        }
      }
    }
  }

  searchDir(BASELINES_DIR);
  return baselines;
}

/**
 * 读取基准文件内容
 */
function readBaselineFile(baselinePath: string, filename: string): string | null {
  const filePath = join(baselinePath, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

/**
 * 比较输出内容，处理动态内容的差异
 */
function compareOutput(actual: string, expected: string): {
  matches: boolean;
  diff?: string;
} {
  // 基本字符串比较
  if (actual === expected) {
    return { matches: true };
  }

  // TODO: 实现更智能的差异比较
  // 可以考虑忽略空白字符差异、动态内容占位符等
  
  return {
    matches: false,
    diff: `Expected:\n${expected}\n\nActual:\n${actual}`
  };
}

/**
 * 运行单个基准测试
 */
async function runBaselineTest(
  testName: string, 
  baselinePath: string, 
  metadata: BaselineMetadata
): Promise<void> {
  // 执行命令
  const result = await executeCommand(metadata.command, metadata.environment);

  // 验证退出码
  expect(result.exitCode).toBe(metadata.exitCode);

  // 读取期望的输出
  const expectedStdout = readBaselineFile(baselinePath, 'stdout.txt');
  const expectedStderr = readBaselineFile(baselinePath, 'stderr.txt');

  // 标准化实际输出
  const actualStdout = normalizeOutput(result.stdout, metadata.environment.MOCK_TIMESTAMP);
  const actualStderr = normalizeOutput(result.stderr, metadata.environment.MOCK_TIMESTAMP);

  // 比较 stdout
  if (expectedStdout !== null) {
    const stdoutComparison = compareOutput(actualStdout, expectedStdout);
    if (!stdoutComparison.matches) {
      console.error('STDOUT mismatch for test:', testName);
      console.error(stdoutComparison.diff);
    }
    expect(stdoutComparison.matches).toBe(true);
  } else {
    // 期望没有 stdout 输出
    expect(actualStdout.trim()).toBe('');
  }

  // 比较 stderr
  if (expectedStderr !== null) {
    const stderrComparison = compareOutput(actualStderr, expectedStderr);
    if (!stderrComparison.matches) {
      console.error('STDERR mismatch for test:', testName);
      console.error(stderrComparison.diff);
    }
    expect(stderrComparison.matches).toBe(true);
  } else {
    // 期望没有 stderr 输出
    expect(actualStderr.trim()).toBe('');
  }
}

// 自动生成测试套件
describe('E2E Baseline Tests', () => {
  const baselines = discoverBaselines();
  
  if (baselines.length === 0) {
    test('no baselines found', () => {
      console.warn(`No baseline tests found in ${BASELINES_DIR}`);
      console.warn('Run the baseline generator to create test baselines');
      expect(true).toBe(true); // 确保测试通过但显示警告
    });
    return;
  }

  // 按命令分组测试
  const groupedBaselines = baselines.reduce((groups, baseline) => {
    const command = baseline.metadata.command[0];
    if (command) {
      if (!groups[command]) {
        groups[command] = [];
      }
      groups[command].push(baseline);
    }
    return groups;
  }, {} as Record<string, typeof baselines>);

  // 为每个命令创建测试组
  Object.entries(groupedBaselines).forEach(([command, commandBaselines]) => {
    describe(`${command} command`, () => {
      commandBaselines.forEach((baseline) => {
        test(`${baseline.testName}: ${baseline.metadata.description}`, async () => {
          await runBaselineTest(baseline.testName, baseline.path, baseline.metadata);
        }, {
          timeout: 30000 // 30秒超时
        });
      });
    });
  });
});

export { discoverBaselines, runBaselineTest, compareOutput };
