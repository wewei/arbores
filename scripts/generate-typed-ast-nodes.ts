#!/usr/bin/env bun

import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import { toCamelCase, toKebabCase } from '../src/core/utils/string-case';
import syntaxKindNames from '../src/core/syntax-kind-names.json';

// 格式化SyntaxKind代码为3位数字
function formatSyntaxKindCode(code: number): string {
  return code.toString().padStart(3, '0');
}

// 生成类型文件内容
function generateTypeFile(syntaxKind: string, code: number): string {
  const nodeTypeName = `${syntaxKind}Node`;
  
  return `/**
 * ${syntaxKind} AST Node
 * SyntaxKind: ${code}
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改属性定义，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import type { BaseTypedNode } from '../base';

export interface ${nodeTypeName} extends BaseTypedNode {
  kind: ${code}; // ${syntaxKind}
  
  // TODO: 添加${syntaxKind}特定属性
  // 注意：不要使用text, children, properties等通用字段
  // 而是定义具体的强类型属性，如：
  // - value: string (for literals)
  // - name: string (for declarations)  
  // - parameters: ParameterNode[] (for functions)
}

/**
 * 类型判定函数
 */
export function is${syntaxKind}(node: BaseTypedNode): node is ${nodeTypeName} {
  return node.kind === ${code};
}
`;
}

// 生成转换器文件内容
function generateConverterFile(syntaxKind: string, code: number): string {
  const nodeTypeName = `${syntaxKind}Node`;
  const camelCaseName = toCamelCase(syntaxKind);
  const kebabCaseName = toKebabCase(syntaxKind);
  
  return `/**
 * ${syntaxKind} 转换器
 * SyntaxKind: ${code}
 * 
 * ⚠️ 警告：此文件由生成器自动生成
 * 如需修改转换逻辑，请手动编辑此文件
 * 如需重新生成，请使用 -f 参数强制覆盖
 */

import * as ts from 'typescript';
import type { ASTNode } from '../../types';
import type { ${nodeTypeName} } from '../types/s${formatSyntaxKindCode(code)}-${kebabCaseName}';

/**
 * 从通用ASTNode转换为类型化${syntaxKind}Node
 */
export function ${camelCaseName}FromASTNode(node: ASTNode): ${nodeTypeName} {
  // TODO: 实现转换逻辑
  return {
    ...node,
    kind: ${code}
  } as ${nodeTypeName};
}

/**
 * 从类型化${syntaxKind}Node转换为通用ASTNode
 */
export function ${camelCaseName}ToASTNode(node: ${nodeTypeName}): ASTNode {
  // TODO: 实现转换逻辑
  // 将类型化节点的强类型属性转换回通用ASTNode结构
  return {
    id: node.id,
    kind: node.kind,
    // TODO: 根据具体节点类型映射属性
    // text: node.value || node.name || ...,
    // children: [...],
    leadingComments: node.leadingComments,
    trailingComments: node.trailingComments
  };
}

/**
 * 从TypeScript编译器节点转换为类型化${syntaxKind}Node
 */
export function ${camelCaseName}FromTsNode(tsNode: ts.Node, nodeId: string): ${nodeTypeName} {
  // TODO: 实现从TypeScript AST节点的转换
  return {
    id: nodeId,
    kind: ${code},
    // TODO: 根据具体节点类型映射TypeScript节点属性到强类型属性
    // 例如：value: tsNode.text, name: tsNode.name?.getText(), 等
  } as ${nodeTypeName};
}

/**
 * 从类型化${syntaxKind}Node转换为TypeScript编译器节点
 */
export function ${camelCaseName}ToTsNode(node: ${nodeTypeName}): ts.Node {
  // TODO: 实现转换为TypeScript AST节点
  // 注意：这个转换可能需要创建新的TypeScript节点
  // 可以使用 TypeScript 工厂函数或者其他方式
  throw new Error('${camelCaseName}ToTsNode not implemented yet');
}
`;
}

