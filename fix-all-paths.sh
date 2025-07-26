#!/bin/bash

# 查找所有包含反斜杠路径的metadata.yaml文件并修复
files=$(find src/cli/__tests__/e2e/baselines -name "metadata.yaml" -exec grep -l "\\\\" {} \;)

for file in $files; do
    echo "修复文件: $file"
    # 替换路径中的反斜杠为正斜杠
    sed -i '' 's|src/cli\\__tests__\\fixtures\\|src/cli/__tests__/fixtures/|g' "$file"
done

echo "修复完成！"
