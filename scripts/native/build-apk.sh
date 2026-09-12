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
ENTRY_MODE=ordinary
NATIVE_CONFIGURE_STAGE=
ROOT= EXPECTED_HEAD= SOURCE_COMMIT= JDK= SDK= OUTPUT= CACHE=
SIGNING=0 HEAVY_ACK= METRO_ACK= LICENSE_ACK= APPROVED_PERMISSIONS=
RUN= CHILD_PID= LAST_LOG= GRADLE_LOG= NATIVE_POOL_SHA= STEP=0

usage() {
  cat <<'HELP'
Usage: build-apk.sh [--build | --manifest-only | --task-graph-only | --native-configure-stage STAGE] REQUIRED_OPTIONS

Default: PREFLIGHT. Never installs, generates Android, downloads Gradle or compiles.
Preflight writes an isolated receipt only after root/input/path validation.

Required in all modes:
  --project-root ABS_PATH       Exactly /home/smyk/projects/Ghaf-demo-systems
  --expected-head FULL_SHA      Exact checked-out 40-character Git HEAD
  --source-commit FULL_SHA      A's published runtime-source commit (exact input match)
  --jdk-home ABS_PATH           Approved JDK 17 within output/native-toolchain/
  --sdk-root ABS_PATH           Approved SDK within output/native-toolchain/
  --output-dir ABS_PATH         Existing directory within output/native-build/
  --cache-dir ABS_PATH          Existing directory within output/native-cache/
  --entry-mode ordinary|demo    Default ordinary; demo requires A's selected015 source
  --allow-internal-debug-signing
                               Opt in to the unchanged Expo template debug identity

Generation/Gradle modes require explicit coordination/terms receipt references:
  --task-graph-only            Render release task graph from matching existing Android;
                               configuration/plugin setup can execute; no APK inspection
  --native-configure-stage worklets|remaining
                               Fixed release CMake targets; existing Android required.
                               Remaining also compiles Worklets through prefab dependencies.
  --manifest-only              Generate and merge release manifest for A review; no APK
  --build                      Compile and inspect the standalone release APK
  --heavy-slot-ack REFERENCE    Current A/operator grant for this native build
  --metro-release-ack REFERENCE Current confirmation Metro/browser have stopped
  --sdk-license-ack REFERENCE   Applicable accepted SDK terms evidence
  --approved-permissions FILE   Build only: A-reviewed JSON array of permission names;
                               absolute existing file within output/native-build/

Inputs inspected: JDK 17, SDK 36, Build Tools 35.0.0 and 36.0.0, NDK 27.1.12297006,
CMake 3.30.5, template Gradle 9.3.1. Their compatibility is NOT yet proven.
Private dependencies must match package-lock.json; no linked/shared node_modules.
Entry mode is supplied only through this option, never inherited environment or
dotenv. Demo sets EXPO_PUBLIC_GHAF_DEMO_ENTRY=true in the controlled child environment.
Generation uses installed Expo prebuild --platform android --no-install only when
android/ is absent. Existing trees need this script's matching generation receipt.
Only package.json android/ios script normalization is tolerated and retained for A.
No automatic restore, clean generation, signing-key replacement, upload or install.
A changed source/generation identity stops reuse: A must grant archival and fresh
generation of the owned android tree. The script never archives or cleans it itself.

Build resource policy: two allowed CPUs, one Gradle worker, no parallel Gradle,
1536 MiB Java heap / 512 MiB metaspace, 1024 MiB Node heap and a requested shared
Ninja compile/link pool of depth 1. Generated-edge and process coverage need review.
These are individual limits, NOT a total memory cap. Owned descendants are tracked
by boot/PID/start identity, including separate daemon groups, and stopped on low
available memory, sustained paging or low disk; logs and generated files remain.
Runtime stop: below 15% available memory immediately, below 5 GiB disk, or paging
over 1024 pages with below 30% available memory for three consecutive 5s samples.
Missing essential measurements fail closed; optional PSI absence is recorded.
Receipts retain UTC step times, exit codes, config, package diff, tool identities,
APK hash/certificate/ABIs/merged manifest and bundle inventory. Successful artifact
inspection does not establish physical-device or human acceptance.
HELP
}

owned_processes() {
  python3 - "$1" "$CHILD_PID" "$RUN/owned-processes.json" <<'PYPROCESSES'
import json, os, pathlib, signal, sys, time
mode, root_raw, file_raw = sys.argv[1:]
root, path = int(root_raw), pathlib.Path(file_raw)
boot = pathlib.Path('/proc/sys/kernel/random/boot_id').read_text().strip()
def identity(pid):
    try:
        parts = pathlib.Path(f'/proc/{pid}/stat').read_text().rsplit(')', 1)[1].split()
        return {'pid': pid, 'parent': int(parts[1]), 'start': parts[19], 'state': parts[0]}
    except (FileNotFoundError, ProcessLookupError, PermissionError):
        return None
record = json.loads(path.read_text()) if path.exists() else {'boot': boot, 'root': root, 'processes': []}
if record['boot'] != boot or record['root'] != root:
    sys.exit('BLOCKED: owned process receipt identity differs; no signals sent.')
known = {p['pid']: p for p in record['processes']}
def refresh(adopt=False):
    live = {int(p.name): identity(int(p.name)) for p in pathlib.Path('/proc').iterdir() if p.name.isdecimal()}
    live = {pid: row for pid, row in live.items() if row is not None}
    owned = {pid for pid, old in known.items() if pid in live and live[pid]['start'] == old['start']}
    if not known and adopt:
        if root not in live or live[root]['parent'] != os.getppid():
            sys.exit('BLOCKED: initial process root is not a live child of this launcher; no ownership adopted.')
        owned.add(root)
    while True:
        added = {pid for pid, row in live.items() if row['parent'] in owned} - owned
        if not added: break
        owned |= added
    for pid in owned:
        known[pid] = live[pid]
    record['processes'] = list(known.values())
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(record, indent=2) + '\n')
    temp.replace(path)
