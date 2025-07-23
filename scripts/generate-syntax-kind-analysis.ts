#!/usr/bin/env bun

import * as ts from 'typescript';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';

/**
 * Enhanced SyntaxKind Analyzer
 * 
 * This script provides comprehensive analysis of TypeScript's SyntaxKind enum,
 * including group detection, boundary analysis, and schema preparation.
 * 
 * Features:
 * - Group boundary detection using First/Last markers
 * - Detailed group analysis with characteristics
 * - Clean data structures without processing functions
 * - Ruler visualization for group understanding
 * - JSON output for schema generation
 */

// ============================================================================
// Type Definitions
// ============================================================================

interface SyntaxKindInfo {
  value: number;
  name: string;
  group?: string;
  isMarker: boolean;
  markerType?: 'first' | 'last' | 'count' | 'unknown';
}

interface GroupInfo {
  name: string;
  start: number;
  end: number;
  firstMarker?: string;
  lastMarker?: string;
  count: number;
  members: SyntaxKindInfo[];
  characteristics: string[];
  description: string;
}

interface SyntaxKindAnalysis {
  version: string;
  generatedAt: string;
  totalCount: number;
  groups: GroupInfo[];
  allKinds: SyntaxKindInfo[];
  markers: SyntaxKindInfo[];
  unmappedKinds: SyntaxKindInfo[];
}

// ============================================================================
// Core Analysis Logic
// ============================================================================

class SyntaxKindAnalyzer {
  private allKinds: SyntaxKindInfo[] = [];
  private markers: SyntaxKindInfo[] = [];
  private groups: GroupInfo[] = [];

  constructor() {
    this.parseAllSyntaxKinds();
    this.identifyMarkers();
    this.analyzeGroups();
  }

  private parseAllSyntaxKinds(): void {
    for (const key in ts.SyntaxKind) {
      if (isNaN(Number(key))) {
        const enumValue = (ts.SyntaxKind as any)[key];
        if (typeof enumValue === 'number') {
          this.allKinds.push({
            value: enumValue,
            name: key,
            isMarker: this.isMarker(key)
          });
        }
      }
    }

    // Sort by value
    this.allKinds.sort((a, b) => a.value - b.value);
  }

  private isMarker(name: string): boolean {
    return (
      name.startsWith('First') || 
      name.startsWith('Last') || 
      name === 'Count' || 
      name === 'Unknown'
    );
  }

  private identifyMarkers(): void {
    this.markers = this.allKinds.filter(kind => kind.isMarker);
    
    // Classify marker types
    this.markers.forEach(marker => {
      if (marker.name.startsWith('First')) {
        marker.markerType = 'first';
      } else if (marker.name.startsWith('Last')) {
        marker.markerType = 'last';
      } else if (marker.name === 'Count') {
        marker.markerType = 'count';
      } else if (marker.name === 'Unknown') {
        marker.markerType = 'unknown';
      }
    });
  }

