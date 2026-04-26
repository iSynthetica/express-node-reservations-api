import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const tsconfigRootDir = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },
  ...tsPlugin.configs['flat/strict-type-checked'].map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  ...tsPlugin.configs['flat/stylistic-type-checked'].map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir,
      },
      globals: {
        ...globals.node,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../app/*', '../../app/*', '../modules/*', '../../modules/*'],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../modules/*/*',
                '../modules/*/*/*',
                '../modules/*/*/*/*',
                '!../modules/*/public-api',
              ],
              message:
                'App layer must import modules via their public API only (../modules/<module>/public-api).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/modules/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../../app/*', '../../../../app/*', '../../../../../app/*'],
              message: 'Modules must not import the app layer.',
            },
            {
              group: [
                '../../../modules/*/*',
                '../../../../modules/*/*',
                '../../../../../modules/*/*',
                '!../../../modules/*/public-api',
                '!../../../../modules/*/public-api',
                '!../../../../../modules/*/public-api',
              ],
              message: 'Cross-module imports must go through ../modules/<module>/public-api only.',
            },
          ],
        },
      ],
    },
  },
  prettier,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      'object-curly-spacing': ['error', 'always'],
    },
  },
];
