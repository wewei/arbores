#!/bin/bash

# 修复所有metadata.yaml文件中的反斜杠路径为正斜杠
find src/cli/__tests__/e2e/baselines -name "metadata.yaml" -exec sed -i '' 's|src\\cli\\__tests__\\fixtures\\|src/cli/__tests__/fixtures/|g' {} \;

echo "已修复所有metadata.yaml文件中的路径分隔符"