if mode == 'capture':
    refresh(adopt=True)
elif mode == 'stop':
    if not known:
        sys.exit('BLOCKED: no captured owned process identity; cleanup requires operator inspection.')
    if not hasattr(os, 'pidfd_open') or not hasattr(signal, 'pidfd_send_signal'):
        sys.exit('BLOCKED: Linux pidfd signaling unavailable; inspect recorded owned PIDs.')
    def alive(row):
        current = identity(row['pid'])
        return current is not None and current['start'] == row['start'] and current['state'] != 'Z'
    for sig, pause in [(signal.SIGTERM, 2), (signal.SIGKILL, .2)]:
        refresh()
        for row in reversed(list(known.values())):
            if not alive(row): continue
            try:
                fd = os.pidfd_open(row['pid'])
                try:
                    if alive(row): signal.pidfd_send_signal(fd, sig)
                finally: os.close(fd)
            except ProcessLookupError: pass
        time.sleep(pause)
    refresh()
    remaining = [row['pid'] for row in known.values() if alive(row)]
    if remaining: sys.exit('BLOCKED: owned processes still alive: ' + str(remaining))
else:
    sys.exit('Unknown process receipt operation')
PYPROCESSES
}

finish() {
  local status=$?
  trap - EXIT INT TERM
  if [[ -n "$CHILD_PID" ]]; then
    owned_processes capture || true
    if owned_processes stop; then
      wait "$CHILD_PID" 2>/dev/null || true
    else
      printf 'Owned descendant cleanup failed; inspect the PID receipt.\n' >&2
      [[ "$status" != 0 ]] || status=1
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
    --build|--manifest-only|--task-graph-only)
      [[ "$MODE" == preflight ]] || fail 'Choose only one explicit execution mode.'
      case "$1" in
        --build) MODE=build ;;
        --manifest-only) MODE=manifest ;;
        --task-graph-only) MODE=graph ;;
      esac
      shift ;;
    --native-configure-stage)
      [[ "$MODE" == preflight ]] || fail 'Choose only one explicit execution mode.'
      need_value "$@"
      [[ "$2" == worklets || "$2" == remaining ]] || fail 'Native configure stage must be worklets or remaining; arbitrary targets are not accepted.'
      MODE=configure; NATIVE_CONFIGURE_STAGE=$2; shift 2 ;;
    --allow-internal-debug-signing) SIGNING=1; shift ;;
    --project-root|--expected-head|--source-commit|--jdk-home|--sdk-root|--output-dir|--cache-dir|--entry-mode|--heavy-slot-ack|--metro-release-ack|--sdk-license-ack|--approved-permissions)
      need_value "$@"
      case "$1" in
        --project-root) ROOT=$2 ;; --expected-head) EXPECTED_HEAD=$2 ;;
        --source-commit) SOURCE_COMMIT=$2 ;; --jdk-home) JDK=$2 ;;
        --sdk-root) SDK=$2 ;; --output-dir) OUTPUT=$2 ;; --cache-dir) CACHE=$2 ;;
        --entry-mode) ENTRY_MODE=$2 ;;
        --heavy-slot-ack) HEAVY_ACK=$2 ;; --metro-release-ack) METRO_ACK=$2 ;;
        --sdk-license-ack) LICENSE_ACK=$2 ;;
        --approved-permissions) APPROVED_PERMISSIONS=$2 ;;
      esac
      shift 2 ;;
    *) fail "Unknown option: $1 (see --help)" ;;
  esac
done
[[ "$ENTRY_MODE" == ordinary || "$ENTRY_MODE" == demo ]] || fail 'Entry mode must be ordinary or demo.'
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
printf 'start_utc=%s\nmode=%s\nentry_mode=%s\nhead=%s\nsource_commit=%s\nroot=%s\nscript_sha256=%s\nsigning=internal-rehearsal-template-debug-only\nheavy_slot_ack=%s\nmetro_release_ack=%s\nsdk_license_ack=%s\n' \
  "$STARTED" "$MODE" "$ENTRY_MODE" "$EXPECTED_HEAD" "$SOURCE_COMMIT" "$ROOT" "$(sha256sum "${BASH_SOURCE[0]}" | awk '{print $1}')" \
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
step process-control python3 -c 'import os, signal, sys; sys.exit(0 if hasattr(os, "pidfd_open") and hasattr(signal, "pidfd_send_signal") else "Linux pidfd support required for safe owned-process cleanup")'

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

