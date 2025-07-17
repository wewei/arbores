import type { ParseOptions } from '../src/types';
import { parseFile, mergeAST } from '../src/parser';
import { readFile, writeFile, fileExists } from '../src/utils';
import * as ts from 'typescript';

export async function parseCommand(
  filePath: string, 
  options: { file?: string; dryRun?: boolean; description?: string }
): Promise<void> {
  try {
    // 解析 TypeScript 文件
    const ast = await parseFile(filePath);
    
    // 如果指定了输出文件且不是 dry run
    if (options.file && !options.dryRun) {
      // 检查输出文件是否已存在
      if (await fileExists(options.file)) {
        // 读取现有文件并合并
        const existingContent = await readFile(options.file);
        const existingAST = JSON.parse(existingContent);
        
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
        
        // 写入合并后的 AST
        await writeFile(options.file, JSON.stringify(mergedAST, null, 2));
        console.log(`AST merged into ${options.file}`);
      } else {
        // 创建新文件
        await writeFile(options.file, JSON.stringify(ast, null, 2));
        console.log(`AST saved to ${options.file}`);
      }
    }
    
    // 输出到 stdout
    console.log(JSON.stringify(ast, null, 2));
    
  } catch (error) {
    console.error('Error parsing file:', error);
    process.exit(1);
  }
} 