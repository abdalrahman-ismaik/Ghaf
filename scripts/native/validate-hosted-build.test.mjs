import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hostedTargets,
  validateHostedBuildEnvironment,
  validateManifest,
} from './validate-hosted-build.mjs';

const publicKey = `sb_publishable_${'synthetic'.repeat(4)}`;
const environment = {
  CI: '1',
  EXPO_NO_DOTENV: '1',
  EXPO_NO_TELEMETRY: '1',
  EXPO_PUBLIC_GHAF_SERVICE_MODE: 'mock',
  EXPO_PUBLIC_GHAF_AUTH_MODE: 'supabase',
  EXPO_PUBLIC_SUPABASE_URL: hostedTargets.adult,
  EXPO_PUBLIC_GHAF_MESSAGING_URL: hostedTargets.messaging,
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publicKey,
  EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY: publicKey,
};
const badging =
  "package: name='ae.ac.ku.ghaf.prototype' versionCode='1'\nsdkVersion:'24'\ntargetSdkVersion:'36'";
const manifest = 'A: android:allowBackup(0x01010280)=(type 0x12)0x0\n';

test('the build receipt contains only fixed targets and public-key hashes', () => {
  const receipt = validateHostedBuildEnvironment(environment);
  assert.equal(receipt.settings.EXPO_PUBLIC_SUPABASE_URL, hostedTargets.adult);
  assert.equal(JSON.stringify(receipt).includes(publicKey), false);
  assert.match(
    receipt.publicClientKeys.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.sha256,
    /^[a-f0-9]{64}$/,
  );
});

test('remote build refuses missing, privileged, JWT and whitespace-bearing key inputs without echoing them', () => {
  for (const value of [
    undefined,
    '',
    `sb_secret_${'example'.repeat(4)}`,
    'eyJsynthetic.payload.signature',
    `${publicKey}\n`,
    `${publicKey} `,
  ]) {
    assert.throws(
      () =>
        validateHostedBuildEnvironment({
          ...environment,
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: value,
        }),
      (error) => {
        assert.match(error.message, /public client key/);
        if (value) assert.equal(error.message.includes(value), false);
        return true;
      },
    );
  }
});

test('wrong projects, local HTTP and synthetic-auth build mode are rejected', () => {
  for (const [key, value] of [
    ['EXPO_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321'],
    ['EXPO_PUBLIC_SUPABASE_URL', hostedTargets.messaging],
    ['EXPO_PUBLIC_GHAF_MESSAGING_URL', `${hostedTargets.messaging}/`],
    ['EXPO_PUBLIC_GHAF_AUTH_MODE', 'demo'],
    ['EXPO_NO_DOTENV', '0'],
  ])
    assert.throws(
      () => validateHostedBuildEnvironment({ ...environment, [key]: value }),
      /Invalid hosted-build setting/,
    );
});

test('only a normal non-debuggable, non-test-only HTTPS APK may pass', () => {
  assert.doesNotThrow(() => validateManifest(manifest, badging));
  for (const flag of ['debuggable', 'testOnly', 'usesCleartextTraffic']) {
    assert.throws(
      () =>
        validateManifest(
          `${manifest}A: android:${flag}(0x01010000)=(type 0x12)0xffffffff\n`,
          badging,
        ),
      /must not enable/,
    );
  }
  assert.throws(
    () =>
      validateManifest(
        `${manifest}A: android:networkSecurityConfig(0x01010527)=@0x7f130001\n`,
        badging,
      ),
    /network security/,
  );
  assert.throws(
    () => validateManifest(manifest, `${badging}\napplication-debuggable`),
    /debuggable/,
  );
});

test('wrong package/API or enabled/missing backups cannot be distributed', () => {
  for (const modified of [
    badging.replace('prototype', 'accounttest2'),
    badging.replace("sdkVersion:'24'", "sdkVersion:'23'"),
    badging.replace("targetSdkVersion:'36'", "targetSdkVersion:'35'"),
  ]) {
    assert.throws(
      () => validateManifest(manifest, modified),
      /package or supported Android versions/,
    );
  }
  assert.throws(() => validateManifest('', badging), /disabled application backup/);
  assert.throws(
    () => validateManifest(manifest.replace(')0x0', ')0xffffffff'), badging),
    /disabled application backup/,
  );
});