for executable in "$JDK/bin/java" "$JDK/bin/javac" "$JDK/bin/keytool" "$SDK/build-tools/35.0.0/aapt" "$SDK/build-tools/35.0.0/apksigner" "$SDK/build-tools/36.0.0/aapt" "$SDK/build-tools/36.0.0/apksigner" "$SDK/cmake/3.30.5/bin/cmake" "$SDK/cmake/3.30.5/bin/ninja" "$SDK/ndk/27.1.12297006/toolchains/llvm/prebuilt/linux-x86_64/bin/clang"; do
  [[ -x "$executable" ]] || fail "Missing approved executable: $executable; operator provisioning required."
done
step java-version env -i "PATH=$JDK/bin:/usr/bin:/bin" "$JDK/bin/java" -version
rg -q 'version "17\.' "$LAST_LOG" || fail 'JDK major must be 17.'
step javac-version env -i "PATH=$JDK/bin:/usr/bin:/bin" "$JDK/bin/javac" -version
rg -q '^javac 17\.' "$LAST_LOG" || fail 'Javac major must be 17.'
step sdk-inputs python3 - "$SDK" <<'PY'
import pathlib, re, sys
sdk = pathlib.Path(sys.argv[1])
for location, version in [('build-tools/35.0.0', '35.0.0'), ('build-tools/36.0.0', '36.0.0'), ('ndk/27.1.12297006', '27.1.12297006'), ('cmake/3.30.5', '3.30.5')]:
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
  'NODE_OPTIONS=--max-old-space-size=1024' CMAKE_BUILD_PARALLEL_LEVEL=1)
DEMO_ENTRY_VALUE=false
if [[ "$ENTRY_MODE" == demo ]]; then
  [[ -f src/config/demoEntry.ts ]] || fail 'Demo entry requires the selected015 source configuration.'
  DEMO_ENTRY_VALUE=true
fi
CHILD_ENV+=("EXPO_PUBLIC_GHAF_DEMO_ENTRY=$DEMO_ENTRY_VALUE")
printf 'EXPO_PUBLIC_GHAF_DEMO_ENTRY=%s\n' "$DEMO_ENTRY_VALUE" >> "$RUN/receipt.txt"
printf 'gradle_heap_mib=1536\ngradle_metaspace_mib=512\nnode_heap_mib=1024\ngradle_workers=1\ncmake_pool_requested_depth=1\nmetro_workers=1\n' >> "$RUN/receipt.txt"
printf 'resource_policy=memory-correlated-paging-v2\ncritical_available_percent=15\npaging_available_percent=30\npaging_pages_threshold=1024\npaging_consecutive_samples=3\nsample_interval_seconds=5\nruntime_disk_floor_gib=5\n' >> "$RUN/receipt.txt"
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

if [[ "$MODE" == graph || "$MODE" == configure ]]; then
  [[ -d android ]] || fail 'Graph/configure mode requires the existing matching Android tree; generation needs its own grant.'
