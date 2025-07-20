/**
 * CLI E2E Testing Utilities
 * 
 * Utilities for testing CLI commands in a controlled environment
 */

import { spawn, type Subprocess } from 'bun';
import { join } from 'path';
import * as fs from 'fs';
import * as os from 'os';

// 测试结果接口
export interface CLIResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

// 测试选项
export interface CLITestOptions {
  cwd?: string;
  env?: Record<string, string>;
  terminalSize?: {
    columns?: number;
    rows?: number;
  };
  timeout?: number; // milliseconds
}

/**
 * 执行CLI命令并返回结果
 */
export async function runCLI(
  args: string[], 
  options: CLITestOptions = {}
): Promise<CLIResult> {
  const startTime = Date.now();
  
  const {
    cwd = process.cwd(),
    env = {},
    terminalSize = { columns: 80, rows: 24 },
    timeout = 30000
  } = options;

  // 设置环境变量
  const testEnv = {
    ...process.env,
    ...env,
    // 设置终端尺寸
    COLUMNS: terminalSize.columns?.toString() || '80',
    LINES: terminalSize.rows?.toString() || '24',
    // 确保在非交互模式下运行
    CI: 'true',
    TERM: 'dumb'
  };

  try {
    const proc = spawn({
      cmd: ['bun', 'src/cli/index.ts', ...args],
      cwd,
      env: testEnv,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // 设置超时
    const timeoutId = setTimeout(() => {
      proc.kill('SIGTERM');
    }, timeout);

    const result = await proc.exited;
    clearTimeout(timeoutId);

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    
    return {
      exitCode: result,
      stdout,
      stderr,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      exitCode: -1,
      stdout: '',
      stderr: error instanceof Error ? error.message : String(error),
      duration: Date.now() - startTime
    };
  }
}

/**
 * 创建临时文件
 */
export function createTempFile(content: string, extension: string = '.ts'): string {
  const tempDir = fs.mkdtempSync(join(os.tmpdir(), 'arbores-test-'));
  const fileName = `test-${Date.now()}${extension}`;
  const filePath = join(tempDir, fileName);
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  // 记录文件以便清理
  tempFiles.add(filePath);
  tempDirs.add(tempDir);
  
  return filePath;
}

/**
 * 创建临时目录
 */
export function createTempDir(): string {
  const tempDir = fs.mkdtempSync(join(os.tmpdir(), 'arbores-test-'));
  tempDirs.add(tempDir);
  return tempDir;
}

// 临时文件和目录追踪
const tempFiles = new Set<string>();
const tempDirs = new Set<string>();

/**
 * 清理所有临时文件和目录
 */
export function cleanupTempFiles(): void {
  // 删除临时文件
  for (const filePath of tempFiles) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to delete temp file ${filePath}:`, error);
    }
  }
  tempFiles.clear();

  // 删除临时目录
  for (const dirPath of tempDirs) {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn(`Failed to delete temp directory ${dirPath}:`, error);
    }
  }
  tempDirs.clear();
}

/**
 * 验证JSON输出
 */
export function parseJSONOutput(output: string): any {
  try {
    return JSON.parse(output.trim());
  } catch (error) {
    throw new Error(`Invalid JSON output: ${output}\nError: ${error}`);
  }
}

/**
 * 验证YAML输出
 */
export function parseYAMLOutput(output: string): any {
  const yaml = require('js-yaml');
  try {
    return yaml.load(output.trim());
  } catch (error) {
    throw new Error(`Invalid YAML output: ${output}\nError: ${error}`);
  }
}

/**
 * 断言CLI命令成功执行
 */
export function expectSuccess(result: CLIResult, message?: string): void {
  if (result.exitCode !== 0) {
    const errorMsg = message || 'Expected command to succeed';
    throw new Error(
      `${errorMsg}\nExit code: ${result.exitCode}\nStderr: ${result.stderr}\nStdout: ${result.stdout}`
    );
  }
}

/**
 * 断言CLI命令执行失败
 */
export function expectFailure(result: CLIResult, expectedExitCode?: number): void {
  if (result.exitCode === 0) {
    throw new Error(
      `Expected command to fail but it succeeded\nStdout: ${result.stdout}`
    );
  }
  
  if (expectedExitCode !== undefined && result.exitCode !== expectedExitCode) {
    throw new Error(
      `Expected exit code ${expectedExitCode} but got ${result.exitCode}\nStderr: ${result.stderr}`
    );
  }
}

/**
 * 验证输出包含指定文本
 */
export function expectOutputContains(result: CLIResult, text: string): void {
  if (!result.stdout.includes(text)) {
    throw new Error(
      `Expected output to contain "${text}"\nActual output: ${result.stdout}`
    );
  }
}

/**
 * 验证文件存在
 */
export function expectFileExists(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Expected file to exist: ${filePath}`);
  }
}

/**
 * 读取文件内容
 */
export function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * 获取 fixture 文件的绝对路径
 */
export function getFixturePath(fileName: string): string {
  // Use import.meta.url to get current file directory in modern environments
  const currentDir = new URL('.', import.meta.url).pathname;
  return join(currentDir, 'fixtures', fileName);
}

/**
 * 读取 fixture 文件内容
 */
export function readFixture(fileName: string): string {
  const fixturePath = getFixturePath(fileName);
  return readFile(fixturePath);
}

/**
 * 从 fixture 创建临时文件
 */
export function createTempFileFromFixture(fixtureName: string, extension?: string): string {
  const fixtureContent = readFixture(fixtureName);
  let ext = extension;
  
  if (!ext) {
    // Extract extension from fixture name, ensuring it includes the dot
    const parts = fixtureName.split('.');
    if (parts.length > 1) {
      ext = '.' + parts.pop();
    } else {
      ext = '.ts'; // default
    }
  }
  
  return createTempFile(fixtureContent, ext);
}
