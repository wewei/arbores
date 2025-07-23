#!/usr/bin/env bun
/**
 * Typed AST Schema 生成器
 * 
 * 根据 TypeScript SyntaxKind 定义自动生成 JSON Schema placeholder 文件
 * 注意：base/ 和 common/ 目录的 Schema 需要手动实现
 * 
 * @author Typed AST Team
 * @since 2025-07-23
 */

import { mkdir, writeFile, readdir, rm } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { Command } from 'commander';
import * as ts from 'typescript';
import { SYNTAX_KIND_NAMES } from '../src/core/syntax-kind-names';
import { pascalCaseToKebabCase } from '../src/core/utils/string-case';

// 路径配置
const SCHEMAS_DIR = 'src/core/typed-ast/schemas';

// 类别定义：基于 TypeScript SyntaxKind 边界值
interface CategoryConfig {
  name: string;
  description: string;
  baseType: string;
  directory: string;
  range: [number, number];  // [start, end] 包含边界
}

const CATEGORIES: CategoryConfig[] = [
  {
    name: 'tokens',
    description: 'Token 类型 - 词法单元和标点符号',
    baseType: 'BaseTokenNode',
    directory: 'tokens',
    range: [ts.SyntaxKind.FirstToken, ts.SyntaxKind.LastToken] // 0-165
  },
  {
    name: 'types',
    description: 'TypeScript 类型节点',
    baseType: 'BaseNode',
    directory: 'types',
    range: [ts.SyntaxKind.FirstTypeNode, ts.SyntaxKind.LastTypeNode] // 182-205
  },
  {
    name: 'statements',
    description: '语句类型 - 可执行的语句',
    baseType: 'BaseStatementNode',
    directory: 'statements',
    range: [ts.SyntaxKind.FirstStatement, ts.SyntaxKind.LastStatement] // 243-259
  },
  {
    name: 'jsdoc',
    description: 'JSDoc 节点 - 文档注释相关',
    baseType: 'BaseJSDocNode',
    directory: 'jsdoc',
    range: [ts.SyntaxKind.FirstJSDocNode, ts.SyntaxKind.LastJSDocNode] // 309-351
  },
  {
    name: 'nodes',
    description: '其他 AST 节点 - 表达式、声明、绑定等',
    baseType: 'BaseNode',
    directory: 'nodes',
    range: [ts.SyntaxKind.FirstNode, 357] // 166-357 (排除其他已分类的范围)
  }
];

/**
 * 获取指定类别包含的所有 SyntaxKind 编号
 */
function getKindsForCategory(category: CategoryConfig): number[] {
  const [start, end] = category.range;
  const kinds: number[] = [];

  for (let kind = start; kind <= end; kind++) {
    // 跳过 SyntaxKind 0 (Unknown)
    if (kind === 0) continue;

    // 确保存在于 SYNTAX_KIND_NAMES 中
    if (!SYNTAX_KIND_NAMES[kind]) continue;

    // 对于 nodes 类别，排除已被其他类别包含的范围
    if (category.name === 'nodes') {
      const isInOtherCategory = CATEGORIES
        .filter(c => c.name !== 'nodes')
        .some(c => kind >= c.range[0] && kind <= c.range[1]);

      if (isInOtherCategory) continue;
    }

    kinds.push(kind);
  }

  return kinds;
}

/**
 * 根据 SyntaxKind 确定所属类别
 */
function getCategoryForKind(kind: number): CategoryConfig | null {
  for (const category of CATEGORIES) {
    if (category.name === 'nodes') continue; // nodes 是兜底类别，最后处理

    const [start, end] = category.range;
    if (kind >= start && kind <= end) {
      return category;
    }
  }

  // 兜底：如果不属于任何特定类别，归入 nodes
  const nodesCategory = CATEGORIES.find(c => c.name === 'nodes');
  return nodesCategory || null;
}

/**
 * 生成 Schema 文件内容
 */
