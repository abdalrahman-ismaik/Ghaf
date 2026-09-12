#!/usr/bin/env bash
# Internal standalone rehearsal only. This script never installs tools or dependencies.
set -Eeuo pipefail
umask 077

readonly APPROVED_ROOT=/home/smyk/projects/Ghaf-demo-systems
readonly KEY_SHA=221e0a3106aa4c3ccc154e0a418b55020b3f9ea6e84f92e8749cd9e2f39f5e58
# Publisher: https://services.gradle.org/distributions/gradle-9.3.1-bin.zip.sha256
readonly GRADLE_SHA=b266d5ff6b90eada6dc3b20cb090e3731302e553a27c5d3e4df1f0d76beaff06
STARTED=$(date -u +%FT%TZ)
MODE=preflight
ROOT= EXPECTED_HEAD= SOURCE_COMMIT= JDK= SDK= OUTPUT= CACHE=
SIGNING=0 HEAVY_ACK= METRO_ACK= LICENSE_ACK= APPROVED_PERMISSIONS=
RUN= CHILD_PID= LAST_LOG= STEP=0

usage() {
  cat <<'HELP'
Usage: build-apk.sh [--build | --manifest-only] REQUIRED_OPTIONS

Default: PREFLIGHT. Never installs, generates Android, downloads Gradle or compiles.
Preflight writes an isolated receipt only after root/input/path validation.

Required in both modes:
  --project-root ABS_PATH       Exactly /home/smyk/projects/Ghaf-demo-systems
  --expected-head FULL_SHA      Exact checked-out 40-character Git HEAD
  --source-commit FULL_SHA      A's published runtime-source commit (exact input match)
  --jdk-home ABS_PATH           Approved JDK 17 within output/native-toolchain/
  --sdk-root ABS_PATH           Approved SDK within output/native-toolchain/
  --output-dir ABS_PATH         Existing directory within output/native-build/
  --cache-dir ABS_PATH          Existing directory within output/native-cache/
  --allow-internal-debug-signing
                               Opt in to the unchanged Expo template debug identity

Generation/Gradle modes require explicit coordination/terms receipt references:
  --manifest-only              Generate and merge release manifest for A review; no APK
  --build                      Compile and inspect the standalone release APK
  --heavy-slot-ack REFERENCE    Current A/operator grant for this native build
  --metro-release-ack REFERENCE Current confirmation Metro/browser have stopped
  --sdk-license-ack REFERENCE   Applicable accepted SDK terms evidence
  --approved-permissions FILE   Build only: A-reviewed JSON array of permission names;
                               absolute existing file within output/native-build/

Inputs inspected: JDK 17, SDK 36, Build Tools 36.0.0, NDK 27.1.12297006,
CMake 3.30.5, template Gradle 9.3.1. Their compatibility is NOT yet proven.
Private dependencies must match package-lock.json; no linked/shared node_modules.
Generation uses installed Expo prebuild --platform android --no-install only when
android/ is absent. Existing trees need this script's matching generation receipt.
Only package.json android/ios script normalization is tolerated and retained for A.
No automatic restore, clean generation, signing-key replacement, upload or install.
A changed source/generation identity stops reuse: A must grant archival and fresh
generation of the owned android tree. The script never archives or cleans it itself.

Build resource policy: one process group on two allowed CPUs, two Gradle workers,
no parallel Gradle,
2 GiB Java heap / 512 MiB metaspace, 1536 MiB Node heap and two CMake jobs.
These are individual limits, NOT a total memory cap. The group is stopped on low
available memory, sustained paging or low disk; logs and generated files remain.
Receipts retain UTC step times, exit codes, config, package diff, tool identities,
APK hash/certificate/ABIs/merged manifest and bundle inventory. Successful artifact
inspection does not establish physical-device or human acceptance.
HELP
}

