/**
 * 作业3：约束信息提取
 * 从目标节点中提取自由变量（含类型）和节点类型约束
 */

import * as ts from 'typescript';
import { calculateDiscount, testCases } from './assignment3';

/**
 * 变量信息类型
 */
type VariableInfo = {
  name: string;
  type: string;
  position: { start: number; end: number };
};

/**
 * 约束信息类型
 */
type ConstraintInfo = {
  variables: VariableInfo[];
  nodeType: string;
  originalCode: string;
  returnType: string;
};

/**
 * 提取表达式中的自由变量
 * @param node 目标节点
 * @param typeChecker 类型检查器
 * @param sourceFile 源文件
 * @returns 变量信息数组
 */
export function extractFreeVariables(
  node: ts.Expression,
  typeChecker: ts.TypeChecker,
  sourceFile: ts.SourceFile
): VariableInfo[] {
  const variables: VariableInfo[] = [];
  
  function collectVariables(n: ts.Node): void {
    if (n.kind === ts.SyntaxKind.Identifier) {
      const identifier = n as ts.Identifier;
      const symbol = typeChecker.getSymbolAtLocation(identifier);
      
      if (symbol) {
        const type = typeChecker.getTypeAtLocation(identifier);
        const typeString = typeChecker.typeToString(type);
        
        variables.push({
          name: identifier.text,
          type: typeString,
          position: {
            start: identifier.getStart(sourceFile),
            end: identifier.getEnd()
          }
        });
      }
    }
    
    ts.forEachChild(n, collectVariables);
  }
  
  collectVariables(node);
  
  // 去重
  const uniqueVariables = variables.filter((v, index, self) => 
    index === self.findIndex(item => item.name === v.name)
  );
  
  return uniqueVariables;
}

/**
 * 获取节点类型约束
 * @param node 目标节点
 * @param typeChecker 类型检查器
 * @returns 节点类型约束信息
 */
export function getNodeTypeConstraint(
  node: ts.Expression,
  typeChecker: ts.TypeChecker
): { nodeType: string; returnType: string } {
  const type = typeChecker.getTypeAtLocation(node);
  const typeString = typeChecker.typeToString(type);
  
  return {
    nodeType: ts.SyntaxKind[node.kind],
    returnType: typeString
  };
}

/**
 * 提取完整的约束信息
 * @param sourceFile 源文件
 * @param targetNode 目标节点
 * @param typeChecker 类型检查器
 * @returns 约束信息
 */
export function extractConstraintInfo(
  sourceFile: ts.SourceFile,
  targetNode: ts.Expression,
  typeChecker: ts.TypeChecker
): ConstraintInfo {
  const variables = extractFreeVariables(targetNode, typeChecker, sourceFile);
  const typeConstraint = getNodeTypeConstraint(targetNode, typeChecker);
  
  return {
    variables,
    nodeType: typeConstraint.nodeType,
    originalCode: targetNode.getText(sourceFile),
    returnType: typeConstraint.returnType
  };
}

/**
 * 主函数：演示约束信息提取功能
 */
export function main(): void {
  console.log('=== 作业3：约束信息提取 ===\n');
  
  // 获取测试代码
  const testCode = `
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
    // 创建程序
    console.log('1. 创建TypeScript程序...');
    const program = ts.createProgram(['assignment3.ts'], {
      target: ts.ScriptTarget.Latest,
      module: ts.ModuleKind.CommonJS,
    });
    
    const sourceFile = program.getSourceFile('assignment3.ts') || 
      ts.createSourceFile('assignment3.ts', testCode, ts.ScriptTarget.Latest, true);
    
    const typeChecker = program.getTypeChecker();
    
    // 查找if条件节点
    console.log('2. 查找if条件节点...');
    const conditions: ts.Expression[] = [];
    
    function findConditions(node: ts.Node): void {
      if (node.kind === ts.SyntaxKind.IfStatement) {
        const ifStatement = node as ts.IfStatement;
        conditions.push(ifStatement.expression);
      }
      ts.forEachChild(node, findConditions);
    }
    
    findConditions(sourceFile);
    
    // 提取约束信息
    console.log('3. 提取约束信息:');
    conditions.forEach((condition, index) => {
      console.log(`\n   条件 ${index + 1}: "${condition.getText(sourceFile)}"`);
      
      const constraintInfo = extractConstraintInfo(sourceFile, condition, typeChecker);
      
      console.log(`   节点类型: ${constraintInfo.nodeType}`);
      console.log(`   返回类型: ${constraintInfo.returnType}`);
      console.log(`   变量信息:`);
      constraintInfo.variables.forEach(variable => {
        console.log(`     - ${variable.name}: ${variable.type} (位置: ${variable.position.start}-${variable.position.end})`);
      });
    });
    
    // 测试函数调用
    console.log('\n4. 测试函数调用:');
    testCases.forEach(testCase => {
      const result = calculateDiscount(testCase.price, testCase.isVip, testCase.age);
      console.log(`   calculateDiscount(${testCase.price}, ${testCase.isVip}, ${testCase.age}) = ${result}`);
    });
    
  } catch (error) {
    console.error('约束提取失败:', error);
  }
}

// 如果直接运行此文件，执行主函数
if (require.main === module) {
  main();
} 