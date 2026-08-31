const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const preservedBlockDirective =
  /^(?:@vite-ignore|webpack(?:Ignore|ChunkName):.+|[@#]__(?:PURE|INLINE)__|@__NO_SIDE_EFFECTS__|(?:c8|istanbul)\s+ignore(?:\s+\w+)?)$/u;

function mustKeepBlockSyntax(comment) {
  const value = comment.value.trim();
  return (
    value.startsWith('!') ||
    /(?:^|\n)\s*\*?\s*(?:@license\b|@preserve\b|SPDX-License-Identifier:)/iu.test(value) ||
    preservedBlockDirective.test(value)
  );
}

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
              if (comment.type === 'Block' && !mustKeepBlockSyntax(comment)) {
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
    ignores: [
      '.expo/**',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      '.agents/**',
      '.specify/**',
      'expo-env.d.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
    plugins: { ghaf: ghafCommentRules },
    rules: { 'ghaf/line-comments-only': 'error' },
  },
]);