finish() {
  local status=$?
  trap - EXIT INT TERM
  if [[ -n "$CHILD_PID" ]]; then
    local child_group
    child_group=$(ps -o pgid= -p "$CHILD_PID" | tr -d ' ') || true
    if [[ "$child_group" == "$CHILD_PID" ]]; then
      kill -TERM -- "-$CHILD_PID" 2>/dev/null || true
      sleep 2
      kill -KILL -- "-$CHILD_PID" 2>/dev/null || true
      wait "$CHILD_PID" 2>/dev/null || true
    else
      printf 'Owned build PID %s requires operator inspection; process group not verified.\n' "$CHILD_PID" >&2
    fi
  fi
  printf 'END utc=%s mode=%s exit=%s started=%s\n' "$(date -u +%FT%TZ)" "$MODE" "$status" "$STARTED"
  if [[ -n "$RUN" ]]; then
    printf 'end_utc=%s\nexit=%s\n' "$(date -u +%FT%TZ)" "$status" >> "$RUN/receipt.txt"
  fi
  exit "$status"
}
trap finish EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
fail() { printf 'BLOCKED: %s\n' "$*" >&2; exit 1; }
need_value() { [[ $# -ge 2 && -n "$2" && "$2" != --* ]] || fail "Missing value for $1"; }
while (($#)); do
  case "$1" in
    --help|-h) usage; exit 0 ;;
    --build|--manifest-only)
      [[ "$MODE" == preflight ]] || fail 'Choose only one explicit execution mode.'
      [[ "$1" == --build ]] && MODE=build || MODE=manifest
      shift ;;
    --allow-internal-debug-signing) SIGNING=1; shift ;;
    --project-root|--expected-head|--source-commit|--jdk-home|--sdk-root|--output-dir|--cache-dir|--heavy-slot-ack|--metro-release-ack|--sdk-license-ack|--approved-permissions)
      need_value "$@"
      case "$1" in
        --project-root) ROOT=$2 ;; --expected-head) EXPECTED_HEAD=$2 ;;
        --source-commit) SOURCE_COMMIT=$2 ;; --jdk-home) JDK=$2 ;;
        --sdk-root) SDK=$2 ;; --output-dir) OUTPUT=$2 ;; --cache-dir) CACHE=$2 ;;
        --heavy-slot-ack) HEAVY_ACK=$2 ;; --metro-release-ack) METRO_ACK=$2 ;;
        --sdk-license-ack) LICENSE_ACK=$2 ;;
        --approved-permissions) APPROVED_PERMISSIONS=$2 ;;
      esac
      shift 2 ;;
    *) fail "Unknown option: $1 (see --help)" ;;
  esac
done
for value in ROOT EXPECTED_HEAD SOURCE_COMMIT JDK SDK OUTPUT CACHE; do
  [[ -n "${!value}" ]] || fail "Missing required input: $value (see --help)"
done
[[ "$SIGNING" == 1 ]] || fail 'Explicit --allow-internal-debug-signing is required.'
[[ "$EXPECTED_HEAD" =~ ^[0-9a-f]{40}$ && "$SOURCE_COMMIT" =~ ^[0-9a-f]{40}$ ]] || fail 'Use full lowercase 40-character commit IDs.'
for command in git python3 node sha256sum realpath tar date setsid ps df awk rg cmp cp mktemp tee tr flock diff taskset; do
  command -v "$command" >/dev/null || fail "Missing host command: $command; operator must provision it."
done
[[ "$ROOT" == "$APPROVED_ROOT" && "$(realpath -e "$ROOT")" == "$APPROVED_ROOT" ]] || fail 'Project root is not the canonical granted B worktree.'
[[ "$(realpath -e "${BASH_SOURCE[0]}")" == "$ROOT/scripts/native/build-apk.sh" ]] || fail 'Run the script from the granted B worktree.'
cd "$ROOT"
[[ "$(git rev-parse --show-toplevel)" == "$ROOT" ]] || fail 'Git root mismatch.'
[[ "$(git rev-parse HEAD)" == "$EXPECTED_HEAD" ]] || fail 'HEAD differs from --expected-head; synchronize only the published candidate.'
git cat-file -e "$SOURCE_COMMIT^{commit}" || fail 'Runtime source commit is unavailable.'

# Inspect paths without creating directories or following an escape into another worktree.
python3 - "$ROOT" "$JDK" "$SDK" "$OUTPUT" "$CACHE" <<'PY'
import os, pathlib, sys
root = pathlib.Path(sys.argv[1])
for raw, boundary in zip(sys.argv[2:], ['native-toolchain', 'native-toolchain', 'native-build', 'native-cache']):
    p = pathlib.Path(raw)
    base = root / 'output' / boundary
    if not p.is_absolute() or str(p) != raw or '..' in p.parts or any(c.isspace() for c in raw) or not p.is_dir():
        sys.exit(f'BLOCKED: approved absolute directory must already exist: {raw}')
    if not p.is_relative_to(base) or p.resolve() != p:
        sys.exit(f'BLOCKED: path is outside {base} or traverses a symlink: {raw}')
    for current, dirs, files in os.walk(p):
        for name in dirs + files:
            child = pathlib.Path(current) / name
            if child.is_symlink() and not child.resolve().is_relative_to(base):
                sys.exit(f'BLOCKED: symlink escapes approved boundary: {child}')
PY
[[ ! -L node_modules && -d node_modules ]] || fail 'Private node_modules is required; shared/symlinked dependencies cannot generate or compile.'
[[ "$(realpath -e node_modules)" == "$ROOT/node_modules" ]] || fail 'Dependency root escapes the B worktree.'

if [[ "$MODE" != preflight ]]; then
  [[ -n "$HEAVY_ACK" && -n "$METRO_ACK" && -n "$LICENSE_ACK" ]] || fail 'Build requires heavy-slot, Metro/browser-release and accepted SDK terms acknowledgments.'
  if [[ "$MODE" == build ]]; then
    [[ -n "$APPROVED_PERMISSIONS" ]] || fail 'Build requires --approved-permissions with A-reviewed merged permission names.'
  fi
fi
if [[ -n "$APPROVED_PERMISSIONS" ]]; then
  python3 - "$ROOT" "$APPROVED_PERMISSIONS" <<'PY'
