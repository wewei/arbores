/**
 * 作业1：AST解析器实现
 * 使用 TypeScript Compiler API 解析代码生成AST
 */

import * as ts from 'typescript';
import { validateAge } from './assignment1';

/**
 * 解析代码并生成AST
 * @param code 要解析的代码字符串
 * @param fileName 文件名
 * @returns AST根节点
 */
export function parseCode(code: string, fileName: string = 'test.ts'): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true
  );
}

/**
 * 分析AST基本信息
 * @param sourceFile AST根节点
 * @returns AST信息对象
 */
export function analyzeAST(sourceFile: ts.SourceFile): {
  fileName: string;
  nodeCount: number;
  hasErrors: boolean;
  errors: ts.Diagnostic[];
} {
  const errors: ts.Diagnostic[] = [];
  
  // 检查语法错误
  const program = ts.createProgram([sourceFile.fileName], {
    target: ts.ScriptTarget.Latest,
    module: ts.ModuleKind.CommonJS,
  });
  
  const diagnostics = program.getSyntacticDiagnostics(sourceFile);
  errors.push(...diagnostics);
  
  // 计算节点数量（简化版本）
  let nodeCount = 0;
  function countNodes(node: ts.Node): void {
    nodeCount++;
    ts.forEachChild(node, countNodes);
  }
  countNodes(sourceFile);
  
  return {
    fileName: sourceFile.fileName,
    nodeCount,
    hasErrors: errors.length > 0,
    errors
  };
}

/**
 * 主函数：演示AST解析功能
 */
export function main(): void {
  console.log('=== 作业1：AST解析基础 ===\n');
  
  // 获取测试代码
  const testCode = `
function validateAge(age: number): string {
  if (age >= 18) {
    return "成年人";
  } else {
    return "未成年人";
  }
}
  `.trim();
  
  try {
    // 解析代码
    console.log('1. 解析代码...');
    const sourceFile = parseCode(testCode, 'assignment1.ts');
    
    // 分析AST
    console.log('2. 分析AST...');
    const astInfo = analyzeAST(sourceFile);
    
    // 输出结果
    console.log('3. 解析结果:');
    console.log(`   - 文件名: ${astInfo.fileName}`);
    console.log(`   - 节点数量: ${astInfo.nodeCount}`);
    console.log(`   - 是否有语法错误: ${astInfo.hasErrors ? '是' : '否'}`);
    
    if (astInfo.errors.length > 0) {
      console.log('   - 错误信息:');
      astInfo.errors.forEach(error => {
        console.log(`     * ${error.messageText}`);
      });
    } else {
      console.log('   - 解析成功，无语法错误！');
    }
    
    // 测试函数调用
    console.log('\n4. 测试函数调用:');
    console.log(`   validateAge(20) = ${validateAge(20)}`);
    console.log(`   validateAge(15) = ${validateAge(15)}`);
    
  } catch (error) {
    console.error('解析失败:', error);
  }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
} 