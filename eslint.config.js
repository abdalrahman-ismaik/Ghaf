const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const ghafCommentRules = {
  rules: {
    'line-comments-only': {
      meta: {
        type: 'layout',
        docs: { description: 'Require line comments in JavaScript and TypeScript source' },
        schema: [],
        messages: {
          useLineComment: 'Use consecutive // lines instead of a block comment.',
        },
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (comment.type === 'Block') {
                context.report({
                  loc: comment.loc,
                  messageId: 'useLineComment',
                });
              }
            }
          },
        };
      },
    },
  },
};

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['.expo/**', 'coverage/**', 'dist/**', 'node_modules/**', '.agents/**', '.specify/**'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
    plugins: { ghaf: ghafCommentRules },
    rules: { 'ghaf/line-comments-only': 'error' },
  },
]);