import json, pathlib, re, sys
p = pathlib.Path(sys.argv[2])
if not p.is_absolute() or p.resolve() != p or not p.is_relative_to(pathlib.Path(sys.argv[1]) / 'output/native-build') or not p.is_file():
    sys.exit('BLOCKED: approved permission file must be an existing absolute nonsymlink B native-build path.')
names = json.loads(p.read_text())
if not isinstance(names, list) or not names or any(not isinstance(n, str) or not re.fullmatch(r'[A-Za-z0-9_.]+', n) for n in names) or len(names) != len(set(names)):
    sys.exit('BLOCKED: expected a nonempty unique JSON array of qualified permission names.')
PY
fi
for value in HEAVY_ACK METRO_ACK LICENSE_ACK; do
  [[ "${!value}" != *$'\n'* && "${!value}" != *$'\r'* ]] || fail 'Acknowledgment references must be one line, without credentials.'
done
RUN=$(mktemp -d "$OUTPUT/$(date -u +%Y%m%dT%H%M%SZ)-$MODE.XXXXXX")
printf 'start_utc=%s\nmode=%s\nhead=%s\nsource_commit=%s\nroot=%s\nscript_sha256=%s\nsigning=internal-rehearsal-template-debug-only\nheavy_slot_ack=%s\nmetro_release_ack=%s\nsdk_license_ack=%s\n' \
  "$STARTED" "$MODE" "$EXPECTED_HEAD" "$SOURCE_COMMIT" "$ROOT" "$(sha256sum "${BASH_SOURCE[0]}" | awk '{print $1}')" \
  "$HEAVY_ACK" "$METRO_ACK" "$LICENSE_ACK" > "$RUN/receipt.txt"
printf 'Receipt: %s\n' "$RUN"
if [[ -n "$APPROVED_PERMISSIONS" ]]; then
  cp "$APPROVED_PERMISSIONS" "$RUN/approved-permissions.json"
  sha256sum "$RUN/approved-permissions.json" > "$RUN/approved-permissions.sha256"
fi
printf 'jdk=%s\nsdk=%s\noutput=%s\ncache=%s\nnode=%s\ngradle_distribution_sha256=%s\n' \
  "$JDK" "$SDK" "$OUTPUT" "$CACHE" "$(node --version)" "$GRADLE_SHA" >> "$RUN/receipt.txt"

step() {
  local label=$1 status=0 log
  shift
  STEP=$((STEP + 1))
  printf -v log '%s/%02d-%s.log' "$RUN" "$STEP" "$label"
  LAST_LOG=$log
  printf 'STEP %s start=%s log=%s\n' "$label" "$(date -u +%FT%TZ)" "$log" | tee -a "$RUN/receipt.txt"
  "$@" > "$log" 2>&1 || status=$?
  printf 'STEP %s end=%s exit=%s\n' "$label" "$(date -u +%FT%TZ)" "$status" | tee -a "$RUN/receipt.txt"
  [[ "$status" == 0 ]] || { printf 'Failed step; inspect %s\n' "$log" >&2; exit "$status"; }
}

