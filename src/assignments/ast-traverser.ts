/**
 * 作业2：AST节点遍历与目标定位
 * 实现AST遍历和if条件节点定位功能
 */

import * as ts from 'typescript';
import { processUser, testUsers } from './assignment2';

/**
 * 查找所有if语句的条件表达式节点
 * @param sourceFile AST根节点
 * @returns if条件节点数组
 */
export function findIfConditions(sourceFile: ts.SourceFile): ts.Expression[] {
  const conditions: ts.Expression[] = [];
  
  function traverse(node: ts.Node): void {
    // 检查是否是if语句
    if (node.kind === ts.SyntaxKind.IfStatement) {
      const ifStatement = node as ts.IfStatement;
      conditions.push(ifStatement.expression);
    }
    
    // 递归遍历子节点
    ts.forEachChild(node, traverse);
  }
  
  traverse(sourceFile);
  return conditions;
}

/**
 * 获取节点的代码文本
 * @param sourceFile AST根节点
 * @param node 目标节点
 * @returns 节点对应的代码文本
 */
export function getNodeText(sourceFile: ts.SourceFile, node: ts.Node): string {
  return node.getText(sourceFile);
}

/**
 * 分析if条件节点的详细信息
 * @param sourceFile AST根节点
 * @param conditions if条件节点数组
 * @returns 条件节点信息数组
 */
export function analyzeIfConditions(
  sourceFile: ts.SourceFile, 
  conditions: ts.Expression[]
): Array<{
  text: string;
  kind: string;
  position: { start: number; end: number };
}> {
  return conditions.map(condition => ({
    text: getNodeText(sourceFile, condition),
    kind: ts.SyntaxKind[condition.kind],
    position: {
      start: condition.getStart(sourceFile),
      end: condition.getEnd()
    }
  }));
}

/**
 * 主函数：演示AST遍历和节点定位功能
 */
export function main(): void {
  console.log('=== 作业2：AST节点遍历与目标定位 ===\n');
  
  // 获取测试代码
  const testCode = `
function processUser(user: { age: number; name: string }): string {
  if (user.age >= 18) {
    if (user.name.length > 0) {
      return "有效用户";
    } else {
      return "无效用户";
    }
  } else {
    return "未成年用户";
  }
}
  `.trim();
  
  try {
    // 解析代码
    console.log('1. 解析代码...');
    const sourceFile = ts.createSourceFile(
      'assignment2.ts',
      testCode,
      ts.ScriptTarget.Latest,
      true
    );
    
    // 查找if条件节点
    console.log('2. 查找if条件节点...');
    const conditions = findIfConditions(sourceFile);
    console.log(`   找到 ${conditions.length} 个if条件节点`);
    
    // 分析条件节点
    console.log('3. 分析条件节点:');
    const conditionInfo = analyzeIfConditions(sourceFile, conditions);
    conditionInfo.forEach((info, index) => {
      console.log(`   ${index + 1}. "${info.text}"`);
      console.log(`      类型: ${info.kind}`);
      console.log(`      位置: ${info.position.start}-${info.position.end}`);
    });
    
    // 测试函数调用
    console.log('\n4. 测试函数调用:');
    testUsers.forEach(user => {
      const result = processUser(user);
      console.log(`   processUser(${JSON.stringify(user)}) = "${result}"`);
    });
    
  } catch (error) {
    console.error('遍历失败:', error);
  }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
} 