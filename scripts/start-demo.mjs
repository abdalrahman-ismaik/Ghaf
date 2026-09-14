import { spawn } from 'node:child_process';

const child = spawn(
  process.execPath,
  ['./node_modules/expo/bin/cli', 'start', ...process.argv.slice(2)],
  {
    env: {
      ...process.env,
      EXPO_PUBLIC_GHAF_AUTH_MODE: 'demo',
      EXPO_PUBLIC_GHAF_DEMO_ENTRY: 'true',
    },
    stdio: 'inherit',
    windowsHide: true,
  },
);
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
child.on('error', () => {
  process.exitCode = 1;
});
