#!/usr/bin/env bun
/**
 * JSON Schema 分析工具
 * 用于查询、校验和分析项目中的 JSON Schema 集合
 */

import { Command } from 'commander';
import Ajv from 'ajv';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// 当前脚本的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Schema 目录配置
const SCHEMA_DIRS = {
  base: path.join(projectRoot, 'src/core/typed-ast/schemas/base'),
  common: path.join(projectRoot, 'src/core/typed-ast/schemas/common'),
  tokens: path.join(projectRoot, 'src/core/typed-ast/schemas/tokens'),
  types: path.join(projectRoot, 'src/core/typed-ast/schemas/types'),
  statements: path.join(projectRoot, 'src/core/typed-ast/schemas/statements'),
  jsdoc: path.join(projectRoot, 'src/core/typed-ast/schemas/jsdoc'),
  nodes: path.join(projectRoot, 'src/core/typed-ast/schemas/nodes'),
};

const SCHEMA_INDEX = path.join(projectRoot, 'src/core/typed-ast/schemas/index.json');

interface SchemaInfo {
  id: string;
  title: string;
  description: string;
  filePath: string;
  category: string;
  metadata?: any;
  isValid: boolean;
  errors?: string[];
}

interface ValidationResult {
  total: number;
  valid: number;
  invalid: number;
  errors: Array<{
    file: string;
    errors: string[];
  }>;
}

class SchemaAnalyzer {
  private ajv: Ajv;
  private schemas: Map<string, SchemaInfo> = new Map();
  private loadedSchemas: Map<string, any> = new Map(); // 缓存已加载的 schema

  constructor() {
    this.ajv = new Ajv({
      strict: false,
      validateFormats: false,
      addUsedSchema: false,
      loadSchema: this.loadSchemaByRef.bind(this), // 添加自定义 schema 加载器
    });
  }

  /**
   * 自定义 schema 引用加载器
   */
  private async loadSchemaByRef(uri: string): Promise<any> {
    console.log(`🔗 加载引用: ${uri}`);

    // 检查缓存
    if (this.loadedSchemas.has(uri)) {
      console.log(`   缓存命中: ${uri}`);
      return this.loadedSchemas.get(uri);
    }

    let schema: any;
    let schemaId: string = uri;

    // 处理片段引用 (如: common/type-unions#/definitions/JSDocTagNode)
    if (uri.includes('#')) {
      const [baseSchemaId, fragment] = uri.split('#');
      if (!baseSchemaId) {
        throw new Error(`Invalid schema reference: ${uri}`);
      }
      schemaId = baseSchemaId;
      console.log(`   片段引用: schemaId=${schemaId}, fragment=${fragment}`);

      // 先加载主 schema（如果未缓存的话）
      let mainSchema: any;
      if (this.loadedSchemas.has(schemaId)) {
        mainSchema = this.loadedSchemas.get(schemaId);
      } else {
        // 尝试通过不同的方式获取 schema
        mainSchema = await this.getSchemaForRef(schemaId);
        if (mainSchema) {
          this.loadedSchemas.set(schemaId, mainSchema);
        }
      }

      if (!mainSchema) {
        throw new Error(`Cannot load main schema for: ${schemaId}`);
      }

      // 如果有片段，返回片段引用的部分
      if (fragment) {
        const parts = fragment.slice(1).split('/'); // 移除开头的 '/'
        let result = mainSchema;
        for (const part of parts) {
          result = result[part];
          if (!result) {
            throw new Error(`Fragment ${fragment} not found in schema ${schemaId}`);
          }
        }
        schema = result;
      } else {
        schema = mainSchema;
      }
    } else {
      // 获取完整的 schema
      schema = await this.getSchemaForRef(schemaId);
    }

    // 缓存结果
    if (schema) {
      this.loadedSchemas.set(uri, schema);
    }

    return schema;
  }

