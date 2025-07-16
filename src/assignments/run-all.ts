/**
 * 运行所有作业的脚本
 * 用于测试和演示所有作业的功能
 */

import { main as runAssignment1 } from './ast-parser';
import { main as runAssignment2 } from './ast-traverser';
import { main as runAssignment3 } from './constraint-extractor';
import { main as runAssignment4 } from './ai-mock';
import { main as runAssignment5 } from './ast-transformer';

/**
 * 运行所有作业
 */
async function runAllAssignments(): Promise<void> {
  console.log('🚀 开始运行所有作业...\n');
  
  const assignments = [
    { name: '作业1: AST解析基础', runner: runAssignment1 },
    { name: '作业2: AST节点遍历与目标定位', runner: runAssignment2 },
    { name: '作业3: 约束信息提取', runner: runAssignment3 },
    { name: '作业4: AI代码生成模拟', runner: runAssignment4 },
    { name: '作业5: AST节点替换与新代码生成', runner: runAssignment5 }
  ];
  
  for (let i = 0; i < assignments.length; i++) {
    const assignment = assignments[i];
    if (!assignment) continue;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 ${assignment.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      assignment.runner();
      console.log(`✅ ${assignment.name} 运行成功`);
    } catch (error) {
      console.error(`❌ ${assignment.name} 运行失败:`, error);
    }
    
    // 在作业之间添加一些间隔
    if (i < assignments.length - 1) {
      console.log('\n' + '-'.repeat(40));
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 所有作业运行完成！');
  console.log(`${'='.repeat(60)}`);
}

// 如果直接运行此文件，执行所有作业
if (require.main === module) {
  runAllAssignments().catch(console.error);
} 