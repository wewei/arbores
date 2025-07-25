import type { BNFModel, BNFNode, TokenNode, DeductionNode, UnionNode, DeductionElement } from "./types";

export interface PegGeneratorOptions {
  startRule?: string;
  includeWhitespace?: boolean;
  whitespacePattern?: string;
  includeLocation?: boolean;
  includeDebugInfo?: boolean;
}

export interface LeftRecursionInfo {
  hasLeftRecursion: boolean;
  recursiveRules: string[];
  cyclePath?: string[];
}

export interface PegGenerationResult {
  grammar: string;
  warnings: string[];
  stats: {
    totalRules: number;
    tokenRules: number;
    deductionRules: number;
    unionRules: number;
    leftRecursiveRules: string[];
  };
}

/**
 * Error thrown when PEG generation fails
 */
export class PegGenerationError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'PegGenerationError';
  }
}

/**
 * PEG.js grammar generator from BNF models
 * 
 * Converts BNF model to PEG.js grammar string for parser generation.
 * Handles left recursion detection and transformation.
 */
export class PegGenerator {
  private options: Required<PegGeneratorOptions>;
  private dependencyGraph: Map<string, Set<string>> = new Map();
  private visited: Set<string> = new Set();
  private visitStack: Set<string> = new Set();

  constructor(options: PegGeneratorOptions = {}) {
    this.options = {
      startRule: options.startRule || 'Program',
      includeWhitespace: options.includeWhitespace ?? true,
      whitespacePattern: options.whitespacePattern || '[ \\t\\n\\r]*',
      includeLocation: options.includeLocation ?? true,
      includeDebugInfo: options.includeDebugInfo ?? false
    };
  }

  /**
   * Generate PEG.js grammar from BNF model
   */
  generate(model: BNFModel): PegGenerationResult {
    try {
      // Update default start rule if not provided
      if (!this.options.startRule || this.options.startRule === 'Program') {
        this.options.startRule = model.start || Object.keys(model.nodes)[0] || 'Program';
      }

      // Validate start rule exists
      if (this.options.startRule && !model.nodes[this.options.startRule]) {
        throw new PegGenerationError(`Start rule "${this.options.startRule}" not found in model`);
      }

      // Reset state
      this.dependencyGraph.clear();
      this.visited.clear();
      this.visitStack.clear();

      // Build dependency graph
      this.buildDependencyGraph(model);

      // Check for left recursion (as warnings, not errors)
      const leftRecursionInfo = this.detectLeftRecursion(model);
      const warnings: string[] = [];

      if (leftRecursionInfo.hasLeftRecursion) {
        warnings.push(`Left recursion detected in rules: ${leftRecursionInfo.recursiveRules.join(', ')}`);
        if (leftRecursionInfo.cyclePath) {
          warnings.push(`Cycle path: ${leftRecursionInfo.cyclePath.join(' -> ')}`);
        }
      }

      // Check for complex regex patterns
      this.checkComplexPatterns(model, warnings);

      // Generate ordered rules (including left recursive ones with warnings)
      const orderedRules = this.getTopologicalOrder(model);
      const pegRules = orderedRules.map(ruleName => this.generateRule(model, ruleName));

      // Generate grammar
      const grammarParts: string[] = [];

      // Add header comment
      grammarParts.push(`// Generated PEG.js grammar for ${model.name}`);
      grammarParts.push(`// Version: ${model.version}`);
      grammarParts.push('');

      // Add start rule directive
      grammarParts.push(`start = ${this.options.startRule}`);
      grammarParts.push('');

      // Add whitespace rule if needed
      if (this.options.includeWhitespace) {
        grammarParts.push(`_ "whitespace" = ${this.options.whitespacePattern}`);
        grammarParts.push(`__ "required whitespace" = ${this.options.whitespacePattern.replace('*', '+')}`);
        grammarParts.push('');
      }

      // Add rules
      grammarParts.push(...pegRules);

      const grammar = grammarParts.join('\n');

      // Calculate statistics
      const stats = this.calculateStats(model, leftRecursionInfo.recursiveRules);

      return {
        grammar,
        warnings,
        stats
      };
    } catch (error) {
      if (error instanceof PegGenerationError) {
        throw error;
      }
      throw new PegGenerationError(`Failed to generate PEG grammar: ${(error as Error).message}`, error);
    }
  }

