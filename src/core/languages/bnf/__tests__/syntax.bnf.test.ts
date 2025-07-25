import { describe, it, expect } from 'bun:test';
import { bnfGrammarModel } from '../syntax.bnf';

describe('BNF Grammar Model', () => {
  it('should be a valid BNF model', () => {
    expect(bnfGrammarModel).toBeDefined();
    expect(bnfGrammarModel.name).toBe('BNFGrammar');
    expect(bnfGrammarModel.start).toBe('Grammar');
    expect(bnfGrammarModel.version).toBe('1.0.0');
  });

  it('should have nodes defined', () => {
    expect(bnfGrammarModel.nodes).toBeDefined();
    expect(Object.keys(bnfGrammarModel.nodes).length).toBeGreaterThan(0);
  });

  it('should have basic token nodes', () => {
    const nodes = bnfGrammarModel.nodes;

    expect(nodes.Identifier).toBeDefined();
    expect(nodes.String).toBeDefined();
    expect(nodes.Regex).toBeDefined();
    expect(nodes.Number).toBeDefined();
    expect(nodes.Comment).toBeDefined();
    expect(nodes.DefineOperator).toBeDefined();
    expect(nodes.UnionOperator).toBeDefined();
  });

  it('should have structural nodes', () => {
    const nodes = bnfGrammarModel.nodes;

    expect(nodes.Grammar).toBeDefined();
    expect(nodes.Header).toBeDefined();
    expect(nodes.RuleList).toBeDefined();
    expect(nodes.Rule).toBeDefined();
    expect(nodes.RuleDefinition).toBeDefined();
  });

  it('should have the start rule defined', () => {
    const startRule = bnfGrammarModel.nodes[bnfGrammarModel.start];
    expect(startRule).toBeDefined();
    expect(startRule?.type).toBe('deduction');
  });

  it('should define union nodes for alternatives', () => {
    const nodes = bnfGrammarModel.nodes;

    // Find union nodes by type
    const unionNodes = Object.keys(nodes).filter(name => nodes[name]?.type === 'union');
    expect(unionNodes.length).toBeGreaterThan(0);

    // Check the actual union nodes
    expect(nodes.TokenPattern?.type).toBe('union');
    expect(nodes.RuleBody?.type).toBe('union');
  });

  it('should have reasonable node counts', () => {
    const nodes = bnfGrammarModel.nodes;
    const nodeNames = Object.keys(nodes);

    // Should have around 30+ nodes for a comprehensive BNF grammar
    expect(nodeNames.length).toBeGreaterThan(25);
    expect(nodeNames.length).toBeLessThan(50);

    // Should have a mix of node types
    const tokenNodes = nodeNames.filter(name => nodes[name]?.type === 'token');
    const deductionNodes = nodeNames.filter(name => nodes[name]?.type === 'deduction');
    const unionNodes = nodeNames.filter(name => nodes[name]?.type === 'union');

    expect(tokenNodes.length).toBeGreaterThan(5);
    expect(deductionNodes.length).toBeGreaterThan(5);
    expect(unionNodes.length).toBeGreaterThan(1);
  });

  it('should include keywords and operators', () => {
    const nodes = bnfGrammarModel.nodes;

    expect(nodes.NameKeyword).toBeDefined();
    expect(nodes.VersionKeyword).toBeDefined();
    expect(nodes.StartKeyword).toBeDefined();
    expect(nodes.DefineOperator).toBeDefined();
    expect(nodes.UnionOperator).toBeDefined();
  });
});
