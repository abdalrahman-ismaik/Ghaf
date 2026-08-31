const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

const preservedBlockDirective =
  /^(?:@vite-ignore|[@#]__(?:PURE|INLINE|NO_SIDE_EFFECTS)__|c8\s+ignore\s+(?:next(?:\s+\d+)?|start|stop)|istanbul\s+ignore\s+(?:next|if|else|file))$/u;

const webpackDirectivePart =
  /^(?:webpackChunkName\s*:\s*(?:"[^"\r\n]+"|'[^'\r\n]+')|webpackMode\s*:\s*(?:"(?:lazy|lazy-once|eager|weak)"|'(?:lazy|lazy-once|eager|weak)')|webpack(?:Prefetch|Preload)\s*:\s*(?:true|false|-?\d+)|webpackIgnore\s*:\s*(?:true|false)|webpackFetchPriority\s*:\s*(?:"(?:high|low|auto)"|'(?:high|low|auto)')|webpack(?:Include|Exclude)\s*:\s*\/(?:\\.|[^/\r\n])+\/[dgimsuvy]*|webpackExports\s*:\s*(?:"[^"\r\n]+"|'[^'\r\n]+'|\[(?:\s*(?:"[^"\r\n]+"|'[^'\r\n]+')(?:\s*,\s*(?:"[^"\r\n]+"|'[^'\r\n]+'))*)?\]))$/u;

function isWebpackDirective(value) {
  const parts = value
    .split(/\r?\n/u)
    .map((line) => line.replace(/^\s*\*?\s*/u, '').trim())
    .filter(Boolean)
    .flatMap((line) => line.split(/,\s*(?=webpack)/u))
    .map((part) => part.replace(/,\s*$/u, '').trim());
  return parts.length > 0 && parts.every((part) => webpackDirectivePart.test(part));
}

function isLicenseBlock(value) {
  const withoutBang = value.replace(/^!\s*/u, '');
  return (
    /(?:^|\n)\s*\*?\s*(?:@license\b|@preserve\b|SPDX-License-Identifier:|Copyright(?:\s+\(c\)|\s+©)?\s+\d{4}\b)/iu.test(
      withoutBang,
    ) ||
    /(?:^|\n)\s*\*?\s*Licensed under (?:the )?(?:Apache|MIT|BSD|ISC|Mozilla Public|GNU (?:General|Lesser General|Affero General)) Licen[cs]e\b/iu.test(
      withoutBang,
    ) ||
    (value.startsWith('!') &&
      /\b(?:Apache|MIT|BSD|ISC|Mozilla Public|GNU (?:General|Lesser General|Affero General)) Licen[cs]e\b/iu.test(
        withoutBang,
      ))
  );
}

function mustKeepBlockSyntax(comment) {
  const value = comment.value.trim();
  return isLicenseBlock(value) || isWebpackDirective(value) || preservedBlockDirective.test(value);
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