  /**
   * Build dependency graph for all rules
   */
  private buildDependencyGraph(model: BNFModel): void {
    for (const [nodeName, node] of Object.entries(model.nodes)) {
      const deps = new Set<string>();
      this.collectDependencies(node, deps, model);
      this.dependencyGraph.set(nodeName, deps);
    }
  }

  /**
   * Collect dependencies from a BNF node
   */
  private collectDependencies(node: BNFNode, deps: Set<string>, model: BNFModel): void {
    switch (node.type) {
      case 'token':
        // Tokens don't have dependencies
        break;
      case 'deduction':
        for (const element of node.sequence) {
          if (typeof element === 'string') {
            deps.add(element);
          } else {
            deps.add(element.node);
          }
        }
        break;
      case 'union':
        for (const member of node.members) {
          deps.add(member);
        }
        break;
    }
  }

  /**
   * Detect left recursion using proper cycle detection
   */
  private detectLeftRecursion(model: BNFModel): LeftRecursionInfo {
    this.visited.clear();
    this.visitStack.clear();

    const recursiveRules: string[] = [];
    let cyclePath: string[] | undefined;

    for (const nodeName of Object.keys(model.nodes)) {
      if (!this.visited.has(nodeName)) {
        const result = this.detectLeftRecursionInRule(nodeName, model, []);
        if (result.hasLeftRecursion) {
          recursiveRules.push(nodeName);
          if (!cyclePath) {
            cyclePath = result.cyclePath;
          }
        }
      }
    }

    return {
      hasLeftRecursion: recursiveRules.length > 0,
      recursiveRules,
      cyclePath
    };
  }

  /**
   * Detect left recursion starting from a specific rule
   */
  private detectLeftRecursionInRule(nodeName: string, model: BNFModel, path: string[]): LeftRecursionInfo {
    // Check if we've found a cycle
    if (path.includes(nodeName)) {
      const cycleStart = path.indexOf(nodeName);
      const cyclePath = [...path.slice(cycleStart), nodeName];
      return {
        hasLeftRecursion: true,
        recursiveRules: [nodeName],
        cyclePath
      };
    }

    // Mark as visiting
    this.visitStack.add(nodeName);
    const newPath = [...path, nodeName];

    // Find the node
    const node = model.nodes[nodeName];
    if (!node) {
      this.visitStack.delete(nodeName);
      return { hasLeftRecursion: false, recursiveRules: [] };
    }

    // Check if this rule has left recursion through its first symbols
    const firstSymbols = this.getFirstSymbols(node);

    for (const symbol of firstSymbols) {
      if (symbol === nodeName) {
        // Direct left recursion
        this.visitStack.delete(nodeName);
        return {
          hasLeftRecursion: true,
          recursiveRules: [nodeName],
          cyclePath: [nodeName, nodeName]
        };
      }

      // Check for indirect left recursion
      if (!this.visited.has(symbol)) {
        const result = this.detectLeftRecursionInRule(symbol, model, newPath);
        if (result.hasLeftRecursion) {
          this.visitStack.delete(nodeName);
          return result;
        }
      }
    }

    this.visitStack.delete(nodeName);
    this.visited.add(nodeName);

    return { hasLeftRecursion: false, recursiveRules: [] };
  }

  /**
   * Get first symbols that can appear at the start of a rule
   */
  private getFirstSymbols(node: BNFNode): string[] {
    const symbols: string[] = [];

    switch (node.type) {
      case 'token':
        // Tokens don't contribute to left recursion
        break;
      case 'deduction':
        // For deductions, the first element can be at the start
        if (node.sequence.length > 0) {
          const first = node.sequence[0];
          if (first) {
            if (typeof first === 'string') {
              symbols.push(first);
            } else {
              symbols.push(first.node);
            }
          }
        }
        break;
      case 'union':
        // For unions, any member can be at the start
        symbols.push(...node.members);
        break;
    }

    return symbols;
  }