  /**
   * 根据引用获取 schema
   */
  private async getSchemaForRef(schemaRef: string): Promise<any> {
    // 首先检查是否已经在 AJV 中（通过不同的键）
    // 对于 common/type-unions，实际的 $id 可能是 type-unions
    if (schemaRef.includes('/')) {
      const parts = schemaRef.split('/');
      const category = parts[0];
      const fileName = parts[1];

      // 尝试直接通过 fileName 从 AJV 获取
      try {
        if (fileName) {
          const existingSchema = this.ajv.getSchema(fileName);
          if (existingSchema) {
            console.log(`   AJV 已有 schema: ${fileName}`);
            return existingSchema.schema;
          }
        }
      } catch (error) {
        // 忽略，继续尝试文件加载
      }

      // 从文件加载
      console.log(`   分类引用: category=${category}, fileName=${fileName}`);
      const categoryDir = SCHEMA_DIRS[category as keyof typeof SCHEMA_DIRS];
      if (!categoryDir) {
        throw new Error(`Unknown schema category: ${category}`);
      }
      const schemaPath = path.join(categoryDir, `${fileName}.schema.json`);
      console.log(`   分类路径: ${schemaPath}`);

      try {
        const content = await fs.readFile(schemaPath, 'utf-8');
        return JSON.parse(content);
      } catch (error) {
        console.warn(`⚠️  无法加载引用的 schema: ${schemaRef} -> ${schemaPath}`);
        throw error;
      }
    }

    // 处理相对路径引用
    if (schemaRef.startsWith('../')) {
      const parts = schemaRef.split('/');
      if (parts.length >= 3) {
        const category = parts[1];
        const fileName = parts[2];

        const categoryDir = SCHEMA_DIRS[category as keyof typeof SCHEMA_DIRS];
        if (categoryDir) {
          const schemaPath = path.join(categoryDir, `${fileName}.schema.json`);
          console.log(`   相对路径: ${schemaPath}`);

          try {
            const content = await fs.readFile(schemaPath, 'utf-8');
            return JSON.parse(content);
          } catch (error) {
            console.warn(`⚠️  无法加载引用的 schema: ${schemaRef} -> ${schemaPath}`);
            throw error;
          }
        }
      }
    }

    // 处理直接 ID 引用
    try {
      const existingSchema = this.ajv.getSchema(schemaRef);
      if (existingSchema) {
        console.log(`   AJV 已有 schema: ${schemaRef}`);
        return existingSchema.schema;
      }
    } catch (error) {
      // 忽略，继续尝试文件加载
    }

    const directPath = path.join(SCHEMA_DIRS.base, `${schemaRef}.schema.json`);
    console.log(`   直接引用: ${directPath}`);
    try {
      const content = await fs.readFile(directPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`⚠️  无法加载引用的 schema: ${schemaRef} -> ${directPath}`);
      throw error;
    }
  }

