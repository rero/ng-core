// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, ...tseslint.configs.stylistic, ...angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/prefer-standalone': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@angular-eslint/component-class-suffix': 'warn',
      '@angular-eslint/no-output-on-prefix': 'warn',
      '@angular-eslint/no-output-native': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@angular-eslint/directive-selector': [
        'error',
        {
          style: 'camelCase',
          type: 'attribute',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          prefix: ['ng-core', 'app'],
          style: 'kebab-case',
          type: 'element',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
    },
  }
);
