import assert from 'node:assert/strict';
import { test } from 'node:test';

import { findLocalLinkIssues, findPathIssues } from './check.mjs';

test('allows exact historical artifacts while rejecting new generated output', () => {
  const preserved = ['output/playwright/entry-mobile-final.png'];
  assert.deepEqual(findPathIssues(preserved, preserved), []);
  assert.equal(findPathIssues([...preserved, 'output/new-capture.png'], preserved).length, 1);
  assert.equal(findPathIssues(['dist/index.html', 'tools/node_modules/a.js'], []).length, 2);
});

test('rejects root-level tests and accidental copied filenames', () => {
  assert.equal(findPathIssues(['tests/access.test.ts', 'README(5).md'], []).length, 2);
  assert.deepEqual(findPathIssues(['tests/access/access.test.ts', 'src/models/access.ts'], []), []);
});

test('resolves files, directory links, fragments, encoded paths and HTML images', () => {
  const markdown =
    '[source](../src/) [guide](guide.md#setup) [space](some%20guide.md) ' +
    '<img src="screen.png" /> [official](https://example.com/)';
  assert.deepEqual(
    findLocalLinkIssues('docs/README.md', markdown, [
      'src/index.ts',
      'docs/guide.md',
      'docs/some guide.md',
      'docs/screen.png',
    ]),
    [],
  );
});

test('reports missing local links without treating fenced examples as navigation', () => {
  const markdown = '[missing](absent.md)\n```md\n[example](example.md)\n```\n';
  assert.deepEqual(findLocalLinkIssues('README.md', markdown, []), [
    'README.md: missing repository link absent.md',
  ]);
});
