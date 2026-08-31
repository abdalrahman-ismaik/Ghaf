const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const preservedBlockDirective =
  /^(?:@vite-ignore|webpack(?:ChunkName|Mode|Prefetch|Preload|Ignore|Exports|FetchPriority|Include|Exclude)\s*:\s*.+|[@#]__(?:PURE|INLINE|NO_SIDE_EFFECTS)__|c8\s+ignore\s+(?:next(?:\s+\d+)?|start|stop)|istanbul\s+ignore\s+(?:next|if|else|file))$/u;

function isLicenseBlock(value) {
  const withoutBang = value.replace(/^!\s*/u, '');
  return (
    /(?:^|\n)\s*\*?\s*(?:@license\b|@preserve\b|SPDX-License-Identifier:|Copyright(?:\s+\(c\)|\s+©)?\s+\d{4}\b|Licensed under\b)/iu.test(
      withoutBang,
    ) ||
    /(?:©|\(c\))\s*\d{4}/iu.test(withoutBang) ||
    (value.startsWith('!') && /\blicen[cs]e\b/iu.test(withoutBang))
  );
}

function mustKeepBlockSyntax(comment) {
  const value = comment.value.trim();
  return isLicenseBlock(value) || preservedBlockDirective.test(value);
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
