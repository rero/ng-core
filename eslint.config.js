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
    rules: {},
  }
);