  private analyzeGroups(): void {
    // Predefined group definitions based on TypeScript patterns
    const groupDefinitions = [
      {
        name: 'Tokens',
        firstMarker: 'FirstToken',
        lastMarker: 'LastToken',
        description: 'Basic lexical tokens including EOF',
        characteristics: ['lexical', 'positioned', 'has-text']
      },
      {
        name: 'TriviaTokens', 
        firstMarker: 'FirstTriviaToken',
        lastMarker: 'LastTriviaToken',
        description: 'Comments and whitespace tokens',
        characteristics: ['trivia', 'skippable', 'formatting']
      },
      {
        name: 'LiteralTokens',
        firstMarker: 'FirstLiteralToken', 
        lastMarker: 'LastLiteralToken',
        description: 'Literal value tokens',
        characteristics: ['literal', 'has-value', 'typed']
      },
      {
        name: 'TemplateTokens',
        firstMarker: 'FirstTemplateToken',
        lastMarker: 'LastTemplateToken', 
        description: 'Template string tokens',
        characteristics: ['template', 'literal', 'interpolation']
      },
      {
        name: 'PunctuationTokens',
        firstMarker: 'FirstPunctuation',
        lastMarker: 'LastPunctuation',
        description: 'Punctuation and operator tokens',
        characteristics: ['punctuation', 'operator', 'syntax']
      },
      {
        name: 'BinaryOperators',
        firstMarker: 'FirstBinaryOperator', 
        lastMarker: 'LastBinaryOperator',
        description: 'Binary operator tokens',
        characteristics: ['binary-operator', 'expression', 'precedence']
      },
      {
        name: 'Keywords',
        firstMarker: 'FirstKeyword',
        lastMarker: 'LastKeyword', 
        description: 'Reserved language keywords',
        characteristics: ['keyword', 'reserved', 'language']
      },
      {
        name: 'FutureReservedWords',
        firstMarker: 'FirstFutureReservedWord',
        lastMarker: 'LastFutureReservedWord',
        description: 'Future reserved words',
        characteristics: ['future-reserved', 'language', 'evolution']
      },
      {
        name: 'ContextualKeywords', 
        firstMarker: 'FirstContextualKeyword',
        lastMarker: 'LastContextualKeyword',
        description: 'Context-dependent keywords',
        characteristics: ['contextual', 'keyword', 'conditional']
      },
      {
        name: 'TypeNodes',
        firstMarker: 'FirstTypeNode',
        lastMarker: 'LastTypeNode',
        description: 'TypeScript type system nodes',
        characteristics: ['type-system', 'compile-time', 'annotation']
      },
      {
        name: 'Statements',
        firstMarker: 'FirstStatement', 
        lastMarker: 'LastStatement',
        description: 'Executable statement nodes',
        characteristics: ['statement', 'executable', 'control-flow']
      },
      {
        name: 'JSDocNodes',
        firstMarker: 'FirstJSDocNode',
        lastMarker: 'LastJSDocNode', 
        description: 'JSDoc documentation nodes',
        characteristics: ['documentation', 'jsdoc', 'metadata']
      },
      {
        name: 'JSDocTags',
        firstMarker: 'FirstJSDocTagNode',
        lastMarker: 'LastJSDocTagNode',
        description: 'JSDoc tag nodes',
        characteristics: ['jsdoc-tag', 'documentation', 'structured']
      }
    ];

    // Build groups based on markers
    for (const groupDef of groupDefinitions) {
      const firstMarker = this.markers.find(m => m.name === groupDef.firstMarker);
      const lastMarker = this.markers.find(m => m.name === groupDef.lastMarker);

      if (firstMarker && lastMarker) {
        const start = firstMarker.value;
        const end = lastMarker.value;
        const members = this.allKinds.filter(
          kind => kind.value >= start && kind.value <= end && !kind.isMarker
        );

        this.groups.push({
          name: groupDef.name,
          start,
          end,
          firstMarker: firstMarker.name,
          lastMarker: lastMarker.name,
          count: members.length,
          members,
          characteristics: groupDef.characteristics,
          description: groupDef.description
        });

        // Mark group membership
        members.forEach(member => {
          member.group = groupDef.name;
        });
      }
    }

    // Sort groups by start position
    this.groups.sort((a, b) => a.start - b.start);
  }

  public getAnalysis(): SyntaxKindAnalysis {
    const unmappedKinds = this.allKinds.filter(kind => !kind.isMarker && !kind.group);

    return {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      totalCount: this.allKinds.length,
      groups: this.groups,
      allKinds: this.allKinds,
      markers: this.markers,
      unmappedKinds
    };
  }

  public generateRulerVisualization(): string {
    const lines: string[] = [];
    lines.push('# SyntaxKind Group Visualization');
    lines.push('');
    lines.push('```');
    lines.push('Value Range Ruler:');
    lines.push('0    50   100  150  200  250  300  350');
    lines.push('|    |    |    |    |    |    |    |');
    
    // Add group ranges
    for (const group of this.groups) {
      const startPos = Math.floor(group.start / 10);
      const endPos = Math.floor(group.end / 10);
      const padding = ' '.repeat(startPos);
      const range = `[${group.start}-${group.end}]`;
      lines.push(`${padding}${range} ${group.name}`);
    }
    
    lines.push('```');
    lines.push('');
    
    // Add detailed group information
    lines.push('## Group Details');
    lines.push('');
    
    for (const group of this.groups) {
      lines.push(`### ${group.name}`);
      lines.push(`- **Range**: ${group.start} - ${group.end}`);
      lines.push(`- **Count**: ${group.count} members`);
      lines.push(`- **Markers**: \`${group.firstMarker}\` → \`${group.lastMarker}\``);
      lines.push(`- **Description**: ${group.description}`);
      lines.push(`- **Characteristics**: ${group.characteristics.join(', ')}`);
      lines.push('');
    }
    
    return lines.join('\n');
  }
}

// ============================================================================
// Output Generation
// ============================================================================

