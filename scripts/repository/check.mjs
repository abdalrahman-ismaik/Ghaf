import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, posix, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function findPathIssues(paths, preservedArtifacts) {
  const preserved = new Set(preservedArtifacts);
  const issues = [];
  for (const path of paths) {
    if (/(^|\/)(node_modules|dist|coverage|\.expo|\.wrangler|\.playwright-cli)\//u.test(path)) {
      issues.push(`Generated directory is tracked: ${path}`);
    }
    if (path.startsWith('output/') && !preserved.has(path)) {
      issues.push(`New output artifact must be curated outside output/: ${path}`);
    }
    if (/:Zone\.Identifier$|(?:^|\/)\.DS_Store$|\(\d+\)\.(?:md|tsx?|json)$/u.test(path)) {
      issues.push(`Accidental metadata or duplicate filename: ${path}`);
    }
    if (/^tests\/[^/]+\.test\.tsx?$/u.test(path)) {
      issues.push(`Place the test in its subject directory: ${path}`);
    }
  }
  return issues;
}

export function findLocalLinkIssues(document, markdown, paths) {
  const files = new Set(paths);
  const issues = [];
  const prose = markdown.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gmu, '');
  const targets = [
    ...prose.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/gu),
    ...prose.matchAll(/\b(?:src|href)="([^"]+)"/gu),
  ];
  for (const [, target] of targets) {
    if (!target || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/iu.test(target)) continue;
    const withoutFragment = target.split(/[?#]/u)[0];
    if (!withoutFragment) continue;
    const decoded = decodeURIComponent(withoutFragment);
    const relative = posix.normalize(posix.join(posix.dirname(document), decoded));
    const directory = relative.replace(/\/$/u, '') + '/';
    if (!files.has(relative) && !paths.some((path) => path.startsWith(directory))) {
      issues.push(`${document}: missing repository link ${target}`);
    }
  }
  return issues;
}

export function checkRepository(root = repositoryRoot) {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean);
  const paths = [...new Set([...tracked, ...untracked])].filter((path) =>
    existsSync(resolve(root, path)),
  );
  const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  const preserved = readJson('scripts/repository/preserved-artifacts.json');
  const issues = findPathIssues(tracked, preserved);
  const navigation = [
    'README.md',
    'CONTRIBUTING.md',
    'docs/README.md',
    'docs/architecture/REPOSITORY_STRUCTURE.md',
    'docs/architecture/REPOSITORY_AUDIT.md',
    'docs/architecture/adr/0003-repository-organization.md',
    ...['src', 'assets', 'scripts', 'specs', 'tests', 'workers', 'tools'].map(
      (directory) => `${directory}/README.md`,
    ),
  ];
  for (const document of navigation) {
    if (!existsSync(resolve(root, document))) {
      issues.push(`Missing navigation document: ${document}`);
      continue;
    }
    issues.push(
      ...findLocalLinkIssues(document, readFileSync(resolve(root, document), 'utf8'), paths),
    );
  }
  const legacyTests = readJson('tests/legacy-paths.json');
  for (const [previous, current] of Object.entries(legacyTests)) {
    if (!paths.includes(current)) issues.push(`Missing relocated test: ${previous} -> ${current}`);
  }
  return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const issues = checkRepository();
  if (issues.length) {
    process.stderr.write(issues.join('\n') + '\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('Repository navigation, test paths and tracked-artifact policy passed.\n');
  }
}
