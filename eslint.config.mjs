// ESLint 9 flat config（对齐工作区 admin-web · 规则来源 lieshou-cloud-pro/.ai/CONVENTIONS.md）
// 跑法：pnpm lint / pnpm lint:fix
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 1. 忽略构建产物 / 依赖 / submodule 共享仓 / 生成薄壳页 / CommonJS 脚手架文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.swc/**',
      'src/pages/boot/**',
      'babel.config.js',
      'project.config.json',
    ],
  },

  // 2. 基础集 + TypeScript 推荐
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 2.5 React Hooks 规则（React 18/19 · 代码中已有 exhaustive-deps disable 注释）
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // 3. 业务规则（与工作区 §1-§6 对齐）
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      eqeqeq: ['error', 'always'],
    },
  },

  // 4. 测试文件宽松
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
);
