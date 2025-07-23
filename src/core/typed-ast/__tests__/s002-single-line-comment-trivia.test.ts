/**
 * SingleLineCommentTrivia 类型单元测试
 */
import { expect, test, describe } from 'bun:test';
import type { SingleLineCommentTriviaNode } from '../types/s002-single-line-comment-trivia';
import { isSingleLineCommentTrivia } from '../types/s002-single-line-comment-trivia';

describe('SingleLineCommentTrivia', () => {
  test('should create SingleLineCommentTriviaNode with correct properties', () => {
    const node: SingleLineCommentTriviaNode = {
      id: 'comment-1',
      kind: 2,
      text: '// This is a comment',
      content: ' This is a comment',
    };

    expect(node.kind).toBe(2);
    expect(node.text).toBe('// This is a comment');
    expect(node.content).toBe(' This is a comment');
    expect(node.id).toBe('comment-1');
  });

  test('should identify SingleLineCommentTrivia nodes correctly', () => {
    const commentNode: SingleLineCommentTriviaNode = {
      id: 'comment-1',
      kind: 2,
      text: '// test',
      content: ' test',
    };

    const otherNode = {
      id: 'other-1',
      kind: 1,
      text: '',
    };

    expect(isSingleLineCommentTrivia(commentNode)).toBe(true);
    expect(isSingleLineCommentTrivia(otherNode as any)).toBe(false);
  });

  test('should handle empty comments', () => {
    const node: SingleLineCommentTriviaNode = {
      id: 'comment-empty',
      kind: 2,
      text: '//',
      content: '',
    };

    expect(node.text).toBe('//');
    expect(node.content).toBe('');
  });

  test('should handle comments with special characters', () => {
    const node: SingleLineCommentTriviaNode = {
      id: 'comment-special',
      kind: 2,
      text: '// TODO: fix this 中文 emoji 🚀',
      content: ' TODO: fix this 中文 emoji 🚀',
    };

    expect(node.text).toBe('// TODO: fix this 中文 emoji 🚀');
    expect(node.content).toBe(' TODO: fix this 中文 emoji 🚀');
  });
});