// 创建基础类型文件
function createBaseTypes(): void {
  const baseTypesPath = path.join(process.cwd(), 'src/core/typed-ast/base.ts');
  
  const baseTypesContent = `/**
 * 基础AST节点类型
 * 
 * ⚠️ 警告：此文件由生成器自动生成，请勿手动修改！
 * 如需修改，请编辑 scripts/generate-typed-ast-nodes.ts 中的 createBaseTypes() 函数
 */

import type { CommentInfo } from '../types';

/**
 * 类型化AST节点基类
 * 仅保留必要的标识信息，移除通用字段如text、children、properties
 * 这些信息应该通过具体节点类型的强类型属性来表达
 */
export interface BaseTypedNode {
  id: string;
  kind: number;
  leadingComments?: CommentInfo[];
  trailingComments?: CommentInfo[];
}
`;

  fs.writeFileSync(baseTypesPath, baseTypesContent);
  console.log(`✅ 创建基础类型文件: ${baseTypesPath}`);
}

// 清理生成的文件
function clearGeneratedFiles(): void {
  const baseTypesPath = path.join(process.cwd(), 'src/core/typed-ast/base.ts');
  const typesDir = path.join(process.cwd(), 'src/core/typed-ast/types');
  const convertersDir = path.join(process.cwd(), 'src/core/typed-ast/converters');
  
  console.log('🧹 清理生成的文件...');
  
  // 删除 base.ts
  if (fs.existsSync(baseTypesPath)) {
    fs.unlinkSync(baseTypesPath);
    console.log(`🗑️  删除: base.ts`);
  }
  
  // 删除 types 目录下的所有 .ts 文件
  if (fs.existsSync(typesDir)) {
    const typeFiles = fs.readdirSync(typesDir).filter(file => file.endsWith('.ts'));
    for (const file of typeFiles) {
      fs.unlinkSync(path.join(typesDir, file));
      console.log(`🗑️  删除: types/${file}`);
    }
  }
  
  // 删除 converters 目录下的所有 .ts 文件
  if (fs.existsSync(convertersDir)) {
    const converterFiles = fs.readdirSync(convertersDir).filter(file => file.endsWith('.ts'));
    for (const file of converterFiles) {
      fs.unlinkSync(path.join(convertersDir, file));
      console.log(`🗑️  删除: converters/${file}`);
    }
  }
  
  console.log('✅ 清理完成');
}

// 验证和解析SyntaxKind参数
function parseSyntaxKindArgs(args: string[]): string[] {
  const validSyntaxKinds: string[] = [];
  const nameToCode: Record<string, number> = {};
  const codeToName: Record<number, string> = {};
  
  // 创建双向映射
  for (const [code, name] of Object.entries(syntaxKindNames)) {
    const codeNum = parseInt(code, 10);
    nameToCode[name as string] = codeNum;
    codeToName[codeNum] = name as string;
  }
  
  for (const arg of args) {
    // 尝试作为数字代码解析
    const asNumber = parseInt(arg, 10);
    if (!isNaN(asNumber) && codeToName[asNumber]) {
      validSyntaxKinds.push(codeToName[asNumber]);
      continue;
    }
    
    // 尝试作为名称解析
    if (nameToCode[arg]) {
      validSyntaxKinds.push(arg);
      continue;
    }
    
    // 无效参数
    console.warn(`⚠️  警告: 未知的 SyntaxKind "${arg}"，跳过`);
  }
  
  return [...new Set(validSyntaxKinds)]; // 去重
}

