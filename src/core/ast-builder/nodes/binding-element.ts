import * as ts from 'typescript';
import type { SourceFileAST, ASTNode } from '../../types';
import type { CreateNodeFn, NodeBuilderFn } from '../types';

export const createBindingElement: NodeBuilderFn<ts.BindingElement> = (createNode: CreateNodeFn) => {
  return (sourceFile: SourceFileAST, node: ASTNode): ts.BindingElement => {
    const children = node.children || [];
    
    if (children.length < 1) {
      throw new Error(`BindingElement should have at least 1 child (name), got ${children.length}`);
    }
    
    // BindingElement的结构可能是：
    // 1. [name] - 简单的 { id }
    // 2. [propertyName, :, name] - 重命名的 { id: newId }
    // 3. [name, =, initializer] - 带默认值的 { id = default }
    // 4. [propertyName, :, name, =, initializer] - 完整形式
    // 5. [..., name] - rest元素 { ...rest }
    
    let dotDotDotToken: ts.DotDotDotToken | undefined;
    let propertyName: ts.PropertyName | undefined;
    let name: ts.BindingName | undefined;
    let initializer: ts.Expression | undefined;
    
    if (children.length === 1) {
      // 简单形式：{ id }
      const nameId = children[0];
      const nameNode = sourceFile.nodes[nameId!];
      if (!nameNode) {
        throw new Error(`Name node ${nameId} not found`);
      }
      name = createNode(sourceFile, nameNode) as ts.BindingName;
    } else {
      // 复杂形式，需要解析结构
      for (let i = 0; i < children.length; i++) {
        const childId = children[i];
        if (!childId) continue;
        
        const childNode = sourceFile.nodes[childId];
        if (!childNode) continue;
        
        if (childNode.kind === ts.SyntaxKind.DotDotDotToken) {
          // 这是一个 rest 元素
          dotDotDotToken = ts.factory.createToken(ts.SyntaxKind.DotDotDotToken);
        } else if (childNode.kind === ts.SyntaxKind.ColonToken) {
          // 前面的是propertyName，后面的是name
          if (i > 0) {
            const propNameId = children[i - 1];
            if (propNameId) {
              const propNameNode = sourceFile.nodes[propNameId];
              if (propNameNode) {
                propertyName = createNode(sourceFile, propNameNode) as ts.PropertyName;
              }
            }
          }
          if (i + 1 < children.length) {
            const nameId = children[i + 1];
            if (nameId) {
              const nameNode = sourceFile.nodes[nameId];
              if (nameNode && nameNode.kind !== ts.SyntaxKind.EqualsToken) {
                name = createNode(sourceFile, nameNode) as ts.BindingName;
              }
            }
          }
        } else if (childNode.kind === ts.SyntaxKind.EqualsToken) {
          // 后面的是initializer
          if (i + 1 < children.length) {
            const initId = children[i + 1];
            if (initId) {
              const initNode = sourceFile.nodes[initId];
              if (initNode) {
                initializer = createNode(sourceFile, initNode) as ts.Expression;
              }
            }
          }
        } else if (!propertyName && !name) {
          // 第一个非特殊token就是name（如果没有colon）
          name = createNode(sourceFile, childNode) as ts.BindingName;
        }
      }
    }
    
    if (!name) {
      throw new Error('BindingElement missing name');
    }
    
    return ts.factory.createBindingElement(
      dotDotDotToken,
      propertyName,
      name,
      initializer
    );
  };
};
