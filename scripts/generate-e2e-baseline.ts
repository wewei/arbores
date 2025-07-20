#!/usr/bin/env bun

/**
 * E2E Test Baseline Generator
 * 
 * 生成 CLI 命令的测试基准文件，用于端到端测试
 */

import { spawn } from 'bun';
import { join, dirname } from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';

// 命令行参数类型
interface GeneratorOptions {
  command: string[];
  width?: number;
  timestamp?: string;
  output: string;
  description?: string;
  update?: boolean;
}

// 基准元数据格式
interface BaselineMetadata {
  description: string;
  command: string[];
  exitCode: number;
  environment: {
    COLUMNS?: string;
    MOCK_TIMESTAMP?: string;
  };
  created: string;
  updated: string;
}

/**
 * 解析命令行参数
 */
function parseArgs(): GeneratorOptions {
  const args = process.argv.slice(2);
  const options: Partial<GeneratorOptions> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--command':
        if (!args[i + 1]) throw new Error('--command requires a value');
        // 解析命令字符串为数组
        options.command = args[i + 1]!.split(' ').filter(s => s.length > 0);
        i++;
        break;
        
      case '--width':
        if (!args[i + 1]) throw new Error('--width requires a value');
        options.width = parseInt(args[i + 1]!, 10);
        if (isNaN(options.width)) throw new Error('--width must be a number');
        i++;
        break;
        
      case '--timestamp':
        if (!args[i + 1]) throw new Error('--timestamp requires a value');
        options.timestamp = args[i + 1]!;
        i++;
        break;
        
      case '--output':
        if (!args[i + 1]) throw new Error('--output requires a value');
        options.output = args[i + 1]!;
        i++;
        break;
        
      case '--description':
        if (!args[i + 1]) throw new Error('--description requires a value');
        options.description = args[i + 1]!;
        i++;
        break;
        
      case '--update':
        options.update = true;
        break;
        
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }
  
  // 验证必需参数
  if (!options.command) {
    throw new Error('--command is required');
  }
  
  if (!options.output) {
    throw new Error('--output is required');
  }
  
  return options as GeneratorOptions;
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
E2E Test Baseline Generator

Usage:
  bun scripts/generate-e2e-baseline.ts [options]

Options:
  --command <cmd>      CLI command to execute (e.g., "parse file.ts --format json")
  --width <number>     Terminal width in columns (default: 80)
  --timestamp <iso>    Mock timestamp in ISO format (default: current time)
  --output <path>      Output directory for baseline files
  --description <text> Description for the test case
  --update             Update existing baseline (overwrite)
  --help, -h           Show this help message

Examples:
  # Generate baseline for parse command
  bun scripts/generate-e2e-baseline.ts \\
    --command "parse src/cli/__tests__/fixtures/simple.ts" \\
    --width 80 \\
    --timestamp "2025-01-01T00:00:00.000Z" \\
    --output src/cli/__tests__/e2e/baselines/parse/simple-json

  # Generate baseline with custom description
  bun scripts/generate-e2e-baseline.ts \\
    --command "tree /path/to/ast.json --comments" \\
    --width 40 \\
    --description "Tree command with narrow terminal and comments" \\
    --output src/cli/__tests__/e2e/baselines/tree/narrow-with-comments