function generateSchemaContent(kind: number, syntaxName: string, category: CategoryConfig): string {
  const schemaId = `s${kind.toString().padStart(3, '0')}-${pascalCaseToKebabCase(syntaxName)}`;
  const nodeName = `${syntaxName}Node`;

  // 使用 Schema ID 引用而不是文件路径
  const baseRef = pascalCaseToKebabCase(category.baseType);

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: schemaId,
    title: nodeName,
    description: `${syntaxName} AST 节点 (SyntaxKind: ${kind})`,
    allOf: [
      {
        $ref: baseRef
      },
      {
        type: "object",
        properties: {
          kind: {
            const: kind,
            description: `语法种类：${syntaxName}`
          }
          // TODO: 添加特定于此节点类型的属性
          // 根据 TypeScript AST 定义补充具体属性
        },
        required: []
        // TODO: 根据节点类型添加必需属性
      }
    ],
    metadata: {
      category: category.name,
      syntaxKind: kind,
      syntaxName: syntaxName,
      baseType: category.baseType
    }
  };

  return JSON.stringify(schema, null, 2);
}

/**
 * 生成单个 Schema 文件
 */
async function generateSchemaFile(
  kind: number,
  syntaxName: string,
  category: CategoryConfig,
  options: { force: boolean; dryRun: boolean }
): Promise<{ generated: boolean; file: string }> {
  const fileName = `s${kind.toString().padStart(3, '0')}-${pascalCaseToKebabCase(syntaxName)}.schema.json`;
  const filePath = join(SCHEMAS_DIR, category.directory, fileName);

  if (options.dryRun) {
    console.log(`🔍 [DRY RUN] 将生成: ${category.directory}/${fileName}`);
    return { generated: true, file: fileName };
  }

  // 检查文件是否已存在
  if (!options.force && existsSync(filePath)) {
    console.log(`⏭️  跳过已存在的文件: ${category.directory}/${fileName}`);
    return { generated: false, file: fileName };
  }

  // 确保目录存在
  const dirPath = join(SCHEMAS_DIR, category.directory);
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
    console.log(`📁 创建目录: ${category.directory}/`);
  }

  // 生成文件内容
  const content = generateSchemaContent(kind, syntaxName, category);

  // 写入文件
  await writeFile(filePath, content, 'utf-8');
  const action = options.force && existsSync(filePath) ? '🔄 强制覆盖' : '✅ 生成';
  console.log(`${action}: ${category.directory}/${fileName}`);

  return { generated: true, file: fileName };
}

/**
 * 生成索引文件
 */
async function generateIndexFile(
  generatedFiles: { category: string; file: string }[],
  options: { force: boolean; dryRun: boolean }
) {
  const indexPath = join(SCHEMAS_DIR, 'index.json');

  if (!options.force && existsSync(indexPath)) {
    if (!options.dryRun) {
      console.log(`⏭️  跳过已存在的索引文件: index.json`);
    }
    return;
  }

  if (options.dryRun) {
    console.log(`🔍 [DRY RUN] 将生成索引文件: index.json`);
    return;
  }

  // 按类别分组
  const groupedFiles: Record<string, string[]> = {};
  for (const { category, file } of generatedFiles) {
    if (!groupedFiles[category]) {
      groupedFiles[category] = [];
    }
    groupedFiles[category].push(`${category}/${file}`);
  }

  const indexContent = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title: "TypeScript AST Schema Registry",
    description: "所有 TypeScript 语法节点的 Schema 注册表",
    version: "1.0.0",
    generated: new Date().toISOString(),
    metadata: {
      generator: {
        script: "scripts/generate-typed-ast-schemas.ts",
        outputPaths: {
          types: "src/core/typed-ast/types/",
          converters: "src/core/typed-ast/converters/",
          tests: "src/core/typed-ast/__tests__/"
        },
        validation: true
      },
      boundaries: {
        tokens: `${ts.SyntaxKind.FirstToken}-${ts.SyntaxKind.LastToken}`,
        types: `${ts.SyntaxKind.FirstTypeNode}-${ts.SyntaxKind.LastTypeNode}`,
        statements: `${ts.SyntaxKind.FirstStatement}-${ts.SyntaxKind.LastStatement}`,
        jsdoc: `${ts.SyntaxKind.FirstJSDocNode}-${ts.SyntaxKind.LastJSDocNode}`,
        nodes: `${ts.SyntaxKind.FirstNode}-357 (excluding other categories)`
      },
      categories: CATEGORIES.map(cat => ({
        name: cat.name,
        description: cat.description,
        baseType: cat.baseType,
        range: cat.range,
        count: getKindsForCategory(cat).length
      }))
    },
    schemas: {
      base: [
        "base/base-typed-node.schema.json",
        "base/base-token-node.schema.json",
        "base/base-type-node.schema.json",
        "base/base-statement-node.schema.json",
        "base/base-jsdoc-node.schema.json"
      ],
      common: [
        "common/type-unions.schema.json",
        "common/operator-types.schema.json",
        "common/modifier-types.schema.json"
      ],
      generated: groupedFiles
    },
    statistics: {
      totalSchemas: generatedFiles.length,
      byCategory: Object.fromEntries(
        Object.entries(groupedFiles).map(([cat, files]) => [cat, files.length])
      )
    }
  };

  await writeFile(indexPath, JSON.stringify(indexContent, null, 2), 'utf-8');
  const action = options.force && existsSync(indexPath) ? '🔄 强制覆盖' : '✅ 生成';
  console.log(`${action}索引文件: index.json`);
}