  /**
   * 递归扫描目录获取所有 Schema 文件
   */
  private async scanSchemaFiles(dir: string, category: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // 递归扫描子目录
          const subFiles = await this.scanSchemaFiles(fullPath, category);
          files.push(...subFiles);
        } else if (entry.name.endsWith('.schema.json')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`⚠️  无法扫描目录 ${dir}: ${error}`);
    }

    return files;
  }

  /**
   * 加载并解析单个 Schema 文件
   */
  private async loadSchema(filePath: string, category: string): Promise<SchemaInfo | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const schema = JSON.parse(content);

      const info: SchemaInfo = {
        id: schema.$id || path.basename(filePath, '.schema.json'),
        title: schema.title || 'Untitled Schema',
        description: schema.description || 'No description',
        filePath,
        category,
        metadata: schema.metadata,
        isValid: true,
        errors: []
      };

      // 验证 Schema 本身的有效性
      try {
        // 使用异步编译以支持自定义引用加载器
        await this.ajv.compileAsync(schema);
      } catch (error) {
        info.isValid = false;
        info.errors = [error instanceof Error ? error.message : String(error)];
      }

      return info;
    } catch (error) {
      return {
        id: path.basename(filePath, '.schema.json'),
        title: 'Invalid Schema',
        description: 'Failed to parse schema file',
        filePath,
        category,
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }

  /**
   * 加载所有 Schema 文件
   */
  async loadAllSchemas(): Promise<void> {
    console.log('🔍 扫描 Schema 文件...');

    // 首先加载基础 Schema 文件
    await this.loadBaseSchemas();

    for (const [category, dir] of Object.entries(SCHEMA_DIRS)) {
      const files = await this.scanSchemaFiles(dir, category);

      console.log(`📂 ${category}: 发现 ${files.length} 个文件`);

      for (const file of files) {
        const schema = await this.loadSchema(file, category);
        if (schema) {
          this.schemas.set(schema.id, schema);
        }
      }
    }

    console.log(`✅ 总计加载 ${this.schemas.size} 个 Schema 文件\n`);
  }

  /**
   * 预加载基础 Schema 文件到 AJV
   */
  private async loadBaseSchemas(): Promise<void> {
    // 先加载所有 common schema
    const commonFiles = await this.scanSchemaFiles(SCHEMA_DIRS.common, 'common');
    for (const file of commonFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const schema = JSON.parse(content);
        this.ajv.addSchema(schema, schema.$id);
        console.log(`📋 预加载 Common Schema: ${schema.$id}`);
      } catch (error) {
        console.warn(`⚠️  无法预加载 Common Schema: ${file}`);
      }
    }

    // 再加载所有 base schema
    const baseFiles = await this.scanSchemaFiles(SCHEMA_DIRS.base, 'base');
    for (const file of baseFiles) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const schema = JSON.parse(content);

        // 预先注册到 AJV 中
        this.ajv.addSchema(schema, schema.$id);
        console.log(`📋 预加载基础 Schema: ${schema.$id}`);
      } catch (error) {
        console.warn(`⚠️  无法预加载基础 Schema: ${file}`);
      }
    }
  }  /**
   * 检查 Schema 语法结构（忽略引用错误）
   */
  async checkSchemaStructure(): Promise<ValidationResult> {
    console.log('🔍 检查 Schema 结构（忽略引用错误）...\n');

    const result: ValidationResult = {
      total: this.schemas.size,
      valid: 0,
      invalid: 0,
      errors: []
    };

    for (const [id, schema] of this.schemas) {
      // 检查基本的 JSON Schema 结构
      let isStructureValid = true;
      const structureErrors: string[] = [];

      try {
        // 重新解析文件内容以检查基本结构
        const content = await fs.readFile(schema.filePath, 'utf-8');
        const schemaObj = JSON.parse(content);

        // 基本结构检查
        if (!schemaObj.$schema) {
          structureErrors.push('缺少 $schema 字段');
          isStructureValid = false;
        }

        if (!schemaObj.$id) {
          structureErrors.push('缺少 $id 字段');
          isStructureValid = false;
        }

        if (!schemaObj.title) {
          structureErrors.push('缺少 title 字段');
          isStructureValid = false;
        }

        if (!schemaObj.description) {
          structureErrors.push('缺少 description 字段');
          isStructureValid = false;
        }

        // 检查是否有 allOf 或 type 定义
        if (!schemaObj.allOf && !schemaObj.type && !schemaObj.definitions) {
          structureErrors.push('缺少类型定义 (allOf, type, 或 definitions)');
          isStructureValid = false;
        }

        // 如果有 metadata，检查其结构
        if (schemaObj.metadata) {
          if (!schemaObj.metadata.category) {
            structureErrors.push('metadata 缺少 category 字段');
            isStructureValid = false;
          }
        }

      } catch (error) {
        isStructureValid = false;
        structureErrors.push(error instanceof Error ? error.message : String(error));
      }

      if (isStructureValid) {
        result.valid++;
        console.log(`✅ ${schema.category}/${id} - ${schema.title}`);
      } else {
        result.invalid++;
        console.log(`❌ ${schema.category}/${id} - ${schema.title}`);
        console.log(`   结构问题: ${structureErrors.join(', ')}`);

        result.errors.push({
          file: schema.filePath,
          errors: structureErrors
        });
      }
    }

    return result;
  }

  /**
   * 校验所有 Schema 文件（包括引用检查）
   */
  async validateAllSchemas(): Promise<ValidationResult> {
    console.log('🔍 开始校验所有 Schema...\n');

    const result: ValidationResult = {
      total: this.schemas.size,
      valid: 0,
      invalid: 0,
      errors: []
    };

    for (const [id, schema] of this.schemas) {
      if (schema.isValid) {
        result.valid++;
        console.log(`✅ ${schema.category}/${id} - ${schema.title}`);
      } else {
        result.invalid++;
        console.log(`❌ ${schema.category}/${id} - ${schema.title}`);
        console.log(`   错误: ${schema.errors?.join(', ')}`);

        result.errors.push({
          file: schema.filePath,
          errors: schema.errors || []
        });
      }
    }

    return result;
  }

  /**
   * 显示校验结果摘要
   */
  displayValidationSummary(result: ValidationResult): void {
    console.log('\n📊 校验结果摘要:');
    console.log(`   总计: ${result.total} 个 Schema`);
    console.log(`   ✅ 有效: ${result.valid} 个`);
    console.log(`   ❌ 无效: ${result.invalid} 个`);

    if (result.invalid > 0) {
      console.log(`   成功率: ${((result.valid / result.total) * 100).toFixed(1)}%`);
      console.log('\n🚨 发现问题的文件:');

      result.errors.forEach(({ file, errors }) => {
        console.log(`   📄 ${path.relative(projectRoot, file)}`);
        errors.forEach(error => {
          console.log(`      - ${error}`);
        });
      });
    } else {
      console.log('   🎉 所有 Schema 都通过校验！');
    }
  }

  /**
   * 按类别显示 Schema 统计
   */
  displayCategoryStats(): void {
    const categoryStats = new Map<string, number>();

    for (const schema of this.schemas.values()) {
      const count = categoryStats.get(schema.category) || 0;
      categoryStats.set(schema.category, count + 1);
    }

    console.log('\n📊 按类别统计:');
    for (const [category, count] of categoryStats) {
      console.log(`   📂 ${category}: ${count} 个 Schema`);
    }
  }

  /**
   * 搜索 Schema
   */
  searchSchemas(query: string): SchemaInfo[] {
    const results: SchemaInfo[] = [];
    const lowerQuery = query.toLowerCase();

    for (const schema of this.schemas.values()) {
      if (
        schema.id.toLowerCase().includes(lowerQuery) ||
        schema.title.toLowerCase().includes(lowerQuery) ||
        schema.description.toLowerCase().includes(lowerQuery)
      ) {
        results.push(schema);
      }
    }

    return results;
  }

  /**
   * 显示搜索结果
   */
  displaySearchResults(results: SchemaInfo[], query: string): void {
    console.log(`🔍 搜索 "${query}" 的结果:`);

    if (results.length === 0) {
      console.log('   没有找到匹配的 Schema');
      return;
    }

    console.log(`   找到 ${results.length} 个匹配项:\n`);

    results.forEach(schema => {
      const status = schema.isValid ? '✅' : '❌';
      console.log(`   ${status} ${schema.category}/${schema.id}`);
      console.log(`      标题: ${schema.title}`);
      console.log(`      描述: ${schema.description}`);
      console.log(`      文件: ${path.relative(projectRoot, schema.filePath)}`);
      if (!schema.isValid && schema.errors) {
        console.log(`      错误: ${schema.errors.join(', ')}`);
      }
      console.log();
    });
  }
}