# Only these two installed-prebuild script rewrites may differ from the committed package.
check_inputs() {
  python3 - "$ROOT" "$SOURCE_COMMIT" "$MODE" "$EXPECTED_HEAD" <<'PY'
import hashlib, json, os, pathlib, subprocess, sys
root, source, mode = pathlib.Path(sys.argv[1]), sys.argv[2], sys.argv[3]
def git(*args): return subprocess.check_output(['git', *args], cwd=root)
def reject(message): sys.exit('BLOCKED: ' + message)
if git('rev-parse', 'HEAD').decode().strip() != sys.argv[4]: reject('HEAD changed during this run.')
if (root / 'node_modules').is_symlink() or (root / 'node_modules').resolve() != root / 'node_modules':
    reject('Private dependency root was replaced or linked.')
non_runtime_dirs = ('docs/', 'specs/', '.specify/', '.agents/', '.codex/', '.impeccable/', 'tests/')
tooling = {'scripts/native/build-apk.sh', 'scripts/native/collect-device-evidence.sh'}
for path in git('diff', '--name-only', '-z', source, 'HEAD').decode().split('\0'):
    if not path or path.startswith(non_runtime_dirs) or path in tooling or ('/' not in path and path.endswith('.md')):
        continue
    reject('HEAD build input differs from published source commit: ' + path)
if git('diff', '--cached', '--name-only').strip(): reject('Staged changes require owner review before this run.')
dirty = git('diff', '--name-only', '-z').decode().split('\0')
allowed = {'package.json'}
if mode == 'preflight': allowed |= {'scripts/native/build-apk.sh', 'docs/competition-readiness/workstreams/b-native-build.md'}
if any(p and p not in allowed for p in dirty): reject('Unexpected tracked changes; preserve them for A review.')
untracked = git('ls-files', '--others', '--exclude-standard', '-z').decode().split('\0')
if any(p and not (mode == 'preflight' and p in allowed) for p in untracked): reject('Untracked nonignored files require owner review.')
before = json.loads(git('show', 'HEAD:package.json'))
after = json.loads((root / 'package.json').read_text())
for key in ('android', 'ios'):
    actual, original = after.get('scripts', {}).get(key), before.get('scripts', {}).get(key)
    if actual not in (original, f'expo run:{key}'): reject(f'Unexpected package script change: {key}')
    after['scripts'][key] = original
if before != after: reject('package.json changed outside the granted android/ios script normalization.')
lock = json.loads((root / 'package-lock.json').read_text())
hidden_path = root / 'node_modules/.package-lock.json'
if not hidden_path.is_file(): reject('Private npm ci completion receipt node_modules/.package-lock.json is absent.')
hidden = json.loads(hidden_path.read_text())
for current, dirs, files in os.walk(root / 'node_modules'):
    for name in dirs + files:
        p = pathlib.Path(current) / name
        if p.is_symlink() and not p.resolve().is_relative_to(root / 'node_modules'):
            reject('Dependency symlink escapes private node_modules: ' + str(p))
for name, entry in hidden['packages'].items():
    expected = lock['packages'].get(name)
    if expected is None or any(entry.get(k) != expected.get(k) for k in ('version', 'resolved', 'integrity')):
        reject('Installed lock identity mismatch: ' + name)
for name, expected in lock['packages'].items():
    if not name: continue
    installed = root / name / 'package.json'
    if not installed.is_file():
        if expected.get('optional'): continue
        reject('Required installed dependency missing: ' + name)
    if name not in hidden['packages'] or json.loads(installed.read_text()).get('version') != expected.get('version'):
        reject('Installed dependency version/receipt mismatch: ' + name)
for name in ('expo', 'react-native', 'expo/node_modules/@expo/cli'):
    p = root / 'node_modules' / name / 'package.json'
    print(f'{name}={json.loads(p.read_text())["version"]}')
print('lock_sha256=' + hashlib.sha256((root / 'package-lock.json').read_bytes()).hexdigest())
print('private_dependency_identity=PASSED (lock/version checks; not an npm integrity re-download)')
for name, value in os.environ.items():
    if name.startswith('EXPO_PUBLIC_') and not (name == 'EXPO_PUBLIC_GHAF_SERVICE_MODE' and value == 'mock'):
        reject('Unreviewed public environment override; unset it before preflight/build (value withheld).')
if any(p.name != '.env.example' for p in root.glob('.env*')):
    reject('Local dotenv files require owner reconciliation; this script neither reads nor deletes them.')
PY
}
step input-identity check_inputs

readonly EXPO="$ROOT/node_modules/expo/bin/cli"
readonly TEMPLATE="$ROOT/node_modules/expo/template.tgz"
[[ -f "$EXPO" && -f "$TEMPLATE" ]] || fail 'Installed Expo CLI/template missing; private npm ci must complete first.'
[[ "$(tar -xOf "$TEMPLATE" package/android/app/debug.keystore | sha256sum | awk '{print $1}')" == "$KEY_SHA" ]] || fail 'Installed template signing key mismatch. Do not replace keys.'
tar -xOf "$TEMPLATE" package/android/gradle/wrapper/gradle-wrapper.properties > "$RUN/template-gradle-wrapper.properties"
rg -q '^distributionUrl=https\\://services.gradle.org/distributions/gradle-9\.3\.1-bin\.zip$' "$RUN/template-gradle-wrapper.properties" || fail 'Installed template Gradle is not the inspected 9.3.1 input.'
cp "$RUN/template-gradle-wrapper.properties" "$RUN/approved-gradle-wrapper.properties"
printf '\ndistributionSha256Sum=%s\n' "$GRADLE_SHA" >> "$RUN/approved-gradle-wrapper.properties"
tar -xOf "$TEMPLATE" package/android/app/debug.keystore > "$RUN/template-debug.keystore"
sha256sum "$TEMPLATE" > "$RUN/template.sha256"

for executable in "$JDK/bin/java" "$JDK/bin/javac" "$JDK/bin/keytool" "$SDK/build-tools/36.0.0/aapt" "$SDK/build-tools/36.0.0/apksigner" "$SDK/cmake/3.30.5/bin/cmake" "$SDK/cmake/3.30.5/bin/ninja" "$SDK/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/clang"; do
  [[ -x "$executable" ]] || fail "Missing approved executable: $executable; operator provisioning required."
done
step java-version env -i "PATH=$JDK/bin:/usr/bin:/bin" "$JDK/bin/java" -version
rg -q 'version "17\.' "$LAST_LOG" || fail 'JDK major must be 17.'
step javac-version env -i "PATH=$JDK/bin:/usr/bin:/bin" "$JDK/bin/javac" -version
rg -q '^javac 17\.' "$LAST_LOG" || fail 'Javac major must be 17.'
step sdk-inputs python3 - "$SDK" <<'PY'
import pathlib, re, sys
sdk = pathlib.Path(sys.argv[1])
for location, version in [('build-tools/36.0.0', '36.0.0'), ('ndk/27.1.12297006', '27.1.12297006'), ('cmake/3.30.5', '3.30.5')]:
    p = sdk / location / 'source.properties'
    if not p.is_file() or not re.search(r'^Pkg.Revision\s*=\s*' + re.escape(version) + r'\s*$', p.read_text(), re.M):
        sys.exit('BLOCKED: missing/wrong SDK component: ' + location)
    print(location + '=' + version)