fi
# Retain the exact prebuild package delta even when generation fails.
cp package.json "$RUN/package.before.json"
capture_delta() {
  git diff -- package.json > "$RUN/package.prebuild.diff"
  cp package.json "$RUN/package.after.json"
}
configure_generated_bundle() {
  python3 - "$ROOT" "$RUN" <<'PYBUNDLE'
import difflib, hashlib, json, pathlib, re, sys
root, run = map(pathlib.Path, sys.argv[1:])
path = root / 'android/app/build.gradle'
if path.is_symlink() or path.resolve() != path or not path.is_file():
    sys.exit('BLOCKED: fresh app Gradle file is missing or linked; preserve native output.')
before = path.read_text()
anchor = 'react {\n'
if before.count(anchor) != 1 or re.search(r'^\s*extraPackagerArgs\b', before, re.M) or before.count('bundleCommand = "export:embed"') != 1:
    sys.exit('BLOCKED: fresh Expo bundling configuration differs; preserve it for A review.')
after = before.replace(anchor, anchor + '    extraPackagerArgs = ["--max-workers", "1"]\n', 1)
(run / 'app-build.before.gradle').write_text(before)
(run / 'app-build.metro.diff').write_text(''.join(difflib.unified_diff(before.splitlines(True), after.splitlines(True), fromfile='before/android/app/build.gradle', tofile='after/android/app/build.gradle')))
path.write_text(after)
(run / 'app-build.after.gradle').write_text(after)
receipt = {'policy': 'expo-embed-one-worker-v1', 'metro_max_workers': 1,
           'before_sha256': hashlib.sha256(before.encode()).hexdigest(),
           'after_sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
(run / 'app-build.metro.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
PYBUNDLE
}
generation_identity() {
  python3 - "$ROOT" "$SOURCE_COMMIT" "$RUN" "$1" "$ENTRY_MODE" <<'PY'
import hashlib, json, os, pathlib, sys
root, source, run, mode = pathlib.Path(sys.argv[1]), sys.argv[2], pathlib.Path(sys.argv[3]), sys.argv[4]
native = root / 'android'
marker = native / '.ghaf-generation.json'
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
identity = {'source_commit': source, 'entry_mode': sys.argv[5], 'lock_sha256': digest(root / 'package-lock.json'),
            'metro_policy': 'expo-embed-one-worker-v1', 'metro_max_workers': 1,
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
  step configure-metro-worker configure_generated_bundle
  step record-generated-tree generation_identity record
fi
capture_delta
step before-compile-inputs check_inputs
[[ "$(sha256sum android/app/debug.keystore | awk '{print $1}')" == "$KEY_SHA" ]] || fail 'Generated template signing key mismatch; do not replace it.'
cmp "$RUN/approved-gradle-wrapper.properties" android/gradle/wrapper/gradle-wrapper.properties || fail 'Generated Gradle wrapper version/checksum differs from approved inputs.'
rg -q 'signingConfig signingConfigs.debug' android/app/build.gradle || fail 'Expected template signing configuration missing.'
step template-certificate "${CHILD_ENV[@]}" "$JDK/bin/keytool" -exportcert -keystore "$RUN/template-debug.keystore" -alias androiddebugkey -storepass android -file "$RUN/template-cert.der"
sha256sum "$RUN/template-cert.der" > "$RUN/template-cert.sha256"

write_native_pool_policy() {
  for policy_file in native-one-job.init.gradle native-one-job.init.sha256 native-module-policy.jsonl; do
    [[ ! -e "$RUN/$policy_file" && ! -L "$RUN/$policy_file" ]] || { printf 'Native policy output already exists; use a new run.\n' >&2; return 1; }
  done
  cat > "$RUN/native-one-job.init.gradle" <<'GRADLE_NATIVE_POOL' || return $?
import groovy.json.JsonOutput
import groovy.json.JsonSlurper
import java.nio.ByteBuffer
import java.nio.channels.FileChannel
import java.nio.file.StandardOpenOption
import org.gradle.api.Action
import org.gradle.api.GradleException

def receiptPath = System.getProperty('ghaf.nativePolicyReceipt')
def initHash = System.getProperty('ghaf.nativePolicyInitSha')
if (!receiptPath || !(initHash ==~ /[0-9a-f]{64}/)) throw new GradleException('Missing Ghaf native policy receipt path or init identity.')
def receipt = new File(receiptPath)
def allowedRoot = new File('/home/smyk/projects/Ghaf-demo-systems/output/native-build').toPath().toRealPath()
if (!receipt.isAbsolute() || receipt.name != 'native-module-policy.jsonl' ||
    receipt.canonicalFile != receipt.absoluteFile ||
    !receipt.parentFile.toPath().toRealPath().startsWith(allowedRoot) || !receipt.isFile()) {
    throw new GradleException('Native policy receipt must be a prepared regular run file in the granted output boundary.')
}
def record = { Map value ->
    synchronized (receipt.canonicalPath.intern()) {
        FileChannel.open(receipt.toPath(), StandardOpenOption.READ, StandardOpenOption.WRITE).withCloseable { channel ->
            def lock = channel.lock()
            try {
                def header = new JsonSlurper().parseText(receipt.withReader('UTF-8') { it.readLine() })
                if (header.schema_version != 1 || header.policy != 'ninja-shared-pool-v1' || header.init_sha256 != initHash ||
                    !(header.source_commit ==~ /[0-9a-f]{40}/) || !(header.head ==~ /[0-9a-f]{40}/)) {
                    throw new GradleException('Native policy receipt identity mismatch; preserve it for review.')
                }
                if (value != null) {
                    def bytes = ByteBuffer.wrap((JsonOutput.toJson(value) + '\n').getBytes('UTF-8'))
                    channel.position(channel.size())
                    while (bytes.hasRemaining()) channel.write(bytes)
                    channel.force(false)
                }
            } finally { lock.release() }
        }
    }
}
record(null)
def refuse = { String reason ->
    record([status: 'blocked', reason: reason])
    throw new GradleException(reason)
}
def controlled = ~/^CMAKE_JOB_(POOLS|POOL_COMPILE|POOL_LINK)(?::[^=]+)?(?:=.*)?$/
def poolArguments = ['-DCMAKE_JOB_POOLS=ghaf_native=1',
                     '-DCMAKE_JOB_POOL_COMPILE=ghaf_native',
                     '-DCMAKE_JOB_POOL_LINK=ghaf_native']
gradle.beforeProject { p ->
    def androidPluginSeen = false
    ['com.android.application', 'com.android.library'].each { pluginId ->
        p.pluginManager.withPlugin(pluginId) {
            androidPluginSeen = true
            def plugin = p.plugins.findPlugin(pluginId)
            def versionClass = plugin.class.classLoader.loadClass('com.android.Version')
            def version = versionClass.getField('ANDROID_GRADLE_PLUGIN_VERSION').get(null)
            def origin = plugin.class.protectionDomain.codeSource?.location?.toString()
            if (!(version instanceof String) || !version.trim() || !origin) refuse('Missing actual Android plugin identity: ' + p.path)
            def identity = [build_root: p.rootDir.canonicalPath, module: p.path, plugin: pluginId, plugin_class: plugin.class.name,
                            agp_version: version, plugin_code_source: origin]
            p.extensions.getByName('androidComponents').finalizeDsl({ dsl ->
                if (dsl.externalNativeBuild.ndkBuild.path != null) refuse('Uncovered ndk-build module: ' + p.path)
                if (dsl.externalNativeBuild.cmake.path == null) {
                    record(identity + [status: 'skipped', reason: 'no CMake project'])
                    return
                }
                def scopes = [[name: 'defaultConfig', value: dsl.defaultConfig]]
                dsl.buildTypes.each { scopes.add([name: 'buildType:' + it.name, value: it]) }
                dsl.productFlavors.each { scopes.add([name: 'flavor:' + it.name, value: it]) }
                scopes.each { scope ->
                    def args = scope.value.externalNativeBuild.cmake.arguments.collect { it.toString() }
                    args.eachWithIndex { arg, i ->
                        def definition = arg.startsWith('-D') ? arg.substring(2) : (i > 0 && args[i - 1] == '-D' ? arg : '')
                        if (definition ==~ controlled) refuse('Conflicting native pool argument in ' + p.path + '/' + scope.name)
                    }
                }
                dsl.defaultConfig.externalNativeBuild.cmake.arguments.addAll(poolArguments)
                record(identity + [status: 'selected', cmake_path: p.file(dsl.externalNativeBuild.cmake.path).canonicalPath,
                                   requested_arguments: poolArguments])
                p.logger.lifecycle('GHAF requested native pool=ghaf_native depth=1 module=' + p.path)
            } as Action)
        }
    }
    p.afterEvaluate {
        if (!androidPluginSeen) record([build_root: p.rootDir.canonicalPath, module: p.path, status: 'skipped', reason: 'not an Android application/library project'])
    }
}
GRADLE_NATIVE_POOL
  sha256sum "$RUN/native-one-job.init.gradle" > "$RUN/native-one-job.init.sha256" || return $?
  read -r NATIVE_POOL_SHA _ < "$RUN/native-one-job.init.sha256" || return $?
  python3 - "$RUN" "$SOURCE_COMMIT" "$EXPECTED_HEAD" "$NATIVE_POOL_SHA" <<'PY_POOL_RECEIPT' || return $?
import json, pathlib, sys
run, source, head, init_hash = pathlib.Path(sys.argv[1]), *sys.argv[2:]
header = {'schema_version': 1, 'policy': 'ninja-shared-pool-v1', 'init_sha256': init_hash,
          'source_commit': source, 'head': head, 'pool': 'ghaf_native', 'depth': 1,
          'coverage': 'PENDING: inspect generated edges and actual compiler processes'}
with (run / 'native-module-policy.jsonl').open('x') as receipt:
    receipt.write(json.dumps(header) + '\n')
PY_POOL_RECEIPT
  printf 'native_parallel_policy=ninja-shared-pool-v1\nnative_pool_graph_acceptance=PENDING\n' >> "$RUN/receipt.txt" || return $?
  cat "$RUN/native-one-job.init.sha256" >> "$RUN/receipt.txt"
}
step native-pool-policy write_native_pool_policy

native_configuration_tasks() {
  local module abi
  local modules=()
  case "$NATIVE_CONFIGURE_STAGE" in
    worklets) modules=(react-native-worklets) ;;
    remaining) modules=(app expo-modules-core react-native-gesture-handler react-native-screens) ;;
    *) printf 'Unsupported native configuration stage.\n' >&2; return 1 ;;
  esac
  NATIVE_TASKS=()
  for module in "${modules[@]}"; do
    for abi in arm64-v8a armeabi-v7a x86 x86_64; do
      NATIVE_TASKS+=(":$module:configureCMakeRelWithDebInfo[$abi]")
    done
  done
}

gradle_arguments() {
  GRADLE_ARGS=(:app:assembleRelease)
  case "$MODE" in
    build) ;;
    manifest) GRADLE_ARGS=(:app:processReleaseMainManifest) ;;
    graph) GRADLE_ARGS+=(--task-graph --console=plain) ;;
    configure) native_configuration_tasks || return $?; GRADLE_ARGS=("${NATIVE_TASKS[@]}") ;;
    *) printf 'Unsupported Gradle execution mode.\n' >&2; return 1 ;;
  esac
  GRADLE_ARGS+=(-Pandroid.cmakeVersion=3.30.5 -Pandroid.builder.sdkDownload=false
    --init-script "$RUN/native-one-job.init.gradle" "-Dghaf.nativePolicyReceipt=$RUN/native-module-policy.jsonl"
    "-Dghaf.nativePolicyInitSha=$NATIVE_POOL_SHA"
    --no-daemon --no-parallel --max-workers=1
    -Pkotlin.compiler.execution.strategy=in-process
    "-Dorg.gradle.jvmargs=-Xmx1536m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8 -Djava.io.tmpdir=$CACHE/tmp")
}
gradle_arguments
step gradle-command python3 - "$RUN" "${GRADLE_ARGS[@]}" <<'PY_GRADLE_COMMAND'
import json, pathlib, sys
with (pathlib.Path(sys.argv[1]) / 'gradle-arguments.json').open('x') as receipt:
    json.dump({'schema_version': 1, 'argv': sys.argv[2:]}, receipt, indent=2)
    receipt.write('\n')