/**
 * 清理生成的文件
 */
async function cleanGeneratedFiles() {
  console.log('🧹 清理已生成的 Schema 文件...');

  for (const category of CATEGORIES) {
    const categoryDir = join(SCHEMAS_DIR, category.directory);
    if (existsSync(categoryDir)) {
      await rm(categoryDir, { recursive: true, force: true });
      console.log(`🗑️  删除目录: ${category.directory}/`);
    }
  }

  const indexFile = join(SCHEMAS_DIR, 'index.json');
  if (existsSync(indexFile)) {
    await rm(indexFile);
    console.log(`🗑️  删除索引文件: index.json`);
  }

  console.log('✅ 清理完成');
}

/**
 * 解析 SyntaxKind 参数
 */
function parseSyntaxKinds(syntaxKinds: string[]): number[] {
  const result: number[] = [];
  const nameToCode: Record<string, number> = {};

  // 创建名称到代码的映射
  for (const [code, name] of Object.entries(SYNTAX_KIND_NAMES)) {
    nameToCode[name] = parseInt(code);
  }

  for (const arg of syntaxKinds) {
    // 尝试作为数字解析
    const asNumber = parseInt(arg);
    if (!isNaN(asNumber) && SYNTAX_KIND_NAMES[asNumber]) {
      result.push(asNumber);
      continue;
    }

    // 尝试作为名称解析
    if (nameToCode[arg] !== undefined) {
      result.push(nameToCode[arg]);
      continue;
    }

    console.warn(`⚠️  无法识别的 SyntaxKind: ${arg}`);
  }

  return result;
}

/**
 * 主函数
 */