p = sdk / 'platforms/android-36/source.properties'
if not p.is_file() or not re.search(r'^AndroidVersion.ApiLevel\s*=\s*36\s*$', p.read_text(), re.M):
    sys.exit('BLOCKED: SDK platform 36 is missing.')
if not (sdk / 'platforms/android-36/android.jar').is_file(): sys.exit('BLOCKED: android-36/android.jar missing.')
if not (sdk / 'licenses/android-sdk-license').is_file(): sys.exit('BLOCKED: accepted SDK license file missing; operator must review applicable terms.')
print('platform_api=36; license file presence is not evidence of new terms acceptance')
PY
step cmake-version "$SDK/cmake/3.30.5/bin/cmake" --version
rg -q '^cmake version 3\.30\.5$' "$LAST_LOG" || fail 'CMake executable version mismatch.'

# Use a controlled child environment; do not import .env files, credentials or feature overrides.
NODE=$(command -v node)
CHILD_ENV=(env -i "PATH=$JDK/bin:$(dirname "$NODE"):/usr/bin:/bin" "HOME=$HOME" "USER=${USER:-smyk}" \
  LANG=C.UTF-8 CI=1 EXPO_NO_TELEMETRY=1 EXPO_NO_DOTENV=1 EXPO_OFFLINE=1 \
  EXPO_PUBLIC_GHAF_SERVICE_MODE=mock "JAVA_HOME=$JDK" "ANDROID_HOME=$SDK" "ANDROID_SDK_ROOT=$SDK" \
  "ANDROID_USER_HOME=$CACHE/android-user" "GRADLE_USER_HOME=$CACHE/gradle" \
  "XDG_CACHE_HOME=$CACHE/xdg" "__UNSAFE_EXPO_HOME_DIRECTORY=$CACHE/expo" "TMPDIR=$CACHE/tmp" \
  "GRADLE_OPTS=-Djava.io.tmpdir=$CACHE/tmp" \
  'NODE_OPTIONS=--max-old-space-size=1536' CMAKE_BUILD_PARALLEL_LEVEL=2)
mkdir -p "$CACHE/tmp" "$CACHE/gradle" "$CACHE/xdg" "$CACHE/expo" "$CACHE/android-user"
step ninja-version "$SDK/cmake/3.30.5/bin/ninja" --version
step ndk-clang-version "$SDK/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/clang" --version
step expo-version "${CHILD_ENV[@]}" "$NODE" "$EXPO" --version
step public-config "${CHILD_ENV[@]}" "$NODE" "$EXPO" config --type public --json
CONFIG_LOG=$LAST_LOG
step approved-config python3 - "$CONFIG_LOG" <<'PY'
import json, sys
c = json.load(open(sys.argv[1]))
a = c.get('android', {})
checks = [c.get('version') == '0.1.0', a.get('package') == 'ae.ac.ku.ghaf.prototype',
          a.get('allowBackup') is False, c.get('extra', {}).get('serviceMode') == 'mock',
          c.get('extra', {}).get('identifiersAreProvisional') is True,
          {'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.WRITE_EXTERNAL_STORAGE'} <= set(a.get('blockedPermissions', []))]
if not all(checks): sys.exit('BLOCKED: public config differs from approved provisional package/version/backup/permission/mock inputs.')
print('approved_provisional_config=PASSED')
PY

resource_check() {
  python3 - "$ROOT" "$OUTPUT" "$CACHE" "$JDK" "$SDK" <<'PY'
import pathlib, shutil, sys
memory = {line.split(':')[0]: int(line.split()[1]) for line in pathlib.Path('/proc/meminfo').read_text().splitlines()}
available, total = memory['MemAvailable'], memory['MemTotal']
print(f'memory_available_kib={available}; memory_total_kib={total}; swap_free_kib={memory["SwapFree"]}')
if available < max(3 * 1024 * 1024, total * .4): sys.exit('BLOCKED: start requires 3 GiB and 40% memory available; release owned workloads through A.')
for path in sys.argv[1:]:
    free = shutil.disk_usage(path).free
    print(f'disk_path={path}; free_bytes={free}')
    if free < 20 * 1024**3: sys.exit('BLOCKED: require at least 20 GiB free for a first native build.')
print('resource_policy=conservative operating thresholds, not measured build capacity')
PY
}
step resource-headroom resource_check
if [[ "$MODE" == preflight ]]; then
  printf 'PREFLIGHT PASSED. Generation, compilation and APK/device validation NOT RUN.\n' | tee -a "$RUN/receipt.txt"
  exit 0