PY_GRADLE_COMMAND

verify_task_graph() {
  python3 - "$1" "$RUN" "$SOURCE_COMMIT" "$EXPECTED_HEAD" "$NATIVE_POOL_SHA" <<'PY_TASK_GRAPH'
import hashlib, json, pathlib, re, sys
log, run = map(pathlib.Path, sys.argv[1:3])
def refuse(reason):
    sys.exit('BLOCKED: task graph evidence ' + reason + '; retain the complete run for review.')
command = json.loads((run / 'gradle-arguments.json').read_text())
args = command.get('argv')
task = ':app:assembleRelease'
if (command.get('schema_version') != 1 or not isinstance(args, list) or not args or
    any(not isinstance(arg, str) or not arg for arg in args) or args[0] != task or
    args.count('--task-graph') != 1 or args.count('--console=plain') != 1 or
    any(arg in ('--dry-run', '-m') or arg.startswith('--dry-run=') for arg in args) or
    [arg for arg in args if not arg.startswith(('-', '/'))] != [task]):
    refuse('has an unexpected command vector')
if not log.is_file() or log.is_symlink() or log.resolve() != log or log.parent != run:
    refuse('log is not a retained regular file in this run')
raw = log.read_bytes()
if b'\x00' in raw:
    refuse('contains interrupted/NUL log data')
lines = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', raw.decode('utf-8')).splitlines()
headers = [i for i, line in enumerate(lines) if line.startswith('Tasks graph for:')]
nodes = [i for i, line in enumerate(lines) if re.fullmatch(r'[ |+\\`-]*:app:assembleRelease(?: \(org\.gradle\.api\.Task\))?(?: \(\*\))?', line)]
success = [i for i, line in enumerate(lines) if re.fullmatch(r'BUILD SUCCESSFUL(?: in .+)?', line)]
if (len(headers) != 1 or lines[headers[0]] != 'Tasks graph for: ' + task or
    not any(i > headers[0] for i in nodes) or not success or
    success[-1] <= max(nodes, default=-1) or any('BUILD FAILED' in line for line in lines)):
    refuse('lacks one complete expected root graph and successful terminal result')
setup = []
allowed = (':gradle-plugin:', ':expo-gradle-plugin:', ':expo-module-gradle-plugin:')
for line in lines:
    if not line.startswith('> Task '):
        continue
    match = re.fullmatch(r'> Task (\S+)(?: (.*))?', line)
    if not match or not match[1].startswith(allowed):
        refuse('contains an unapproved application/native task execution record')
    setup.append({'task': match[1], 'status': match[2] or 'no status suffix'})
receipt = {'schema_version': 1, 'mode': 'graph', 'status': 'GRAPH_RENDERED',
           'source_commit': sys.argv[3], 'head': sys.argv[4], 'init_sha256': sys.argv[5],
           'argv': args, 'task': task, 'log': str(log), 'log_sha256': hashlib.sha256(raw).hexdigest(),
           'setup_tasks': setup, 'configuration_side_effects': 'Permitted setup actions may execute; this is post-run output verification.',
           'native_pool_coverage': 'NOT RUN', 'apk_acceptance': 'NOT RUN', 'device_acceptance': 'NOT RUN'}
with (run / 'graph-review.json').open('x') as output:
    output.write(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
PY_TASK_GRAPH
}

record_native_configure_stage() {
  native_configuration_tasks || return $?
  python3 - "$1" "$RUN" "$SOURCE_COMMIT" "$EXPECTED_HEAD" "$NATIVE_CONFIGURE_STAGE" "${NATIVE_TASKS[@]}" <<'PY_CONFIGURE_STAGE'
import hashlib, json, pathlib, re, sys
log, run = map(pathlib.Path, sys.argv[1:3])
tasks = sys.argv[6:]
args = json.loads((run / 'gradle-arguments.json').read_text())
argv = args.get('argv')
if (args.get('schema_version') != 1 or not isinstance(argv, list) or not tasks or
    any(not isinstance(a, str) or not a for a in argv) or argv[:len(tasks)] != tasks or
    [a for a in argv if not a.startswith(('-', '/'))] != tasks or
    any(a in ('--task-graph', '--dry-run', '-m') or a.startswith('--dry-run=') for a in argv)):
    sys.exit('BLOCKED: native configure command differs from its fixed stage targets.')
if not log.is_file() or log.is_symlink() or log.resolve() != log or log.parent != run:
    sys.exit('BLOCKED: native configure log must be a retained regular file in this run.')
raw = log.read_bytes()
lines = re.sub(r'\x1b\[[0-?]*[ -/]*[@-~]', '', raw.decode('utf-8')).splitlines()
if b'\x00' in raw or not any(re.fullmatch(r'BUILD SUCCESSFUL(?: in .+)?', line) for line in lines) or any('BUILD FAILED' in line for line in lines):
    sys.exit('BLOCKED: native configure log lacks a complete successful terminal result.')
receipt = {'schema_version': 1, 'stage': sys.argv[5], 'status': 'CONFIGURE_STAGE_COMPLETED',
           'source_commit': sys.argv[3], 'head': sys.argv[4], 'requested_tasks': tasks, 'argv': argv,
           'log': str(log), 'log_sha256': hashlib.sha256(raw).hexdigest(),
           'scope': 'Fixed release CMake configuration targets, not APK assembly.',
           'compilation': 'CMake probes may compile; remaining also compiles Worklets through prefab dependencies.',
           'generated_pool_coverage': 'PENDING separate graph/edge review',
           'apk_acceptance': 'NOT RUN', 'device_acceptance': 'NOT RUN'}
with (run / 'native-configure-review.json').open('x') as output:
    output.write(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
PY_CONFIGURE_STAGE
}

resource_sample() {
  python3 - "$ROOT" "$RUN" <<'PYRESOURCE'
import datetime, json, pathlib, re, shutil, sys

def evaluate_sample(sample, previous):
    fields = ('total_kib', 'available_kib', 'swap_total_kib', 'swap_free_kib',
              'swap_in_pages', 'swap_out_pages', 'disk_free_bytes')
    if not isinstance(sample, dict) or any(type(sample.get(k)) is not int or sample[k] < 0 for k in fields):
        raise ValueError('Missing or invalid essential resource measurement')
    if sample['total_kib'] == 0 or sample['available_kib'] > sample['total_kib'] or sample['swap_free_kib'] > sample['swap_total_kib']:
        raise ValueError('Inconsistent essential resource measurement')
    if previous is not None and (not isinstance(previous, dict) or any(type(previous.get(k)) is not int or previous[k] < 0 for k in ('swap_in_pages', 'swap_out_pages', 'paging_streak'))):
        raise ValueError('Invalid prior resource measurement')
    delta_in = 0 if previous is None else sample['swap_in_pages'] - previous['swap_in_pages']
    delta_out = 0 if previous is None else sample['swap_out_pages'] - previous['swap_out_pages']
    if delta_in < 0 or delta_out < 0:
        raise ValueError('Resource counters decreased during the run')
    correlated = delta_in + delta_out > 1024 and sample['available_kib'] * 100 < sample['total_kib'] * 30
    streak = (0 if previous is None else previous['paging_streak']) + 1 if correlated else 0
    state = {'swap_in_pages': sample['swap_in_pages'], 'swap_out_pages': sample['swap_out_pages'],
             'swap_in_pages_delta': delta_in, 'swap_out_pages_delta': delta_out,
             'swap_pages_delta': delta_in + delta_out, 'paging_streak': streak}
    reason = None
    if sample['available_kib'] * 100 < sample['total_kib'] * 15:
        reason = 'critical_memory'
    elif sample['disk_free_bytes'] < 5 * 1024**3:
        reason = 'critical_disk'
    elif streak >= 3:
        reason = 'sustained_paging'
    return state, reason

def read_sample(root):
    names = {'MemTotal': 'total_kib', 'MemAvailable': 'available_kib',
             'SwapTotal': 'swap_total_kib', 'SwapFree': 'swap_free_kib'}
    sample = {}
    for line in pathlib.Path('/proc/meminfo').read_text().splitlines():
        match = re.fullmatch(r'(MemTotal|MemAvailable|SwapTotal|SwapFree):\s+(\d+)\s+kB', line)
        if match:
            sample[names[match[1]]] = int(match[2])
    for line in pathlib.Path('/proc/vmstat').read_text().splitlines():
        match = re.fullmatch(r'(pswpin|pswpout)\s+(\d+)', line)
        if match:
            sample['swap_in_pages' if match[1] == 'pswpin' else 'swap_out_pages'] = int(match[2])
    sample['disk_free_bytes'] = shutil.disk_usage(root).free
    return sample

def read_psi():
    try:
        text = pathlib.Path('/proc/pressure/memory').read_text().strip()
        return text if text else 'unavailable: empty memory PSI'
    except (OSError, UnicodeError):
        return 'unavailable: memory PSI could not be read'

def main(root, run):
    entry = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'resource_policy': 'memory-correlated-paging-v2',
             'memory_psi': read_psi()}
    status = 1
    try:
        sample = read_sample(root)
        state_path = run / 'resource-state.json'
        previous = None
        if state_path.exists():
            previous = json.loads(state_path.read_text())
            if not isinstance(previous, dict):
                raise ValueError('Invalid prior resource measurement')
        elif (run / 'resources.log').exists():
            raise ValueError('Prior resource measurement disappeared during the run')
        state, reason = evaluate_sample(sample, previous)
        entry.update(sample)
        entry.update(state)
        entry.update({'available_percent': round(sample['available_kib'] * 100 / sample['total_kib'], 3),
                      'swap_used_kib': sample['swap_total_kib'] - sample['swap_free_kib'],
                      'counter_baseline': previous is None, 'stop_reason': reason})
        state_path.write_text(json.dumps(state) + '\n')
        status = 75 if reason else 0
    except (OSError, ValueError, TypeError) as error:
        entry.update({'stop_reason': 'measurement_invalid', 'detail': str(error)})
    with (run / 'resources.log').open('a') as log:
        log.write(json.dumps(entry) + '\n')
    if status:
        print('Resource stop: ' + str(entry['stop_reason']) + '; recorded owned descendants only.', file=sys.stderr)
    return status

if __name__ == '__main__':
    sys.exit(main(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])))