async function main() {
  const program = new Command();

  program
    .name('generate-typed-ast-schemas')
    .description('生成 TypeScript AST Schema 文件')
    .version('1.0.0')
    .option('-f, --force', '强制覆盖现有的 Schema 文件')
    .option('-c, --clean', '删除所有生成的文件后重新生成')
    .option('-a, --all', '生成所有 SyntaxKind (默认只处理命令行参数中指定的)')
    .option('--dry-run', '预览模式，显示将要生成的文件但不实际创建')
    .argument('[syntaxKinds...]', 'SyntaxKind 名称或代码 (当使用 -a 时忽略)')
    .addHelpText('after', `
示例:
  bun scripts/generate-typed-ast-schemas.ts Identifier StringLiteral
  bun scripts/generate-typed-ast-schemas.ts 80 11
  bun scripts/generate-typed-ast-schemas.ts -a
  bun scripts/generate-typed-ast-schemas.ts -c -a
  bun scripts/generate-typed-ast-schemas.ts --dry-run -a

注意:
  - Schema 基于 TypeScript SyntaxKind 边界值自动分类
  - base/ 和 common/ 目录需要手动实现
  - 使用 --dry-run 可以预览将要生成的文件
    `);

  program.action(async (syntaxKinds: string[], options: any) => {
    console.log('🚀 Typed AST Schema 生成器启动');
    console.log(`📁 输出目录: ${SCHEMAS_DIR}`);
    console.log(`🔧 选项: force=${options.force}, clean=${options.clean}, all=${options.all}, dryRun=${options.dryRun}`);
    console.log('');

    // 清理文件（如果需要）
    if (options.clean) {
      await cleanGeneratedFiles();
      console.log('');
    }

    // 确定要处理的 SyntaxKind
    let targetKinds: number[];
    if (options.all) {
      targetKinds = Object.keys(SYNTAX_KIND_NAMES).map(Number).filter(k => k > 0); // 排除 0
      console.log(`🎯 处理所有 ${targetKinds.length} 个 SyntaxKind`);
    } else {
      if (syntaxKinds.length === 0) {
        console.error('❌ 错误: 请指定要生成的 SyntaxKind 或使用 -a 选项');
        console.log('\n💡 示例:');
        console.log('  bun scripts/generate-typed-ast-schemas.ts Identifier StringLiteral');
        console.log('  bun scripts/generate-typed-ast-schemas.ts 80 11');
        console.log('  bun scripts/generate-typed-ast-schemas.ts -a');
        process.exit(1);
      }

      targetKinds = parseSyntaxKinds(syntaxKinds);
      console.log(`🎯 处理指定的 ${targetKinds.length} 个 SyntaxKind: ${targetKinds.join(', ')}`);
    }

    console.log('');

    // 确保根目录存在
    if (!existsSync(SCHEMAS_DIR)) {
      await mkdir(SCHEMAS_DIR, { recursive: true });
      console.log(`📁 创建根目录: ${SCHEMAS_DIR}`);
    }

    // 按类别生成文件
    let totalGenerated = 0;
    let totalSkipped = 0;
    const generatedFiles: { category: string; file: string }[] = [];

    // 显示类别统计
    console.log('📊 类别边界:');
    for (const category of CATEGORIES) {
      const kinds = getKindsForCategory(category);
      console.log(`  ${category.name}: ${kinds.length} 个节点 (${category.range[0]}-${category.range[1]}) - ${category.description}`);
    }
    console.log('');

    for (const category of CATEGORIES) {
      const categoryKinds = getKindsForCategory(category).filter(k => targetKinds.includes(k));
      if (categoryKinds.length === 0) continue;

      console.log(`📂 处理类别: ${category.name} (${categoryKinds.length} 个节点)`);

      for (const kind of categoryKinds) {
        const syntaxName = SYNTAX_KIND_NAMES[kind];
        if (!syntaxName) {
          console.warn(`⚠️  跳过未知的 SyntaxKind: ${kind}`);
          continue;
        }

        const result = await generateSchemaFile(kind, syntaxName, category, {
          force: options.force,
          dryRun: options.dryRun
        });

        if (result.generated) {
          generatedFiles.push({ category: category.name, file: result.file });
          totalGenerated++;
        } else {
          totalSkipped++;
        }
      }

      console.log('');
    }

    // 生成索引文件
    console.log('📋 生成索引文件...');
    await generateIndexFile(generatedFiles, {
      force: options.force,
      dryRun: options.dryRun
    });

    // 统计信息
    console.log('');
    console.log('📊 生成统计:');
    console.log(`   ✅ 已生成: ${totalGenerated} 个文件`);
    console.log(`   ⏭️  已跳过: ${totalSkipped} 个文件`);
    console.log(`   📂 类别数: ${CATEGORIES.length} 个`);

    if (options.dryRun) {
      console.log('');
      console.log('💡 这是预览模式，实际未创建文件。');
      console.log('   移除 --dry-run 参数重新运行以生成文件。');
    } else {
      console.log('');
      console.log('🎉 Schema 生成完成！');
      console.log('');
      console.log('📝 下一步:');
      console.log('   1. 手动实现 base/ 目录下的基础 Schema');
      console.log('   2. 手动实现 common/ 目录下的类型联合 Schema');
      console.log('   3. 根据具体节点类型补充生成的 Schema 属性定义');
      console.log('   4. 运行 Schema 验证确保结构正确');
    }
  });

  await program.parseAsync(process.argv);
}

// 运行主函数
if (import.meta.main) {
  main().catch(console.error);
}