fi
exec 9> "$CACHE/native-build.lock"
flock -n 9 || fail 'Another B build holds the private build lock.'
step released-preview python3 - <<'PY'
import pathlib, re, sys
blocked = []
for proc in pathlib.Path('/proc').iterdir():
    if not proc.name.isdecimal(): continue
    try:
        args = (proc / 'cmdline').read_bytes().replace(b'\0', b' ').decode(errors='replace')
        name = (proc / 'comm').read_text().strip()
    except (FileNotFoundError, PermissionError, ProcessLookupError): continue
    if re.search(r'(^|/)(firefox|chromium|chrome)( |$)', args.split(' ', 1)[0]) or re.search(r'(?:/expo|\bexpo) start\b|\bmetro (?:start|serve)\b', args):
        blocked.append({'pid': int(proc.name), 'name': name})
if blocked: sys.exit('BLOCKED: resident preview processes; owner must release them: ' + str(blocked))
print('no_resident_preview_detected; explicit operator acknowledgment still required')
PY

# Retain the exact prebuild package delta even when generation fails.
cp package.json "$RUN/package.before.json"
capture_delta() {
  git diff -- package.json > "$RUN/package.prebuild.diff"
  cp package.json "$RUN/package.after.json"
}
generation_identity() {
  python3 - "$ROOT" "$SOURCE_COMMIT" "$RUN" "$1" <<'PY'
import hashlib, json, os, pathlib, sys
root, source, run, mode = pathlib.Path(sys.argv[1]), sys.argv[2], pathlib.Path(sys.argv[3]), sys.argv[4]
native = root / 'android'
marker = native / '.ghaf-generation.json'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
identity = {'source_commit': source, 'lock_sha256': digest(root / 'package-lock.json'),
            'app_config_sha256': digest(root / 'app.config.ts'), 'template_sha256': digest(root / 'node_modules/expo/template.tgz'),
            'wrapper_sha256': digest(run / 'approved-gradle-wrapper.properties')}
inventory = {}
if native.is_symlink(): sys.exit('BLOCKED: android must not be a symlink.')
for current, dirs, files in os.walk(native):
    for name in dirs + files:
        if (pathlib.Path(current) / name).is_symlink(): sys.exit('BLOCKED: generated native tree contains a symlink.')
for current, dirs, files in os.walk(native):
    dirs[:] = [d for d in dirs if d not in ('build', '.gradle', '.cxx', '.kotlin')]
    for name in files:
        p = pathlib.Path(current) / name
        if p != marker: inventory[str(p.relative_to(native))] = digest(p)
receipt = {'identity': identity, 'source_files': inventory}
if mode == 'record':
    marker.write_text(json.dumps(receipt, indent=2) + '\n')
elif not marker.is_file() or json.loads(marker.read_text()) != receipt:
    sys.exit('BLOCKED: existing android tree is unowned, modified or has different inputs. Preserve it for A; never --clean.')
(run / 'generation.json').write_text(json.dumps(receipt, indent=2) + '\n')
print('generated_tree_identity=' + mode)
PY
}

if [[ -e android || -L android ]]; then
  step reuse-generated-tree generation_identity verify
else
  prebuild() {
    local status=0
    "${CHILD_ENV[@]}" "$NODE" "$EXPO" prebuild --platform android --no-install || status=$?
    capture_delta
    return "$status"
  }
  step prebuild prebuild
  step post-prebuild-inputs check_inputs
  cmp "$RUN/template-gradle-wrapper.properties" android/gradle/wrapper/gradle-wrapper.properties || fail 'Fresh wrapper differs from template; preserve generated tree for A.'
  cp "$RUN/approved-gradle-wrapper.properties" android/gradle/wrapper/gradle-wrapper.properties
  diff -u "$RUN/template-gradle-wrapper.properties" android/gradle/wrapper/gradle-wrapper.properties > "$RUN/gradle-wrapper-checksum.diff" || [[ $? == 1 ]]
  step record-generated-tree generation_identity record
fi
capture_delta
step before-compile-inputs check_inputs
[[ "$(sha256sum android/app/debug.keystore | awk '{print $1}')" == "$KEY_SHA" ]] || fail 'Generated template signing key mismatch; do not replace it.'
cmp "$RUN/approved-gradle-wrapper.properties" android/gradle/wrapper/gradle-wrapper.properties || fail 'Generated Gradle wrapper version/checksum differs from approved inputs.'
rg -q 'signingConfig signingConfigs.debug' android/app/build.gradle || fail 'Expected template signing configuration missing.'
step template-certificate "${CHILD_ENV[@]}" "$JDK/bin/keytool" -exportcert -keystore "$RUN/template-debug.keystore" -alias androiddebugkey -storepass android -file "$RUN/template-cert.der"
sha256sum "$RUN/template-cert.der" > "$RUN/template-cert.sha256"

GRADLE_TASK=:app:assembleRelease
[[ "$MODE" != manifest ]] || GRADLE_TASK=:app:processReleaseMainManifest