  /**
   * Get topological order of rules (dependencies first)
   */
  private getTopologicalOrder(model: BNFModel): string[] {
    this.visited.clear();
    const order: string[] = [];

    for (const nodeName of Object.keys(model.nodes)) {
      if (!this.visited.has(nodeName)) {
        this.topologicalSort(nodeName, order);
      }
    }

    return order.reverse();
  }

  /**
   * Topological sort helper
   */
  private topologicalSort(nodeName: string, order: string[]): void {
    this.visited.add(nodeName);

    const deps = this.dependencyGraph.get(nodeName);
    if (deps) {
      for (const dep of deps) {
        if (!this.visited.has(dep)) {
          this.topologicalSort(dep, order);
        }
      }
    }

    order.push(nodeName);
  }

  /**
   * Generate PEG rule for a specific BNF rule
   */
  private generateRule(model: BNFModel, nodeName: string): string {
    const node = model.nodes[nodeName];
    if (!node) {
      throw new PegGenerationError(`Node not found: ${nodeName}`);
    }

    const pegExpression = this.generateExpression(node);
    const description = node.description ? ` "${node.description}"` : '';
    return `${nodeName}${description} = ${pegExpression}`;
  }

  /**
   * Generate PEG expression from BNF node
   */
  private generateExpression(node: BNFNode): string {
    switch (node.type) {
      case 'token':
        return this.generateToken(node);
      case 'deduction':
        return this.generateDeduction(node);
      case 'union':
        return this.generateUnion(node);
      default:
        throw new PegGenerationError(`Unsupported node type: ${(node as any).type}`);
    }
  }

  private generateToken(node: TokenNode): string {
    if (typeof node.pattern === 'string') {
      // For string patterns, generate quoted string literals
      return `"${node.pattern}"`;
    } else {
      // For regex patterns, convert to appropriate PEG.js format
      const pattern = node.pattern.regex;

      // Convert some common regex patterns to PEG.js format
      if (pattern === '\\d+') {
        return '[0-9]+';
      } else if (pattern === '[a-zA-Z_][a-zA-Z0-9_]*') {
        // Already in correct PEG.js format
        return pattern;
      } else if (pattern.startsWith('[') && pattern.endsWith(']')) {
        // Already in character class format
        return pattern;
      } else {
        // Wrap in character class if needed
        return `[${pattern}]`;
      }
    }
  }

  private generateDeduction(node: DeductionNode): string {
    const elements = node.sequence.map(element => {
      if (typeof element === 'string') {
        return element;
      } else {
        // Generate property assignment: prop:Node
        return `${element.prop}:${element.node}`;
      }
    });

    if (this.options.includeWhitespace && elements.length > 1) {
      return elements.join(' _ ');
    }

    return elements.join(' ');
  }

  private generateUnion(node: UnionNode): string {
    return node.members.join(' / ');
  }

  /**
   * Check for complex regex patterns that might need warnings
   */
  private checkComplexPatterns(model: BNFModel, warnings: string[]): void {
    for (const [nodeName, node] of Object.entries(model.nodes)) {
      if (node.type === 'token' && typeof node.pattern === 'object') {
        const pattern = node.pattern.regex;

        // Check for complex patterns that might be problematic in PEG.js
        if (pattern.includes('?') || pattern.includes('*') || pattern.includes('+') ||
          pattern.includes('|') || pattern.includes('(') || pattern.includes('[')) {
          warnings.push(`Complex regex pattern in token "${nodeName}": ${pattern}`);
        }
      }
    }
  }

  /**
   * Calculate generation statistics
   */
  private calculateStats(model: BNFModel, leftRecursiveRules: string[]) {
    let tokenRules = 0;
    let deductionRules = 0;
    let unionRules = 0;

    for (const node of Object.values(model.nodes)) {
      switch (node.type) {
        case 'token':
          tokenRules++;
          break;
        case 'deduction':
          deductionRules++;
          break;
        case 'union':
          unionRules++;
          break;
      }
    }

    return {
      totalRules: Object.keys(model.nodes).length,
      tokenRules,
      deductionRules,
      unionRules,
      leftRecursiveRules
    };
  }
}

/**
 * Convenience function to generate PEG.js grammar from BNF model
 */
export function generatePegGrammar(model: BNFModel, options?: PegGeneratorOptions): PegGenerationResult {
  const generator = new PegGenerator(options);
  return generator.generate(model);
}
