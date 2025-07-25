/**
 * BNF Grammar Definition
 * 
 * This file defines the BNF model for parsing BNF grammar files themselves.
 * It describes the syntax for our custom BNF notation format.
 */

import type { BNFModel } from '../../bnf-model/types';

/**
 * BNF Grammar Syntax Model
 * 
 * Format:
 * ```
 * name: grammar name
 * version: version number
 * start: StartNodeName
 * 
 * # Description
 * SomeToken :: 'string' or /regex/
 * 
 * # Description  
 * SomeDeduction :: TokenA NodeB:prop TokenC
 * 
 * # Description
 * SomeUnion :: NodeA | NodeB | NodeC
 * ```
 */
export const bnfGrammarModel: BNFModel = {
  name: 'BNFGrammar',
  version: '1.0.0',
  start: 'Grammar',
  nodes: {
    // ==== TOKENS ====
    
    // Basic tokens
    Identifier: {
      type: 'token',
      description: 'An identifier (node name, property name, etc.)',
      pattern: { regex: '[a-zA-Z_][a-zA-Z0-9_]*' }
    },
    
    String: {
      type: 'token', 
      description: 'A quoted string literal',
      pattern: { regex: "'([^'\\\\]|\\\\.)*'" }
    },
    
    Regex: {
      type: 'token',
      description: 'A regular expression pattern',
      pattern: { regex: '/([^/\\\\]|\\\\.)+/' }
    },
    
    Number: {
      type: 'token',
      description: 'A numeric value',
      pattern: { regex: '\\d+(\\.\\d+)?' }
    },
    
    Comment: {
      type: 'token',
      description: 'A comment line starting with #',
      pattern: { regex: '#[^\\n]*' }
    },
    
    // Keywords and operators
    NameKeyword: {
      type: 'token',
      description: 'The "name:" keyword',
      pattern: 'name:'
    },
    
    VersionKeyword: {
      type: 'token', 
      description: 'The "version:" keyword',
      pattern: 'version:'
    },
    
    StartKeyword: {
      type: 'token',
      description: 'The "start:" keyword', 
      pattern: 'start:'
    },
    
    DefineOperator: {
      type: 'token',
      description: 'The "::" definition operator',
      pattern: '::'
    },
    
    UnionOperator: {
      type: 'token',
      description: 'The "|" union operator',
      pattern: '|'
    },
    
    PropertyOperator: {
      type: 'token',
      description: 'The ":" property assignment operator',
      pattern: ':'
    },
    
    // Whitespace and newlines
    Whitespace: {
      type: 'token',
      description: 'Whitespace characters',
      pattern: { regex: '[ \\t]+' }
    },
    
    Newline: {
      type: 'token',
      description: 'Line break character',
      pattern: { regex: '\\r?\\n' }
    },
    
    // ==== DEDUCTION RULES ====
    
    Grammar: {
      type: 'deduction',
      description: 'Complete BNF grammar definition',
      sequence: [
        { node: 'Header', prop: 'header' },
        { node: 'RuleList', prop: 'rules' }
      ]
    },
    
    Header: {
      type: 'deduction', 
      description: 'Grammar header with metadata',
      sequence: [
        { node: 'NameDeclaration', prop: 'name' },
        { node: 'VersionDeclaration', prop: 'version' },
        { node: 'StartDeclaration', prop: 'start' }
      ]
    },
    
    NameDeclaration: {
      type: 'deduction',
      description: 'Grammar name declaration',
      sequence: [
        'NameKeyword',
        { node: 'Identifier', prop: 'value' },
        'Newline'
      ]
    },
    
    VersionDeclaration: {
      type: 'deduction',
      description: 'Grammar version declaration', 
      sequence: [
        'VersionKeyword',
        { node: 'Identifier', prop: 'value' },
        'Newline'
      ]
    },
    
    StartDeclaration: {
      type: 'deduction',
      description: 'Grammar start rule declaration',
      sequence: [
        'StartKeyword', 
        { node: 'Identifier', prop: 'value' },
        'Newline'
      ]
    },
    
    RuleList: {
      type: 'deduction',
      description: 'List of grammar rules',
      sequence: [
        { node: 'Rule', prop: 'rules' } // This should be a repetition in real implementation
      ]
    },
    
    Rule: {
      type: 'deduction',
      description: 'A single grammar rule definition',
      sequence: [
        { node: 'OptionalComment', prop: 'comment' },
        { node: 'RuleDefinition', prop: 'definition' },
        'Newline'
      ]
    },
    
    OptionalComment: {
      type: 'deduction',
      description: 'Optional comment before rule',
      sequence: [
        'Comment',
        'Newline'
      ]
    },
    
    RuleDefinition: {
      type: 'deduction',
      description: 'Rule name and body definition',
      sequence: [
        { node: 'Identifier', prop: 'name' },
        'DefineOperator',
        { node: 'RuleBody', prop: 'body' }
      ]
    },
    
    // Token rule body
    TokenRule: {
      type: 'deduction',
      description: 'Token rule with string or regex pattern',
      sequence: [
        { node: 'TokenPattern', prop: 'pattern' }
      ]
    },
    
    // Deduction rule body  
    DeductionRule: {
      type: 'deduction',
      description: 'Deduction rule with sequence of elements',
      sequence: [
        { node: 'ElementList', prop: 'sequence' }
      ]
    },
    
    // Union rule body
    UnionRule: {
      type: 'deduction', 
      description: 'Union rule with alternative choices',
      sequence: [
        { node: 'UnionMemberList', prop: 'members' }
      ]
    },
    
    ElementList: {
      type: 'deduction',
      description: 'Sequence of elements in a deduction rule',
      sequence: [
        { node: 'Element', prop: 'elements' } // Should be repetition
      ]
    },
    
    Element: {
      type: 'deduction',
      description: 'Single element in a sequence',
      sequence: [
        { node: 'Identifier', prop: 'node' },
        { node: 'OptionalProperty', prop: 'property' }
      ]
    },
    
    OptionalProperty: {
      type: 'deduction',
      description: 'Optional property assignment',
      sequence: [
        'PropertyOperator',
        { node: 'Identifier', prop: 'name' }
      ]
    },
    
    UnionMemberList: {
      type: 'deduction',
      description: 'List of union members separated by |',
      sequence: [
        { node: 'Identifier', prop: 'first' },
        { node: 'AdditionalMembers', prop: 'rest' }
      ]
    },
    
    AdditionalMembers: {
      type: 'deduction',
      description: 'Additional union members',
      sequence: [
        'UnionOperator',
        { node: 'Identifier', prop: 'member' }
        // Should be repetition
      ]
    },
    
    // ==== UNION RULES ====
    
    TokenPattern: {
      type: 'union',
      description: 'Either a string literal or regex pattern',
      members: ['String', 'Regex']
    },
    
    RuleBody: {
      type: 'union',
      description: 'Body of a rule - can be token, deduction, or union',
      members: ['TokenRule', 'DeductionRule', 'UnionRule']
    }
  }
};

export default bnfGrammarModel;
