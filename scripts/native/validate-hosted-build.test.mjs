import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hostedTargets,
  validateApkVersion,
  validateHostedBuildEnvironment,
  validateManifest,
} from './validate-hosted-build.mjs';

const publicKey = `sb_publishable_${'synthetic'.repeat(4)}`;
const deliveryFlags = {
  EXPO_PUBLIC_GHAF_DEMO_ENTRY: 'true',
  EXPO_PUBLIC_GHAF_AI_PARENT_TASK_DRAFTING_LIVE: 'false',
  EXPO_PUBLIC_GHAF_AI_CHILD_COACH_TEXT_LIVE: 'false',
  EXPO_PUBLIC_GHAF_AI_CHILD_COACH_VOICE_LIVE: 'false',
  EXPO_PUBLIC_TASK_WORKSPACE_CANDIDATE: 'false',
  EXPO_PUBLIC_R002B_PROGRESSION_ENGINE: 'false',
  EXPO_PUBLIC_R002B_IMPACT_PATH_UI: 'false',
  EXPO_PUBLIC_R002B_BADGES_UI: 'false',
  EXPO_PUBLIC_R002B_LEARNING_UI: 'false',
  EXPO_PUBLIC_R002B_REVEAL_BUNDLE_V2: 'false',
  EXPO_PUBLIC_R002B_PARENT_PROGRESS_UI: 'false',
  EXPO_PUBLIC_R002B_SHARED_GROWTH_VIEW: 'false',
  EXPO_PUBLIC_R002B_SHARED_GROWTH_CONTRIBUTION: 'false',
};
const environment = {
  ...deliveryFlags,
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
  "package: name='ae.ac.ku.ghaf.prototype' versionCode='1' versionName='0.1.0'\nsdkVersion:'24'\ntargetSdkVersion:'36'";
const expoConfiguration = { version: '0.1.0' };
const manifest = 'A: android:allowBackup(0x01010280)=(type 0x12)0x0\n';

test('the build receipt records reviewed settings while withholding public client keys', () => {
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

test('receipt records every explicit demo, AI and candidate delivery flag', () => {
  const receipt = validateHostedBuildEnvironment(environment);
  for (const [name, value] of Object.entries(deliveryFlags)) {
    assert.equal(receipt.settings[name], value, name);
  }
});

test('missing, reversed or noncanonical delivery flags cannot silently change an internal build', () => {
  for (const [name, expected] of Object.entries(deliveryFlags)) {
    for (const value of [undefined, '', expected === 'true' ? 'false' : 'true', '1', 'FALSE']) {
      assert.throws(() => validateHostedBuildEnvironment({ ...environment, [name]: value }), {
        message: `Invalid hosted-build setting: ${name}.`,
      });
    }
  }
});

test('APK versions are read from the artifact and match Expo defaults and Android overrides', () => {
  assert.deepEqual(validateApkVersion(badging, expoConfiguration), {
    versionName: '0.1.0',
    versionCode: 1,
  });
  const updated = badging.replace("versionCode='1'", "versionCode='7'").replace('0.1.0', '0.2.0');
  assert.deepEqual(
    validateApkVersion(updated, {
      version: '0.1.0',
      android: { version: '0.2.0', versionCode: 7 },
    }),
    { versionName: '0.2.0', versionCode: 7 },
  );
});

test('stale APK version names or build numbers are rejected', () => {
  for (const modified of [
    badging.replace('0.1.0', '0.0.9'),
    badging.replace("versionCode='1'", "versionCode='2'"),
  ]) {
    assert.throws(
      () => validateApkVersion(modified, expoConfiguration),
      /differs from the resolved Expo configuration/,
    );
  }
  assert.throws(
    () => validateApkVersion(badging, { version: '0.1.0', android: { versionCode: 2 } }),
    /differs from the resolved Expo configuration/,
  );
});

test('missing, malformed or ambiguous artifact versions cannot pass provenance checks', () => {
  for (const modified of [
    badging.replace(" versionName='0.1.0'", ''),
    badging.replace(" versionCode='1'", ''),
    badging.replace("versionName='0.1.0'", "versionName='0.1.0' versionName='0.2.0'"),
    badging.replace("versionCode='1'", "versionCode='1' versionCode='2'"),
    badging.replace("versionCode='1'", "versionCode='1' versionCode='invalid'"),
    ...['0', '-1', '1.5', '1e0', '01', '2147483648'].map((code) =>
      badging.replace("versionCode='1'", `versionCode='${code}'`),
    ),
    `${badging}\n${badging}`,
    badging.replace('package: ', 'unexpected: '),
  ]) {
    assert.throws(() => validateApkVersion(modified, expoConfiguration), /APK.*version/);
  }
});

test('missing source version or invalid configured build number cannot become a successful receipt', () => {
  for (const configuration of [
    undefined,
    {},
    { version: '' },
    ...[0, -1, 1.5, '1', 2147483648].map((versionCode) => ({
      version: '0.1.0',
      android: { versionCode },
    })),
  ]) {
    assert.throws(
      () => validateApkVersion(badging, configuration),
      /Resolved Expo configuration must declare a valid Android version/,
    );
  }
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
