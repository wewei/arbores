/**
 * 作业5：AST节点替换与新代码生成
 * 将AI生成的代码转为AST节点，替换原节点并生成完整代码
 */

import * as ts from 'typescript';
import { calculateDiscount, testCases, expectedModifications } from './assignment5';

/**
 * 解析代码片段为AST表达式节点
 * @param code 代码片段
 * @returns 表达式节点
 */
export function parseExpression(code: string): ts.Expression {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    `const temp = ${code};`,
    ts.ScriptTarget.Latest,
    true
  );
  
  // 查找变量声明语句
  let expression: ts.Expression | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (node.kind === ts.SyntaxKind.VariableStatement) {
      const varStatement = node as ts.VariableStatement;
      const varDecl = varStatement.declarationList.declarations[0];
      if (varDecl && varDecl.initializer) {
        expression = varDecl.initializer;
      }
    }
  });
  
  if (!expression) {
    throw new Error('无法解析表达式');
  }
  
  return expression;
}

/**
 * 替换if语句的条件表达式
 * @param sourceFile 源文件
 * @param ifStatement 要修改的if语句
 * @param newCondition 新的条件表达式
 * @returns 修改后的if语句
 */
export function replaceIfCondition(
  sourceFile: ts.SourceFile,
  ifStatement: ts.IfStatement,
  newCondition: ts.Expression
): ts.IfStatement {
  return ts.factory.updateIfStatement(
    ifStatement,
    newCondition,
    ifStatement.thenStatement,
    ifStatement.elseStatement
  );
}

/**
 * 替换源文件中的if语句
 * @param sourceFile 源文件
 * @param ifStatements 要替换的if语句数组
 * @param newConditions 新的条件表达式数组
 * @returns 修改后的源文件
 */
export function replaceIfStatements(
  sourceFile: ts.SourceFile,
  ifStatements: ts.IfStatement[],
  newConditions: ts.Expression[]
): ts.SourceFile {
  const transformer = (context: ts.TransformationContext) => {
    return (rootNode: ts.Node) => {
      function visit(node: ts.Node): ts.Node {
        // 检查是否是我们要替换的if语句
        const ifIndex = ifStatements.findIndex(stmt => stmt === node);
        if (ifIndex !== -1 && newConditions[ifIndex]) {
          const ifStatement = node as ts.IfStatement;
          return replaceIfCondition(sourceFile, ifStatement, newConditions[ifIndex]);
        }
        
        return ts.visitEachChild(node, visit, context);
      }
      
      return ts.visitNode(rootNode, visit);
    };
  };
  
  return ts.transform(sourceFile, [transformer]).transformed[0] as ts.SourceFile;
}

/**
 * 将AST转换为代码文本
 * @param sourceFile 源文件
 * @returns 代码文本
 */
export function printCode(sourceFile: ts.SourceFile): string {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false
  });
  
  return printer.printFile(sourceFile);
}

/**
 * 主函数：演示AST节点替换功能
 */
export function main(): void {
  console.log('=== 作业5：AST节点替换与新代码生成 ===\n');
  
  // 原始代码
  const originalCode = `
function calculateDiscount(price: number, isVip: boolean, age: number): number {
  let discount = 0;
  if (price > 100 && isVip) {
    discount = 0.2;
  } else if (age < 25) {
    discount = 0.1;
  }
  return price * (1 - discount);
}
  `.trim();
  
  try {
    // 解析原始代码
    console.log('1. 解析原始代码...');
    const sourceFile = ts.createSourceFile(
      'assignment5.ts',
      originalCode,
      ts.ScriptTarget.Latest,
      true
    );
    
    // 查找所有if语句
    console.log('2. 查找if语句...');
    const ifStatements: ts.IfStatement[] = [];
    ts.forEachChild(sourceFile, (node) => {
      if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
        const funcDecl = node as ts.FunctionDeclaration;
        if (funcDecl.body) {
          ts.forEachChild(funcDecl.body, (stmt) => {
            if (stmt.kind === ts.SyntaxKind.IfStatement) {
              ifStatements.push(stmt as ts.IfStatement);
            }
          });
        }
      }
    });
    
    console.log(`   找到 ${ifStatements.length} 个if语句`);
    
    // 解析新的条件表达式
    console.log('3. 解析新的条件表达式...');
    const newConditions: ts.Expression[] = [];
    expectedModifications.forEach((modification, index) => {
      if (index < ifStatements.length) {
        const condition = parseExpression(modification);
        newConditions.push(condition);
        console.log(`   ${index + 1}. "${modification}" -> 解析成功`);
      }
    });
    
    // 替换if语句
    console.log('4. 替换if语句...');
    const modifiedSourceFile = replaceIfStatements(sourceFile, ifStatements, newConditions);
    
    // 生成新代码
    console.log('5. 生成新代码...');
    const newCode = printCode(modifiedSourceFile);
    
    console.log('\n6. 修改结果:');
    console.log('原始代码:');
    console.log(originalCode);
    console.log('\n修改后代码:');
    console.log(newCode);
    
    // 测试修改后的函数
    console.log('\n7. 测试修改后的函数:');
    testCases.forEach((testCase, index) => {
      const result = calculateDiscount(testCase.price, testCase.isVip, testCase.age);
      console.log(`   calculateDiscount(${testCase.price}, ${testCase.isVip}, ${testCase.age}) = ${result}`);
    });
    
  } catch (error) {
    console.error('AST转换失败:', error);
  }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
} 