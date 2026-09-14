import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(import.meta.url);
const expoRequire = createRequire(require.resolve('expo/package.json'));
const cliRequire = createRequire(expoRequire.resolve('@expo/cli/package.json'));
const serverRequire = createRequire(cliRequire.resolve('@expo/router-server/package.json'));
const { getTypedRoutesDeclarationFile } = serverRequire('./build/typed-routes/generate.js');
const { requireContext } = require('expo-router/internal/testing');
const { EXPO_ROUTER_CTX_IGNORE } = require('expo-router/_ctx-shared');

// SDK57's Windows watcher can admit sibling paths; regenerate from app/ before checking types.
const context = requireContext(resolve(root, 'app'), true, EXPO_ROUTER_CTX_IGNORE);
const declarations = getTypedRoutesDeclarationFile(context);
if (!declarations || /pathname: `\/\.\./u.test(declarations)) {
  throw new Error('The installed Expo route generator did not produce bounded app routes');
}
const output = resolve(root, '.expo/types');
mkdirSync(output, { recursive: true });
writeFileSync(resolve(output, 'router.d.ts'), declarations);