async function main() {
  const program = new Command();

  program
    .name('schema-analyzer')
    .description('JSON Schema 分析工具 - 查询、校验和分析项目中的 Schema 集合')
    .version('1.0.0');

  // 校验命令
  program
    .command('validate')
    .description('校验所有 Schema 文件')
    .option('-s, --stats', '显示统计信息')
    .action(async (options) => {
      const analyzer = new SchemaAnalyzer();
      await analyzer.loadAllSchemas();

      if (options.stats) {
        analyzer.displayCategoryStats();
      }

      const result = await analyzer.validateAllSchemas();
      analyzer.displayValidationSummary(result);

      // 如果有错误则以非零状态码退出
      if (result.invalid > 0) {
        process.exit(1);
      }
    });

  // 搜索命令
  program
    .command('search <query>')
    .description('搜索 Schema')
    .action(async (query) => {
      const analyzer = new SchemaAnalyzer();
      await analyzer.loadAllSchemas();

      const results = analyzer.searchSchemas(query);
      analyzer.displaySearchResults(results, query);
    });

  // 统计命令
  program
    .command('stats')
    .description('显示 Schema 统计信息')
    .action(async () => {
      const analyzer = new SchemaAnalyzer();
      await analyzer.loadAllSchemas();
      analyzer.displayCategoryStats();
    });

  // 结构检查命令
  program
    .command('check')
    .description('检查 Schema 基本结构（忽略引用错误）')
    .option('-s, --stats', '显示统计信息')
    .action(async (options) => {
      const analyzer = new SchemaAnalyzer();
      await analyzer.loadAllSchemas();

      if (options.stats) {
        analyzer.displayCategoryStats();
      }

      const result = await analyzer.checkSchemaStructure();
      analyzer.displayValidationSummary(result);

      // 如果有错误则以非零状态码退出
      if (result.invalid > 0) {
        process.exit(1);
      }
    });

  await program.parseAsync();
}

// 执行主函数
if (import.meta.main) {
  main().catch(error => {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  });
}