compile() {
  local status=0 pressure=0 previous_swap=0 pid_pgid
  local cpu_set
  cpu_set=$(python3 -c 'import os; print(",".join(map(str, sorted(os.sched_getaffinity(0))[:2])))') || return $?
  printf 'build_cpu_affinity=%s\n' "$cpu_set" >> "$RUN/receipt.txt"
  (
    cd "$ROOT/android"
    exec setsid taskset -c "$cpu_set" "${CHILD_ENV[@]}" ./gradlew "$GRADLE_TASK" -Pandroid.cmakeVersion=3.30.5 -Pandroid.builder.sdkDownload=false \
      --no-daemon --no-parallel --max-workers=2 \
      -Pkotlin.compiler.execution.strategy=in-process \
      "-Dorg.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8 -Djava.io.tmpdir=$CACHE/tmp"
  ) &
  CHILD_PID=$!
  printf 'owned_process_group=%s\n' "$CHILD_PID" >> "$RUN/receipt.txt"
  while kill -0 "$CHILD_PID" 2>/dev/null; do
    local available total swap free swap_delta
    read -r total available < <(awk '/^MemTotal:/ {t=$2} /^MemAvailable:/ {a=$2} END {print t,a}' /proc/meminfo)
    swap=$(awk '/^pswpin / {i=$2} /^pswpout / {o=$2} END {print i+o}' /proc/vmstat)
    free=$(df -Pk "$ROOT" | awk 'END {print $4}')
    swap_delta=$((previous_swap == 0 ? 0 : swap - previous_swap))
    printf 'utc=%s available_kib=%s total_kib=%s swap_pages_delta=%s root_free_kib=%s\n' "$(date -u +%FT%TZ)" "$available" "$total" "$swap_delta" "$free" >> "$RUN/resources.log"
    if ((available * 100 < total * 15 || swap_delta > 1024)); then pressure=$((pressure + 1)); else pressure=0; fi
    previous_swap=$swap
    if ((pressure >= 3 || free < 5 * 1024 * 1024)); then
      printf 'Resource stop: owned build group only; no other process is terminated.\n' >&2
      pid_pgid=$(ps -o pgid= -p "$CHILD_PID" | tr -d ' ') || true
      [[ "$pid_pgid" == "$CHILD_PID" ]] || fail 'Cannot verify owned build group; operator must inspect recorded PID.'
      kill -TERM -- "-$CHILD_PID" 2>/dev/null || true
      sleep 5
      kill -KILL -- "-$CHILD_PID" 2>/dev/null || true
      wait "$CHILD_PID" || true
      CHILD_PID=
      return 75
    fi
    sleep 5
  done
  wait "$CHILD_PID" || status=$?
  CHILD_PID=
  return "$status"
}
step resource-before-compile resource_check
step "gradle-$MODE" compile
step after-compile-inputs check_inputs
step after-compile-native generation_identity verify
if [[ "$MODE" == manifest ]]; then
  step merged-manifest-review python3 - "$ROOT" "$RUN" <<'PYMANIFEST'
import hashlib, json, pathlib, shutil, sys, xml.etree.ElementTree as ET
root, run = map(pathlib.Path, sys.argv[1:])
base = root / 'android/app/build'
files = sorted(p for p in (base / 'intermediates').glob('**/AndroidManifest.xml')
               if p.parent.name == 'processReleaseMainManifest' and 'release' in p.parts)
if len(files) != 1:
    sys.exit('BLOCKED: expected one actual release-main merged manifest; preserve outputs for review: ' + str(files))
manifest = files[0]
ns = '{http://schemas.android.com/apk/res/android}'
tree = ET.parse(manifest).getroot()
permissions = sorted({e.attrib[ns + 'name'] for e in tree if e.tag in ('uses-permission', 'uses-permission-sdk-23')})
application = tree.find('application')
if application is None:
    sys.exit('BLOCKED: merged manifest lacks application element.')
shutil.copyfile(manifest, run / 'merged-release-manifest.xml')
reports = sorted(p for p in (base / 'outputs/logs').glob('*manifest*release*') if p.is_file())
if not reports:
    sys.exit('BLOCKED: release manifest merger report missing; retain generated outputs for A.')
for index, report in enumerate(reports):
    shutil.copyfile(report, run / f'manifest-merger-{index}.txt')
receipt = {'source_manifest': str(manifest), 'sha256': hashlib.sha256(manifest.read_bytes()).hexdigest(),
           'package': tree.get('package'), 'permissions': permissions,
           'permission_declarations': [dict(e.attrib) for e in tree if e.tag in ('uses-permission', 'uses-permission-sdk-23')],
           'allowBackup': application.get(ns + 'allowBackup'), 'merger_reports': [str(p) for p in reports],
           'approval': 'PENDING A exact permission review; no APK or native acceptance'}
