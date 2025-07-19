import type { ParseOptions } from '../src/types';
import { parseFile, mergeAST } from '../src/parser';
import { readFile, writeFile, fileExists, getFormatFromPath, parseASTFile, stringifyASTData, type ASTFileFormat } from '../src/utils';
import * as ts from 'typescript';

export async function parseCommand(
  filePath: string, 
  options: { ast?: string; format?: string; dryRun?: boolean; override?: boolean; description?: string }
): Promise<void> {
  try {
    // 验证参数组合
    if (options.override && !options.ast) {
      console.error('Error: --override requires --ast to be specified');
      process.exit(1);
    }
    
    // 解析 TypeScript 文件
    const ast = await parseFile(filePath);
    
    // 确定控制台输出格式（优先级：-f > 默认JSON）
    let stdoutFormat: ASTFileFormat = 'json';
    if (options.format) {
      stdoutFormat = options.format as ASTFileFormat;
    }
    
    // 确定文件保存格式（优先级：-f > 扩展名 > 默认JSON）
    let fileFormat: ASTFileFormat = 'json';
    if (options.format) {
      fileFormat = options.format as ASTFileFormat;
    } else if (options.ast) {
      fileFormat = getFormatFromPath(options.ast);
    }
    
    // 如果指定了输出文件且不是 dry run 且有 override 标志
    if (options.ast && !options.dryRun && options.override) {
      if (await fileExists(options.ast)) {
        // 读取现有文件并合并
        const existingContent = await readFile(options.ast);
        // 根据现有文件格式解析
        const inputFormat = getFormatFromPath(options.ast);
        const existingAST = parseASTFile(existingContent, inputFormat);
        
        // 重新解析当前文件以获取 SourceFile 对象
        const sourceText = await readFile(filePath);
        const sourceFile = ts.createSourceFile(
          filePath,
          sourceText,
          ts.ScriptTarget.Latest,
          true
        );
        
        // 合并 AST
        const mergedAST = mergeAST(existingAST, sourceFile, options.description);
        
        // 写入合并后的 AST（保持输入文件的格式）
        await writeFile(options.ast, stringifyASTData(mergedAST, inputFormat));
        console.log(`AST merged into ${options.ast}`);
      } else {
        // 创建新文件
        await writeFile(options.ast, stringifyASTData(ast, fileFormat));
        console.log(`AST saved to ${options.ast}`);
      }
    }
    
    // 输出到 stdout（使用控制台输出格式）
    console.log(stringifyASTData(ast, stdoutFormat));
    
  } catch (error) {
    console.error('Error parsing file:', error);
    process.exit(1);
  }
} 