function generateTypeScriptOutput(analysis: SyntaxKindAnalysis): string {
  const header = `// WARNING: This file is AUTO-GENERATED by scripts/generate-syntax-kind-names.ts
// DO NOT EDIT MANUALLY - Your changes will be overwritten!
// Generated from TypeScript SyntaxKind enum analysis
// Generated at: ${analysis.generatedAt}

/**
 * Enhanced SyntaxKind analysis with group information
 */

`;

  // Generate the basic syntax kind names map
  const kindEntries = analysis.allKinds
    .filter(kind => !kind.isMarker)
    .map(kind => `  ${kind.value}: '${kind.name}'`)
    .join(',\n');

  const syntaxKindNames = `export const SYNTAX_KIND_NAMES: Record<number, string> = {
${kindEntries}
};

`;

  // Generate group information
  const groupEntries = analysis.groups
    .map(group => `  '${group.name}': {
    name: '${group.name}',
    start: ${group.start},
    end: ${group.end},
    count: ${group.count},
    characteristics: [${group.characteristics.map(c => `'${c}'`).join(', ')}],
    description: '${group.description}'
  }`)
    .join(',\n');

  const groupInfo = `export const SYNTAX_KIND_GROUPS = {
${groupEntries}
};

`;

  // Generate utility functions
  const utilities = `/**
 * Get a human-readable name for a SyntaxKind enum value.
 */
export function getSyntaxKindName(kind: number): string {
  return SYNTAX_KIND_NAMES[kind] || 'Unknown';
}

/**
 * Get the group information for a SyntaxKind value.
 */
export function getSyntaxKindGroup(kind: number): string | undefined {
  for (const [groupName, groupInfo] of Object.entries(SYNTAX_KIND_GROUPS)) {
    if (kind >= groupInfo.start && kind <= groupInfo.end) {
      return groupName;
    }
  }
  return undefined;
}

/**
 * Check if a SyntaxKind belongs to a specific group.
 */
export function isSyntaxKindInGroup(kind: number, groupName: string): boolean {
  const group = SYNTAX_KIND_GROUPS[groupName as keyof typeof SYNTAX_KIND_GROUPS];
  if (!group) return false;
  return kind >= group.start && kind <= group.end;
}

/**
 * Get all SyntaxKind values in a specific group.
 */
export function getSyntaxKindsInGroup(groupName: string): number[] {
  const group = SYNTAX_KIND_GROUPS[groupName as keyof typeof SYNTAX_KIND_GROUPS];
  if (!group) return [];
  
  return Object.keys(SYNTAX_KIND_NAMES)
    .map(Number)
    .filter(kind => kind >= group.start && kind <= group.end);
}

`;

  return header + syntaxKindNames + groupInfo + utilities;
}

// ============================================================================
// CLI Interface
// ============================================================================

const program = new Command();

program
  .name('generate-syntax-kind-names')
  .description('Enhanced TypeScript SyntaxKind analyzer with group detection')
  .version('1.0.0')
  .option('--output-dir <dir>', 'Output directory', 'src/core')
  .option('--generate-docs', 'Generate documentation with ruler visualization')
  .option('--json-only', 'Generate only JSON output')
  .option('--dry-run', 'Show what would be generated without writing files');

program.parse();

const options = program.opts();

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log('🔍 Analyzing TypeScript SyntaxKind enum...');
  
  const analyzer = new SyntaxKindAnalyzer();
  const analysis = analyzer.getAnalysis();
  
  console.log(`📊 Analysis complete:`);
  console.log(`   - Total SyntaxKinds: ${analysis.totalCount}`);
  console.log(`   - Groups identified: ${analysis.groups.length}`);
  console.log(`   - Markers found: ${analysis.markers.length}`);
  console.log(`   - Unmapped kinds: ${analysis.unmappedKinds.length}`);
  
  if (analysis.unmappedKinds.length > 0) {
    console.log(`⚠️  Unmapped kinds: ${analysis.unmappedKinds.map(k => k.name).join(', ')}`);
  }
  
  if (options.dryRun) {
    console.log('\n🔍 Dry run mode - showing what would be generated:');
    console.log('Groups:');
    analysis.groups.forEach(group => {
      console.log(`  - ${group.name}: ${group.count} members (${group.start}-${group.end})`);
    });
    return;
  }
  
  const outputDir = join(process.cwd(), options.outputDir);
  
  // Generate JSON analysis
  const jsonPath = join(outputDir, 'syntax-kind-analysis.json');
  writeFileSync(jsonPath, JSON.stringify(analysis, null, 2), 'utf-8');
  console.log(`📁 Generated analysis JSON: ${jsonPath}`);
  
  if (!options.jsonOnly) {
    // Generate TypeScript file
    const tsCode = generateTypeScriptOutput(analysis);
    const tsPath = join(outputDir, 'syntax-kind-names.ts');
    writeFileSync(tsPath, tsCode, 'utf-8');
    console.log(`📁 Generated TypeScript: ${tsPath}`);
    
    // Keep the simple JSON for backward compatibility
    const simpleMap: Record<number, string> = {};
    analysis.allKinds
      .filter(kind => !kind.isMarker)
      .forEach(kind => {
        simpleMap[kind.value] = kind.name;
      });
    
    const simpleJsonPath = join(outputDir, 'syntax-kind-names.json');
    writeFileSync(simpleJsonPath, JSON.stringify(simpleMap, null, 2), 'utf-8');
    console.log(`📁 Generated simple JSON: ${simpleJsonPath}`);
  }
  
  if (options.generateDocs) {
    // Generate documentation with ruler
    const docsPath = join(process.cwd(), 'docs', 'syntax-kind-ruler.md');
    const ruler = analyzer.generateRulerVisualization();
    writeFileSync(docsPath, ruler, 'utf-8');
    console.log(`📁 Generated ruler docs: ${docsPath}`);
  }
  
  console.log('✅ SyntaxKind analysis complete!');
}

if (require.main === module) {
  main();
}