PYRESOURCE
}

compile() {
  local status=0
  local cpu_set
  cpu_set=$(python3 -c 'import os; print(",".join(map(str, sorted(os.sched_getaffinity(0))[:2])))') || return $?
  printf 'build_cpu_affinity=%s\n' "$cpu_set" >> "$RUN/receipt.txt"
  (
    cd "$ROOT/android"
    exec setsid taskset -c "$cpu_set" "${CHILD_ENV[@]}" ./gradlew "${GRADLE_ARGS[@]}"
  ) &
  CHILD_PID=$!
  printf 'owned_process_root=%s\n' "$CHILD_PID" >> "$RUN/receipt.txt"
  owned_processes capture || return $?
  while kill -0 "$CHILD_PID" 2>/dev/null; do
    owned_processes capture || return $?
    if resource_sample; then
      :
    else
      status=$?
      owned_processes capture || return $?
      owned_processes stop || return $?
      wait "$CHILD_PID" || true
      CHILD_PID=
      return "$status"
    fi
    sleep 5
  done
  wait "$CHILD_PID" || status=$?
  local cleanup_status=0
  owned_processes stop || cleanup_status=$?
  printf 'gradle_exit=%s cleanup_exit=%s\n' "$status" "$cleanup_status" >> "$RUN/receipt.txt"
  if [[ "$cleanup_status" != 0 ]]; then
    [[ "$status" != 0 ]] || status=$cleanup_status
    return "$status"
  fi
  CHILD_PID=
  return "$status"
}
step native-pool-identity sha256sum --check "$RUN/native-one-job.init.sha256"
step resource-before-compile resource_check
step "gradle-$MODE" compile
GRADLE_LOG=$LAST_LOG
step after-compile-pool-identity sha256sum --check "$RUN/native-one-job.init.sha256"
step after-compile-inputs check_inputs
step after-compile-native generation_identity verify
if [[ "$MODE" == graph ]]; then
  step task-graph-review verify_task_graph "$GRADLE_LOG"
  printf 'TASK GRAPH RENDERED FOR A REVIEW. Configuration/setup work recorded; native pool coverage, APK and device validation NOT RUN.\n' | tee -a "$RUN/receipt.txt"
  exit 0