(run / 'merged-manifest-review.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
PYMANIFEST
  printf 'MANIFEST GENERATED FOR A REVIEW. Permission approval, APK and device validation NOT RUN.\n' | tee -a "$RUN/receipt.txt"
  exit 0
fi

APK="$ROOT/android/app/build/outputs/apk/release/app-release.apk"
[[ -s "$APK" && ! -L "$APK" ]] || fail 'Signed release APK missing; unsigned APK/AAB/export is not success.'
[[ "$(realpath -e "$APK")" == "$APK" ]] || fail 'APK path escapes generated output.'
cp "$APK" "$RUN/ghaf-internal-rehearsal.apk"
APK="$RUN/ghaf-internal-rehearsal.apk"
sha256sum "$APK" > "$RUN/apk.sha256"
step apk-signature "${CHILD_ENV[@]}" "$SDK/build-tools/36.0.0/apksigner" verify --verbose --print-certs "$APK"
SIGNATURE_LOG=$LAST_LOG
step apk-badging "$SDK/build-tools/36.0.0/aapt" dump badging "$APK"
BADGING_LOG=$LAST_LOG
step apk-permissions "$SDK/build-tools/36.0.0/aapt" dump permissions "$APK"
PERMISSIONS_LOG=$LAST_LOG
step apk-manifest "$SDK/build-tools/36.0.0/aapt" dump xmltree "$APK" AndroidManifest.xml
MANIFEST_LOG=$LAST_LOG
step verify-artifact python3 - "$APK" "$RUN/template-cert.der" "$SIGNATURE_LOG" "$BADGING_LOG" "$PERMISSIONS_LOG" "$MANIFEST_LOG" "$CONFIG_LOG" <<'PY'
import hashlib, json, pathlib, re, sys, zipfile
apk, cert, signature, badging, permissions, manifest, config = map(pathlib.Path, sys.argv[1:])
def reject(message): sys.exit('BLOCKED: ' + message)
expected_cert = hashlib.sha256(cert.read_bytes()).hexdigest()
certs = re.findall(r'^Signer #\d+ certificate SHA-256 digest: ([0-9a-fA-F]+)$', signature.read_text(), re.M)
if len(certs) != 1 or certs[0].lower() != expected_cert: reject('APK signer differs from the approved template certificate.')
b = badging.read_text()
c = json.loads(config.read_text())
package = re.search(r"^package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'", b, re.M)
if not package or package.groups() != (c['android']['package'], str(c['android'].get('versionCode', 1)), c['version']):
    reject('APK package/version differs from approved config.')
if 'application-debuggable' in b: reject('APK is debuggable; expected a standalone release variant.')
if not re.search(r"^targetSdkVersion:'36'$", b, re.M): reject('APK target SDK mismatch.')
manifest_text = manifest.read_text()
application = re.search(r'^\s*E: application\b.*?(?=^\s*E: |\Z)', manifest_text, re.M | re.S)
if not application or not re.search(r'A: android:allowBackup\([^)]*\)=\(type 0x12\)0x0\b', application.group()):
    reject('Merged application must explicitly set allowBackup=false.')
for permission in c['android']['blockedPermissions']:
    if permission in permissions.read_text(): reject('Blocked shared-storage permission in APK: ' + permission)
actual_permissions = set(re.findall(r"^uses-permission(?:-sdk-23)?: name='([^']+)'", permissions.read_text(), re.M))
expected_permissions = set(json.loads((apk.parent / 'approved-permissions.json').read_text()))
if actual_permissions != expected_permissions:
    reject('Merged permissions differ from A-reviewed set; preserve APK and logs for A. Added=' + str(sorted(actual_permissions - expected_permissions)) + '; missing=' + str(sorted(expected_permissions - actual_permissions)))
with zipfile.ZipFile(apk) as archive:
    entries = archive.infolist()
    names = [i.filename for i in entries]
    bundles = [i for i in entries if i.filename == 'assets/index.android.bundle' and i.file_size > 0]
    if not bundles: reject('APK has no nonempty bundled JavaScript/Hermes payload.')
    abis = sorted({name.split('/')[1] for name in names if name.startswith('lib/') and name.endswith('.so')})
    expected_abis = sorted(['armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'])
    if abis != expected_abis: reject('APK ABI set differs from unchanged template defaults: ' + ','.join(abis))
    native = re.search(r'^native-code: (.+)$', b, re.M)
    if not native or sorted(re.findall(r"'([^']+)'", native.group(1))) != abis: reject('Badging and ZIP ABI inventories disagree.')
    assets = [i for i in entries if i.file_size and (i.filename.startswith('assets/') or i.filename.startswith('res/'))]
    if not any(i.filename.endswith('.mp3') for i in assets): reject('Prepared audio assets absent from APK.')
    if not any(i.filename.endswith(('.ttf', '.otf')) for i in assets): reject('Bundled fonts absent from APK.')
    if not any(i.filename.endswith(('.png', '.webp', '.jpg')) for i in assets): reject('Bundled image assets absent from APK.')
    inventory = {'package': package.group(1), 'version_code': package.group(2), 'version_name': package.group(3),
                 'abis': abis, 'permissions': sorted(actual_permissions), 'certificate_sha256': expected_cert, 'apk_sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
                 'assets': [{'path': i.filename, 'bytes': i.file_size} for i in assets]}
    (apk.parent / 'artifact.json').write_text(json.dumps(inventory, indent=2) + '\n')
print('internal_signed_standalone_artifact=PASSED; device/human acceptance NOT RUN')
PY
printf 'INTERNAL REHEARSAL APK VERIFIED: %s\nTemplate debug signing only; device/human acceptance NOT RUN.\n' "$APK" | tee -a "$RUN/receipt.txt"
