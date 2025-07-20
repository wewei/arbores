#!/usr/bin/env bun

import * as ts from 'typescript';
import { join, relative, resolve } from 'path';
import { existsSync } from 'fs';

console.log('🌳 Arbores Dead Code Analyzer (TypeScript Edition)');
console.log('=================================================\n');

interface AnalyzeOptions {
  rootFiles: string[];
  projectRoot: string;
}

class TypeScriptDeadCodeAnalyzer {
  private options: AnalyzeOptions;
  private program: ts.Program;
  private usedFiles = new Set<string>();
  private allSourceFiles = new Set<string>();

  constructor(options: AnalyzeOptions) {
    this.options = {
      ...options,
      projectRoot: resolve(options.projectRoot)
    };
    
    console.log('🔧 Creating TypeScript program...');
    this.program = this.createProgram();
  }

  private createProgram(): ts.Program {
    // 基本的编译选项
    const compilerOptions: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      allowJs: true,
      skipLibCheck: true,
    };

    // 找到所有 TypeScript 文件，而不仅仅是根文件
    const allFiles = this.findAllSourceFiles();
    console.log(`📁 All TypeScript files found: ${allFiles.length}`);
    
    return ts.createProgram(allFiles, compilerOptions);
  }

  private findAllSourceFiles(): string[] {
    const files: string[] = [];
    this.scanDirectorySync(this.options.projectRoot, files, ['.ts', '.tsx'], undefined, true);
    return files;
  }

  private scanDirectorySync(
    dir: string, 
    files: string[], 
    extensions: string[], 
    filter?: (filename: string) => boolean,
    recursive: boolean = false
  ): void {
    try {
      const entries = require('fs').readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stats = require('fs').statSync(fullPath);
        
        if (stats.isDirectory()) {
          // 跳过某些目录
          if (['node_modules', '.git', 'dist', 'build'].includes(entry)) {
            continue;
          }
          if (recursive) {
            this.scanDirectorySync(fullPath, files, extensions, filter, recursive);
          }
        } else if (stats.isFile()) {
          const ext = require('path').extname(entry);
          if (extensions.includes(ext) && (!filter || filter(entry))) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // 忽略无法访问的目录
    }
  }

  private resolveRootFiles(): string[] {
    const resolvedFiles: string[] = [];
    
    for (const rootFile of this.options.rootFiles) {
      const absolutePath = resolve(this.options.projectRoot, rootFile);
      if (existsSync(absolutePath)) {
        resolvedFiles.push(absolutePath);
        console.log(`  ✓ ${rootFile}`);
      } else {
        console.log(`  ✗ ${rootFile} (not found)`);
      }
    }
    
    return resolvedFiles;
  }

  analyze(): void {
    console.log('\n🔍 Starting analysis...');
    
    // 获取所有源文件
    const sourceFiles = this.program.getSourceFiles();
    
    // 过滤出项目中的文件
    for (const sourceFile of sourceFiles) {
      if (this.isProjectFile(sourceFile.fileName)) {
        this.allSourceFiles.add(sourceFile.fileName);
      }
    }
    
    console.log(`📁 Found ${this.allSourceFiles.size} source files in project`);
    
    // 从根文件开始分析依赖
    const rootFiles = this.resolveRootFiles();
    for (const rootFile of rootFiles) {
      this.analyzeFileDependencies(rootFile);
    }
    
    // 计算结果
    const deadFiles = Array.from(this.allSourceFiles)
      .filter(file => !this.usedFiles.has(file))
      .sort();

    console.log(`\n📊 Analysis Results:`);
    console.log(`Total files: ${this.allSourceFiles.size}`);
    console.log(`Used files: ${this.usedFiles.size}`);
    console.log(`Dead files: ${deadFiles.length}`);
    
    if (deadFiles.length > 0) {
      console.log('\n🗑️  Dead files (candidates for removal):');
      for (const deadFile of deadFiles) {
        console.log(`  - ${relative(this.options.projectRoot, deadFile)}`);
      }
    } else {
      console.log('\n✅ No dead files found! Your codebase is clean.');
    }
  }

  private isProjectFile(fileName: string): boolean {
    const relativePath = relative(this.options.projectRoot, fileName);
    
    // 排除 node_modules 和内置库
    if (relativePath.includes('node_modules')) return false;
    if (fileName.includes('typescript/lib/')) return false;
    if (relativePath.startsWith('..')) return false;
    
    return true;
  }

  private analyzeFileDependencies(fileName: string): void {
    if (this.usedFiles.has(fileName)) {
      return;
    }
    
    this.usedFiles.add(fileName);
    
    const sourceFile = this.program.getSourceFile(fileName);
    if (!sourceFile) {
      return;
    }
    
    console.log(`  📄 ${relative(this.options.projectRoot, fileName)}`);
    
    // 获取依赖并递归分析
    const dependencies = this.getFileDependencies(sourceFile);
    for (const dependency of dependencies) {
      if (this.isProjectFile(dependency)) {
        this.analyzeFileDependencies(dependency);
      }
    }
  }

  private getFileDependencies(sourceFile: ts.SourceFile): string[] {
    const dependencies: string[] = [];
    
    const visit = (node: ts.Node) => {
      // 处理 import 和 export 语句
      if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier;
        if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
          const resolved = this.resolveModule(moduleSpecifier.text, sourceFile.fileName);
          if (resolved) {
            dependencies.push(resolved);
          }
        }
      }
      
      ts.forEachChild(node, visit);
    };
    
    visit(sourceFile);
    return dependencies;
  }

  private resolveModule(moduleName: string, fromFile: string): string | undefined {
    const result = ts.resolveModuleName(
      moduleName,
      fromFile,
      this.program.getCompilerOptions(),
      ts.sys
    );
    
    return result.resolvedModule?.resolvedFileName;
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // 解析根文件
  let rootFiles = ['index.ts', 'src/cli/index.ts'];
  
  const rootsIndex = args.findIndex(arg => arg === '--roots');
  if (rootsIndex >= 0 && rootsIndex + 1 < args.length && args[rootsIndex + 1]) {
    rootFiles = args[rootsIndex + 1]!.split(',');
  }

  const options: AnalyzeOptions = {
    rootFiles,
    projectRoot: process.cwd()
  };

  console.log(`🎯 Root files: ${rootFiles.join(', ')}`);
  
  const analyzer = new TypeScriptDeadCodeAnalyzer(options);
  analyzer.analyze();
}

function printHelp() {
  console.log(`
🌳 Arbores Dead Code Analyzer (TypeScript Edition)

Usage: bun run scripts/analyze-dead-code.ts [options]

This analyzer uses TypeScript's compiler API for accurate module resolution.

Options:
  --help, -h                Show this help message
  --roots <files>           Comma-separated list of root files
                           (default: index.ts,src/cli/index.ts)

Examples:
  # Use default configuration
  bun run scripts/analyze-dead-code.ts

  # Analyze with custom root files
  bun run scripts/analyze-dead-code.ts --roots "src/main.ts,src/cli/index.ts"

The analyzer will:
1. Create a TypeScript program with all .ts/.tsx files in the project
2. Start from the root files and follow all import/export dependencies  
3. Mark any files not reachable from the roots as "dead code"
4. Show a list of files that can potentially be removed

Note: Scripts, tests, and samples are often independent entry points
and may appear as "dead code" even if they're intentionally kept.
`);
}

main();