fi
if [[ "$MODE" == configure ]]; then
  step native-configure-review record_native_configure_stage "$GRADLE_LOG"
  printf 'NATIVE CONFIGURE STAGE COMPLETED. Transitive compilation may occur; generated pool coverage requires review. APK and device validation NOT RUN.\n' | tee -a "$RUN/receipt.txt"
  exit 0
fi
if [[ "$MODE" == manifest ]]; then
  step merged-manifest-review python3 - "$ROOT" "$RUN" "$SOURCE_COMMIT" "$ENTRY_MODE" <<'PYMANIFEST'
import hashlib, json, pathlib, shutil, sys, xml.etree.ElementTree as ET
root, run = map(pathlib.Path, sys.argv[1:3])
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
           'source_commit': sys.argv[3], 'requested_entry_mode': sys.argv[4],
           'entry_mode_evidence': 'build input only; manifest does not establish JS entry behavior',
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
step verify-artifact python3 - "$APK" "$RUN/template-cert.der" "$SIGNATURE_LOG" "$BADGING_LOG" "$PERMISSIONS_LOG" "$MANIFEST_LOG" "$CONFIG_LOG" "$SOURCE_COMMIT" "$ENTRY_MODE" <<'PY'
import hashlib, json, pathlib, re, sys, zipfile
apk, cert, signature, badging, permissions, manifest, config = map(pathlib.Path, sys.argv[1:8])
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
    bundles = [i for i in entries if i.filename == 'assets/index.android.bundle']
    if len(bundles) != 1 or bundles[0].file_size <= 0: reject('APK must have exactly one nonempty bundled JavaScript/Hermes payload.')
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
                 'source_commit': sys.argv[8], 'requested_entry_mode': sys.argv[9],
                 'EXPO_PUBLIC_GHAF_DEMO_ENTRY': 'true' if sys.argv[9] == 'demo' else 'false',
                 'bundle_sha256': hashlib.sha256(archive.read(bundles[0])).hexdigest(),
                 'entry_mode_acceptance': 'NOT RUN; verify selected entry on this exact APK',
                 'abis': abis, 'permissions': sorted(actual_permissions), 'certificate_sha256': expected_cert, 'apk_sha256': hashlib.sha256(apk.read_bytes()).hexdigest(),
                 'assets': [{'path': i.filename, 'bytes': i.file_size} for i in assets]}
    (apk.parent / 'artifact.json').write_text(json.dumps(inventory, indent=2) + '\n')
print('internal_signed_standalone_artifact=PASSED; device/human acceptance NOT RUN')
PY
printf 'INTERNAL REHEARSAL APK VERIFIED: %s\nTemplate debug signing only; device/human acceptance NOT RUN.\n' "$APK" | tee -a "$RUN/receipt.txt"