// 生成指定SyntaxKind的文件
function generateSyntaxKindFiles(syntaxKinds: string[], forceOverride: boolean = false): void {
  const typesDir = path.join(process.cwd(), 'src/core/typed-ast/types');
  const convertersDir = path.join(process.cwd(), 'src/core/typed-ast/converters');
  
  // 确保目录存在
  fs.mkdirSync(typesDir, { recursive: true });
  fs.mkdirSync(convertersDir, { recursive: true });
  
  // 创建name到code的映射
  const nameToCode: Record<string, number> = {};
  for (const [code, name] of Object.entries(syntaxKindNames)) {
    nameToCode[name as string] = parseInt(code, 10);
  }

  for (const syntaxKind of syntaxKinds) {
    const code = nameToCode[syntaxKind];
    if (typeof code !== 'number') {
      console.warn(`⚠️  跳过未知的SyntaxKind: ${syntaxKind}`);
      continue;
    }
    
    const filePrefix = `s${formatSyntaxKindCode(code)}-${toKebabCase(syntaxKind)}`;
    
    // 生成类型文件
    const typeFilePath = path.join(typesDir, `${filePrefix}.ts`);
    if (!forceOverride && fs.existsSync(typeFilePath)) {
      console.log(`⏭️  跳过已存在的类型文件: ${filePrefix}.ts (使用 -f 强制覆盖)`);
    } else {
      const typeContent = generateTypeFile(syntaxKind, code);
      fs.writeFileSync(typeFilePath, typeContent);
      const action = forceOverride && fs.existsSync(typeFilePath) ? '🔄 强制覆盖' : '✅ 生成';
      console.log(`${action}类型文件: ${filePrefix}.ts`);
    }
    
    // 生成转换器文件
    const converterFilePath = path.join(convertersDir, `${filePrefix}.ts`);
    if (!forceOverride && fs.existsSync(converterFilePath)) {
      console.log(`⏭️  跳过已存在的转换器文件: converters/${filePrefix}.ts (使用 -f 强制覆盖)`);
    } else {
      const converterContent = generateConverterFile(syntaxKind, code);
      fs.writeFileSync(converterFilePath, converterContent);
      const action = forceOverride && fs.existsSync(converterFilePath) ? '🔄 强制覆盖' : '✅ 生成';
      console.log(`${action}转换器文件: converters/${filePrefix}.ts`);
    }
  }
}

// 主函数
async function main() {
  const program = new Command();

  program
    .name('generate-typed-ast-nodes')
    .description('生成类型化AST节点文件')
    .version('1.0.0')
    .option('-f, --force', '强制覆盖现有的 types 和 converters 文件')
    .option('-c, --clear', '删除所有生成的文件后重新生成')
    .option('-a, --all', '生成所有 SyntaxKind (默认只处理命令行参数中指定的)')
    .argument('[syntaxKinds...]', 'SyntaxKind 名称或代码 (当使用 -a 时忽略)');

  program.action((syntaxKinds: string[], options: any) => {
    console.log('🚀 开始生成类型化AST节点文件...');
    
    if (options.clear) {
      clearGeneratedFiles();
    }
    
    if (options.force) {
      console.log('⚠️  强制覆盖模式：将覆盖现有的 types 和 converters 文件');
    }
    
    // 始终创建基础类型文件
    createBaseTypes();
    
    let targetSyntaxKinds: string[];
    
    if (options.all) {
      // 生成所有SyntaxKind
      targetSyntaxKinds = Object.values(syntaxKindNames) as string[];
      console.log(`\n📝 生成所有 SyntaxKind (${targetSyntaxKinds.length}个)`);
      
      if (syntaxKinds.length > 0) {
        console.log('ℹ️  使用 -a 选项时，忽略命令行参数中的 SyntaxKind');
      }
    } else if (syntaxKinds.length > 0) {
      // 处理命令行参数中的SyntaxKind
      targetSyntaxKinds = parseSyntaxKindArgs(syntaxKinds);
      
      if (targetSyntaxKinds.length === 0) {
        console.log('❌ 没有有效的 SyntaxKind 参数');
        process.exit(1);
      }
      
      console.log(`\n📝 生成指定的 SyntaxKind: ${targetSyntaxKinds.join(', ')}`);
    } else {
      // 没有指定任何SyntaxKind
      console.log('❌ 请指定要生成的 SyntaxKind，或使用 -a 生成全部');
      console.log('💡 示例：');
      console.log('  bun run scripts/generate-typed-ast-nodes.ts Identifier StringLiteral');
      console.log('  bun run scripts/generate-typed-ast-nodes.ts 80 11');
      console.log('  bun run scripts/generate-typed-ast-nodes.ts -a');
      process.exit(1);
    }
    
    generateSyntaxKindFiles(targetSyntaxKinds, options.force);
    
    console.log('\n✅ 类型化AST节点文件生成完成！');
    
    if (!options.all) {
      console.log('\n💡 提示：');
      console.log('- 使用 -a 选项可以生成所有 SyntaxKind');
      console.log('- 使用 -f 选项可以强制覆盖现有文件');
      console.log('- 使用 -c 选项可以清理所有生成的文件后重新生成');
    }
  });

  await program.parseAsync(process.argv);
}

// 运行脚本
main().catch(console.error);
