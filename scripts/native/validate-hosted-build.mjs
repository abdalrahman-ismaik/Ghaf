import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const hostedTargets = Object.freeze({
  adult: 'https://bqcfynlbxevqlzbkimhy.supabase.co',
  messaging: 'https://ijiwkmvjppfallaoahmh.supabase.co',
});

const applicationId = 'ae.ac.ku.ghaf.prototype';
const publicKeyPattern = /^sb_publishable_[A-Za-z0-9_-]{16,256}$/;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');

function requireCondition(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateHostedBuildEnvironment(environment = process.env) {
  const expected = {
    CI: '1',
    EXPO_NO_DOTENV: '1',
    EXPO_NO_TELEMETRY: '1',
    EXPO_PUBLIC_GHAF_SERVICE_MODE: 'mock',
    EXPO_PUBLIC_GHAF_AUTH_MODE: 'supabase',
    EXPO_PUBLIC_SUPABASE_URL: hostedTargets.adult,
    EXPO_PUBLIC_GHAF_MESSAGING_URL: hostedTargets.messaging,
  };
  for (const [name, value] of Object.entries(expected)) {
    requireCondition(environment[name] === value, `Invalid hosted-build setting: ${name}.`);
  }
  const keys = {};
  for (const name of [
    'EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    'EXPO_PUBLIC_GHAF_MESSAGING_PUBLISHABLE_KEY',
  ]) {
    const value = environment[name];
    requireCondition(
      typeof value === 'string' && publicKeyPattern.test(value) && !/\s/.test(value),
      `Missing or invalid public client key: ${name}; only sb_publishable_ keys are accepted.`,
    );
    keys[name] = { present: true, sha256: sha256(value), valueWithheld: true };
  }
  return { settings: expected, publicClientKeys: keys };
}

export function validateManifest(manifest, badging) {
  requireCondition(
    badging.includes(`package: name='${applicationId}'`) &&
      badging.includes("sdkVersion:'24'") &&
      badging.includes("targetSdkVersion:'36'"),
    'APK package or supported Android versions differ from the reviewed configuration.',
  );
  for (const name of ['debuggable', 'testOnly', 'usesCleartextTraffic']) {
    const lines = manifest.split(/\r?\n/).filter((line) => line.includes(`A: android:${name}(`));
    requireCondition(
      lines.every((line) => /\(type 0x12\)0x0(?:\s|$)/.test(line)),
      `APK must not enable android:${name}.`,
    );
  }
  requireCondition(!badging.includes('application-debuggable'), 'APK is debuggable.');
  requireCondition(
    !manifest.includes('A: android:networkSecurityConfig('),
    'Unexpected network security configuration requires separate review.',
  );
  const backup = manifest.split(/\r?\n/).filter((line) => line.includes('A: android:allowBackup('));
  requireCondition(
    backup.length === 1 && /\(type 0x12\)0x0(?:\s|$)/.test(backup[0]),
    'APK must retain disabled application backup.',
  );
}

function run(executable, arguments_) {
  try {
    return execFileSync(executable, arguments_, {
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    // Tool output is withheld because inherited build configuration must not leak into errors.
    throw new Error(`APK verification command failed: ${path.basename(executable)}.`);
  }
}

function verifyApk(apkArgument, outputArgument, environment) {
  const publicConfiguration = validateHostedBuildEnvironment(environment);
  const repository = process.cwd();
  const apk = path.resolve(repository, apkArgument);
  const output = path.resolve(repository, outputArgument);
  requireCondition(
    apk === path.join(repository, 'android/app/build/outputs/apk/release/app-release.apk') &&
      output === path.join(repository, 'output/android-internal'),
    'APK verification accepts only the workflow build and output directories.',
  );
  requireCondition(existsSync(apk) && statSync(apk).size > 0, 'The fresh APK is missing or empty.');
  requireCondition(!existsSync(output), 'APK output already exists; preserve previous evidence.');
  requireCondition(
    environment.ANDROID_HOME && environment.JAVA_HOME,
    'Android SDK and Java are required.',
  );
  const sdkTools = path.join(environment.ANDROID_HOME, 'build-tools/36.0.0');
  const aapt = path.join(sdkTools, 'aapt');
  const badging = run(aapt, ['dump', 'badging', apk]);
  const manifest = run(aapt, ['dump', 'xmltree', apk, 'AndroidManifest.xml']);
  validateManifest(manifest, badging);
  const payloads = run('unzip', ['-Z1', apk]).trim().split(/\r?\n/);
  requireCondition(
    payloads.includes('assets/index.android.bundle'),
    'APK has no embedded JavaScript bundle.',
  );
  const architectures = [
    ...new Set(
      payloads.filter((name) => name.startsWith('lib/')).map((name) => name.split('/')[1]),
    ),
  ].sort();
  requireCondition(
    JSON.stringify(architectures) === JSON.stringify(['arm64-v8a', 'x86_64']),
    'APK does not contain exactly the requested arm64-v8a and x86_64 native libraries.',
  );
  const signing = run(path.join(environment.JAVA_HOME, 'bin/java'), [
    '-jar',
    path.join(sdkTools, 'lib/apksigner.jar'),
    'verify',
    '--verbose',
    '--print-certs',
    apk,
  ]);
  requireCondition(
    signing.includes('Verified using v2 scheme (APK Signature Scheme v2): true'),
    'APK signature verification did not confirm v2 signing.',
  );
  const signerSha256 = signing
    .match(/Signer #1 certificate SHA-256 digest: ([a-f0-9]{64})/i)?.[1]
    ?.toLowerCase();
  const templateKey = run(path.join(environment.JAVA_HOME, 'bin/keytool'), [
    '-J-Duser.language=en',
    '-list',
    '-v',
    '-keystore',
    path.join(repository, 'android/app/debug.keystore'),
    '-storepass',
    'android',
    '-alias',
    'androiddebugkey',
  ]);
  const templateSigner = templateKey
    .match(/SHA256:\s*([A-Fa-f0-9:]{95})/)?.[1]
    ?.replaceAll(':', '')
    .toLowerCase();
  requireCondition(
    signerSha256 && signerSha256 === templateSigner,
    'APK signer differs from the generated internal template key.',
  );
  const alignment = run(path.join(sdkTools, 'zipalign'), ['-c', '-P', '16', '4', apk]);
  const sourceHead = run('git', ['rev-parse', 'HEAD']).trim();
  requireCondition(
    /^[a-f0-9]{40}$/.test(sourceHead) && sourceHead === environment.GITHUB_SHA,
    'APK build does not match the dispatched source revision.',
  );
  const generatedChanges = run('git', ['diff', '--name-only'])
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  requireCondition(
    generatedChanges.every((name) => name === 'package.json'),
    'Tracked changes exceed the known Expo prebuild package-script normalization.',
  );
  const sourcePackage = JSON.parse(run('git', ['show', 'HEAD:package.json']));
  const generatedPackage = JSON.parse(readFileSync(path.join(repository, 'package.json'), 'utf8'));
  for (const platform of ['android', 'ios']) {
    requireCondition(
      [sourcePackage.scripts[platform], `expo run:${platform}`].includes(
        generatedPackage.scripts[platform],
      ),
      'Unexpected native package script generated by prebuild.',
    );
    generatedPackage.scripts[platform] = sourcePackage.scripts[platform];
  }
  requireCondition(
    JSON.stringify(sourcePackage) === JSON.stringify(generatedPackage),
    'Expo prebuild changed package configuration beyond native launch scripts.',
  );
  const fileName = `ghaf-internal-${sourceHead.slice(0, 12)}.apk`;
  const apkSha256 = sha256(readFileSync(apk));
  const receipt = {
    schemaVersion: 1,
    builtUtc: new Date().toISOString(),
    status: 'PASSED',
    scope:
      'Fresh Gradle internal APK; Expo template debug identity, not production signing or store release.',
    applicationId,
    sourceHead,
    runId: environment.GITHUB_RUN_ID,
    runAttempt: environment.GITHUB_RUN_ATTEMPT,
    publicConfiguration,
    apk: { fileName, bytes: statSync(apk).size, sha256: apkSha256, signerSha256 },
    android: {
      minSdk: 24,
      targetSdk: 36,
      buildTools: '36.0.0',
      ndk: '27.1.12297006',
      cmake: '3.30.5',
      architectures,
    },
    verification: {
      embeddedBundle: true,
      testOnly: false,
      debuggable: false,
      cleartextEnabled: false,
      backupEnabled: false,
      signature: 'PASSED',
      zipAlignment16KiB: 'PASSED',
    },
    nativeRuntimeVerification:
      'NOT RUN by this build job; install and test this exact APK separately.',
    physicalPerformanceVerification: 'NOT RUN',
  };
  mkdirSync(output, { recursive: true });
  copyFileSync(apk, path.join(output, fileName));
  writeFileSync(path.join(output, `${fileName}.sha256`), `${apkSha256}  ${fileName}\n`, {
    flag: 'wx',
  });
  writeFileSync(path.join(output, 'build-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, {
    flag: 'wx',
  });
  for (const [name, value] of Object.entries({
    'manifest.txt': manifest,
    'badging.txt': badging,
    'signing.txt': signing,
    'alignment.txt': alignment,
  })) {
    writeFileSync(path.join(output, name), value, { flag: 'wx' });
  }
  console.log(
    'Fresh internal APK verified; source, signing, configuration hashes and artifact evidence saved.',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const arguments_ = process.argv.slice(2);
    if (arguments_.length === 0) {
      validateHostedBuildEnvironment();
      console.log('Hosted build configuration validated; public client key values withheld.');
    } else {
      requireCondition(
        arguments_.length === 3 && arguments_[0] === '--verify-apk',
        'Unexpected hosted-build validator arguments.',
      );
      verifyApk(arguments_[1], arguments_[2], process.env);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'Hosted APK validation failed.');
    process.exitCode = 1;
  }
}