`);
}

/**
 * 执行 CLI 命令并捕获输出
 */
async function executeCommand(
  command: string[], 
  environment: Record<string, string>
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  try {
    const proc = spawn({
      cmd: ['bun', 'src/cli/index.ts', ...command],
      env: {
        ...process.env,
        ...environment,
        // 确保在非交互模式下运行
        CI: 'true',
        TERM: 'dumb'
      },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const result = await proc.exited;
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    return {
      exitCode: result,
      stdout,
      stderr
    };
  } catch (error) {
    console.error('Failed to execute command:', error);
    throw error;
  }
}

/**
 * 标准化输出内容，替换动态部分为占位符
 */
function normalizeOutput(content: string, timestamp?: string): string {
  let normalized = content;
  
  // 只替换临时路径和项目路径，不替换时间戳和节点ID
  // 时间戳通过 MOCK_TIMESTAMP 环境变量控制，应该是确定性的
  // 节点ID基于内容哈希生成，对相同内容应该是稳定的
  
  // 替换临时路径
  const tempPathRegex = /\/(?:var\/folders|tmp)\/[^\/\s"]+(?:\/[^\/\s"]+)*/g;
  normalized = normalized.replace(tempPathRegex, '{{TEMP_PATH}}');
  
  // 替换文件路径（相对于项目根目录）
  const currentDir = process.cwd();
  const filePathRegex = new RegExp(currentDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  normalized = normalized.replace(filePathRegex, '{{PROJECT_ROOT}}');
  
  return normalized;
}

/**
 * 确保目录存在
 */
function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 保存基准文件
 */
async function saveBaseline(
  outputDir: string,
  metadata: BaselineMetadata,
  stdout: string,
  stderr: string,
  options: GeneratorOptions
): Promise<void> {
  // 确保输出目录存在
  ensureDirectory(outputDir);
  
  // 检查是否已存在且不是更新模式
  const metadataPath = join(outputDir, 'metadata.yaml');
  if (fs.existsSync(metadataPath) && !options.update) {
    throw new Error(`Baseline already exists at ${outputDir}. Use --update to overwrite.`);
  }
  
  // 保存元数据
  const yamlContent = yaml.dump(metadata, { 
    indent: 2,
    lineWidth: 100,
    quotingType: '"'
  });
  fs.writeFileSync(metadataPath, yamlContent, 'utf-8');
  
  // 保存 stdout（仅在有内容时）
  const stdoutPath = join(outputDir, 'stdout.txt');
  if (stdout.trim()) {
    const normalizedStdout = normalizeOutput(stdout, options.timestamp);
    fs.writeFileSync(stdoutPath, normalizedStdout, 'utf-8');
  } else {
    // 删除可能存在的空文件
    if (fs.existsSync(stdoutPath)) {
      fs.unlinkSync(stdoutPath);
    }
  }
  
  // 保存 stderr（仅在有内容时）
  const stderrPath = join(outputDir, 'stderr.txt');
  if (stderr.trim()) {
    const normalizedStderr = normalizeOutput(stderr, options.timestamp);
    fs.writeFileSync(stderrPath, normalizedStderr, 'utf-8');
  } else {
    // 删除可能存在的空文件
    if (fs.existsSync(stderrPath)) {
      fs.unlinkSync(stderrPath);
    }
  }
  
  console.log(`✅ Baseline saved to: ${outputDir}`);
  console.log(`   Command: ${metadata.command.join(' ')}`);
  console.log(`   Exit Code: ${metadata.exitCode}`);
  console.log(`   Stdout: ${stdout.trim() ? 'saved' : 'empty'}`);
  console.log(`   Stderr: ${stderr.trim() ? 'saved' : 'empty'}`);
}

/**
 * 生成默认描述
 */
function generateDescription(command: string[]): string {
  const cmd = command[0];
  const args = command.slice(1);
  
  let description = `Execute ${cmd} command`;
  
  // 添加主要参数信息
  if (args.includes('--format')) {
    const formatIndex = args.indexOf('--format');
    if (formatIndex + 1 < args.length) {
      description += ` with ${args[formatIndex + 1]} format`;
    }
  }
  
  if (args.includes('--verbose')) {
    description += ' in verbose mode';
  }
  
  if (args.includes('--comments')) {
    description += ' with comments';
  }
  
  return description;
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const options = parseArgs();
    
    console.log('🚀 Generating E2E test baseline...');
    console.log(`   Command: ${options.command.join(' ')}`);
    console.log(`   Output: ${options.output}`);
    
    // 设置环境变量
    const environment: Record<string, string> = {};
    
    if (options.width) {
      environment.COLUMNS = options.width.toString();
    }
    
    if (options.timestamp) {
      environment.MOCK_TIMESTAMP = options.timestamp;
    }
    
    // 执行命令
    console.log('⏳ Executing command...');
    const result = await executeCommand(options.command, environment);
    
    // 准备元数据
    const now = new Date().toISOString();
    const metadata: BaselineMetadata = {
      description: options.description || generateDescription(options.command),
      command: options.command,
      exitCode: result.exitCode,
      environment: {},
      created: now,
      updated: now
    };
    
    if (options.width) {
      metadata.environment.COLUMNS = options.width.toString();
    }
    
    if (options.timestamp) {
      metadata.environment.MOCK_TIMESTAMP = options.timestamp;
    }
    
    // 如果是更新模式，保留原始创建时间
    if (options.update) {
      const existingMetadataPath = join(options.output, 'metadata.yaml');
      if (fs.existsSync(existingMetadataPath)) {
        try {
          const existingContent = fs.readFileSync(existingMetadataPath, 'utf-8');
          const existingMetadata = yaml.load(existingContent) as BaselineMetadata;
          metadata.created = existingMetadata.created;
        } catch (error) {
          console.warn('Warning: Could not parse existing metadata, using current time as created date');
        }
      }
    }
    
    // 保存基准文件
    await saveBaseline(options.output, metadata, result.stdout, result.stderr, options);
    
    console.log('✨ Baseline generation completed!');
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

export { executeCommand, normalizeOutput, saveBaseline, type BaselineMetadata, type GeneratorOptions };
