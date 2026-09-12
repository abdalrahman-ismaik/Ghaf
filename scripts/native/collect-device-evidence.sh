#!/usr/bin/env bash
# Read-only APK/device metadata; never an installation or native acceptance pass.
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  while IFS= read -r help_line; do printf '%s\n' "$help_line"; done <<'HELP'
Usage: collect-device-evidence.sh --apk ABSOLUTE_APK --serial OBSERVED_SERIAL
       --sha256 A_PUBLISHED_SHA256 --source-candidate FULL_GIT_SHA --build-id BUILD_ID
       [--preflight]

All five identity arguments are required. No artifact or phone is auto-selected.
--preflight validates host tools and APK only; it executes no adb command.
Default additionally inspects the explicitly targeted, already installed package.

Prerequisites: Python 3.10+, trusted adb, aapt and apksigner on PATH (Android SDK).
The approved package is ae.ac.ku.ghaf.prototype. Use A's published APK hash/build
receipt; the supplied source/build labels are attribution, not provenance proof.
Output: fresh mode-0700 directory under this checkout's output/native-acceptance/,
containing mode-0600 evidence.json. Serials remain in that ignored local boundary.
Do not publish the raw receipt without reviewing/redacting local identifiers.

No install, uninstall, data clearing, launch, force-stop, reconnect, settings,
permission acceptance, media, screenshot, broad properties or logcat commands.
An existing local adb server is required; this script does not start one.
Device/USB access must already be authorized by its actual owner.

Exit: 0 metadata collection only; 2 invalid invocation; 3 BLOCKED prerequisite,
transport or unavailable value; 4 FAILED identity/configuration mismatch;
130 interrupted. A zero exit is never a UI, signing-release or human acceptance.
HELP
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo 'BLOCKED: Python 3.10+ is required. Ask the environment owner to provide it; nothing was inspected.' >&2
  exit 3
fi

exec python3 - "${BASH_SOURCE[0]}" "$@" <<'PY'
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import subprocess
import struct
import time
import sys
import tempfile
from datetime import datetime, timezone
import zipfile

PACKAGE = "ae.ac.ku.ghaf.prototype"
SCRIPT = Path(sys.argv[1]).resolve()
parser = argparse.ArgumentParser(description="Read-only, explicit-target Ghaf metadata collector.")
parser.add_argument("--apk", required=True)
parser.add_argument("--serial", required=True)
parser.add_argument("--sha256", required=True)
parser.add_argument("--source-candidate", required=True)
parser.add_argument("--build-id", required=True)
parser.add_argument("--preflight", action="store_true", help="Host/APK only; no adb commands.")
args = parser.parse_args(sys.argv[2:])
if sys.version_info < (3, 10):
    parser.exit(3, "BLOCKED: Python 3.10+ is required.\n")
if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._:\[\]-]{0,199}", args.serial):
    parser.error("--serial must be one explicit transport identifier without whitespace or shell syntax")
if not re.fullmatch(r"[0-9a-fA-F]{64}", args.sha256):
    parser.error("--sha256 must be A's full 64-character hexadecimal APK digest")
if not re.fullmatch(r"[0-9a-fA-F]{40}", args.source_candidate):
    parser.error("--source-candidate must be A's full 40-character commit identity")
if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]{0,119}", args.build_id):
    parser.error("--build-id must be A's bounded build label (letters, digits, dot, underscore, hyphen)")
if not Path(args.apk).is_absolute() or Path(args.apk).suffix.lower() != ".apk":
    parser.error("--apk must be an explicit absolute .apk path (not an AAB or JS export)")


def utc():
    return datetime.now(timezone.utc).isoformat()


class Stop(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def require(condition, message, status="BLOCKED"):
    if not condition:
        raise Stop(status, message)


os.umask(0o077)
root = SCRIPT.parents[2]
try:
    output = root
    for component in ("output", "native-acceptance"):
        output = output / component
        if output.is_symlink():
            raise OSError("Evidence boundary cannot contain a symlink")
        output.mkdir(mode=0o700, exist_ok=True)
        if not output.is_dir() or output.resolve().parent != output.parent.resolve():
            raise OSError("Evidence boundary is not an ordinary local directory")
    run_dir = Path(tempfile.mkdtemp(prefix=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ-"), dir=output))
except OSError:
    parser.exit(3, "BLOCKED: cannot create a fresh private directory in this checkout's output/native-acceptance/. Check ownership and symlinks.\n")

receipt = {
    "schema": "ghaf.native-metadata.v1",
    "started_utc": utc(),
    "collector_pid": os.getpid(),
    "collector_path": str(SCRIPT),
    "collector_sha256": hashlib.sha256(SCRIPT.read_bytes()).hexdigest(),
    "artifact_directory": str(run_dir),
    "source_candidate": args.source_candidate.lower(),
    "build_id": args.build_id,
    "provenance": "Operator-supplied A receipt identifiers; not independently proven by this script.",
    "mode": "host_preflight" if args.preflight else "installed_metadata",
    "apk_path": str(Path(args.apk).resolve()),
    "expected_sha256": args.sha256.lower(),
    "target_package": PACKAGE,
    "serial": args.serial,
    "tools": {"python": {"path": sys.executable, "version": sys.version.split()[0]}},
    "commands": [],
    "checks": [],
    "apk": {},
    "device_collection": "NOT RUN",
    "device": {},
    "installed": {},
    "acceptance": {
        "native_journey": "NOT RUN",
        "installed_apk_hash_and_certificate": "NOT RUN",
        "metro_independent_cold_launch": "NOT RUN",
        "human_review_and_rehearsal": "NOT RUN",
        "public_distribution_signing": "NOT RUN",
    },
}
phase = "host_prerequisites"


def passed(name, value):
    receipt["checks"].append({"name": name, "status": "PASSED", "value": value, "utc": utc()})


def command(argv, *, device=False):
    entry = {"argv": argv, "started_utc": utc(), "phase": phase}
    receipt["commands"].append(entry)
    env = os.environ.copy()
    env["LC_ALL"] = "C"
    env["LANG"] = "C"
    # Prevent inherited adb tracing/remote-server overrides from widening collection.
    for key in ("ADB_TRACE", "ADB_SERVER_SOCKET", "ANDROID_ADB_SERVER_ADDRESS", "ANDROID_ADB_SERVER_PORT", "ANDROID_SERIAL"):
        env.pop(key, None)
    process = None
    try:
        process = subprocess.Popen(argv, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                                   text=True, encoding="utf-8", errors="replace", env=env, start_new_session=True)
        entry["pid"] = process.pid
        stdout, stderr = process.communicate(timeout=30)
        entry["exit_code"] = process.returncode
    except (subprocess.TimeoutExpired, KeyboardInterrupt) as error:
        if process is not None:
            os.killpg(process.pid, signal.SIGKILL)
            process.communicate()
        entry["exit_code"] = process.returncode if process is not None else None
        entry["status"] = "BLOCKED"
        if isinstance(error, KeyboardInterrupt):
            raise
        raise Stop("BLOCKED", "Command exceeded 30 seconds; inspect prerequisites before retrying.")
    except OSError:
        entry["exit_code"] = None
        entry["status"] = "BLOCKED"
        raise Stop("BLOCKED", "Could not execute a required tool. Check its executable/runtime dependencies.")
    finally:
        entry["finished_utc"] = utc()
    entry["stdout_characters"] = len(stdout)
    entry["stderr_characters"] = len(stderr)
    entry["error_categories"] = [label for label in ("unauthorized", "offline", "more than one", "not found", "no devices") if label in stderr.lower()]
    entry["status"] = "PASSED" if process.returncode == 0 and stdout.strip() else "BLOCKED"
    # Raw stderr/dumpsys are not persisted; only parsed allowlisted values enter the receipt.
    require(process.returncode == 0, "Target command failed. See its exit code/error categories; resolve tool or owner-authorized transport access without reconnect/reset.")
    require(bool(stdout.strip()), "Command returned no required value. Empty success is not evidence.")
    if device:
        require(not entry["error_categories"], "Transport reported an error despite a successful exit; owner must resolve access.")
    return stdout.strip()


def device_query(request, *, shell=False):
    # Direct smart-socket requests cannot invoke the adb client's server-restart branch.
    allowed = {"host:version", f"host-serial:{args.serial}:get-state", f"host-serial:{args.serial}:get-serialno"}
    shell_allowed = {f"pm path {PACKAGE}", f"dumpsys package {PACKAGE}"} | {
        f"getprop {prop}" for prop in ("ro.product.model", "ro.build.version.release", "ro.build.version.sdk", "ro.product.cpu.abilist")}
    require(request in (shell_allowed if shell else allowed), "Internal command is outside the collection allowlist.")
    wire = [f"host:transport:{args.serial}", f"shell,v2,raw:{request}"] if shell else [request]
    entry = {"transport": "existing_loopback_adb_smart_socket", "address": "127.0.0.1:5037", "wire_requests": wire,
             "started_utc": utc(), "phase": phase, "pid": os.getpid(), "exit_code": None, "status": "BLOCKED"}
    receipt["commands"].append(entry)
    deadline = time.monotonic() + 30
    total = 0
    try:
        with socket.create_connection(("127.0.0.1", 5037), timeout=2) as connection:
            def read_exact(size):
                nonlocal total
                require(0 <= size <= 1024 * 1024 and total + size <= 1024 * 1024, "ADB response exceeds the narrow collection limit.")
                result = bytearray()
                while len(result) < size:
                    remaining = deadline - time.monotonic()
                    require(remaining > 0, "ADB read exceeded 30 seconds; no reconnect attempted.")
                    connection.settimeout(remaining)
                    chunk = connection.recv(size - len(result))
                    require(bool(chunk), "ADB connection closed before complete status/exit evidence.")
                    result.extend(chunk)
                total += size
                return bytes(result)

            def read_string():
                length = read_exact(4)
                require(bool(re.fullmatch(rb"[0-9a-fA-F]{4}", length)), "Malformed ADB response length.")
                return read_exact(int(length, 16))

            def send(service):
                payload = service.encode("utf-8")
                connection.sendall(f"{len(payload):04x}".encode("ascii") + payload)
                status = read_exact(4)
                entry["protocol_status"] = status.decode("ascii", errors="replace")
                if status == b"FAIL":
                    error = read_string().decode("utf-8", errors="replace").lower()
                    entry["error_categories"] = [label for label in ("unauthorized", "offline", "more than one", "not found", "no devices") if label in error]
                    raise Stop("BLOCKED", "ADB rejected the exact request; see error categories. Owner must resolve access; no restart/reconnect attempted.")
                require(status == b"OKAY", "Unexpected ADB protocol response; server left unchanged.")

            for service in wire:
                send(service)
            if not shell:
                stdout = read_string().decode("utf-8", errors="replace")
                connection.settimeout(max(0.001, deadline - time.monotonic()))
                require(connection.recv(1) == b"", "Trailing host-query bytes; no transport identity claimed.")
                stderr = ""
            else:
                connection.sendall(struct.pack("<BI", 4, 0))
                out, err = bytearray(), bytearray()
                while True:
                    channel, size = struct.unpack("<BI", read_exact(5))
                    data = read_exact(size)
                    if channel == 1:
                        out.extend(data)
                    elif channel == 2:
                        err.extend(data)
                    elif channel == 3:
                        require(len(data) == 1, "Malformed shell-v2 exit status; no completion claimed.")
                        entry["exit_code"] = data[0]
                        connection.settimeout(max(0.001, deadline - time.monotonic()))
                        require(connection.recv(1) == b"", "Trailing/duplicate shell-v2 data after exit; no completion claimed.")
                        break
                    else:
                        raise Stop("BLOCKED", "Unexpected shell-v2 frame; no completion claimed.")
                stdout, stderr = out.decode("utf-8", errors="replace"), err.decode("utf-8", errors="replace")
                require(entry["exit_code"] == 0, "Target read-only shell command failed; see preserved exit code.")
            entry["stdout_characters"], entry["stderr_characters"] = len(stdout), len(stderr)
            require(bool(stdout.strip()), "ADB command returned no required value; empty success is not evidence.")
            require(not stderr.strip(), "ADB shell emitted an unexpected diagnostic; inspect narrowly with its owner.")
            entry["status"] = "PASSED"
            return stdout.strip()
    except OSError:
        raise Stop("BLOCKED", "Existing local adb service unavailable/interrupted. Owner must prepare transport; no server start/reconnect attempted.")
    finally:
        entry["finished_utc"] = utc()


def digest(path):
    value = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


try:
    for name in ("adb", "aapt", "apksigner"):
        tool = shutil.which(name)
        require(tool is not None, f"Missing {name}. Ask B/A for the verified SDK tool path; add its existing bin directory to PATH. This collector installs nothing.")
        receipt["tools"][name] = {"path": str(Path(tool).resolve())}
    apk = Path(receipt["apk_path"])
    require(apk.is_file(), "APK is absent or not a regular readable file. Obtain A's exact published APK and digest.")
    actual_hash = digest(apk)
    receipt["apk"]["sha256"] = actual_hash
    require(actual_hash == args.sha256.lower(), "APK SHA-256 does not match A's published digest. Stop; do not install.", "FAILED")
    passed("apk_sha256_matches_published", actual_hash)
    require(zipfile.is_zipfile(apk), "File is not an APK ZIP container.", "FAILED")
    with zipfile.ZipFile(apk) as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)), "APK has duplicate ZIP names; independent review required.", "FAILED")
        for required in ("AndroidManifest.xml", "classes.dex", "assets/index.android.bundle"):
            require(required in names and archive.getinfo(required).file_size > 0, f"Missing/empty {required}; not the expected bundled Ghaf APK.", "FAILED")
        abis = sorted({name.split("/")[1] for name in names if re.fullmatch(r"lib/[A-Za-z0-9_-]+/[^/]+\.so", name)})
        require(bool(abis), "No native library ABI found; inspect the artifact independently.")
        receipt["apk"].update({"abis": abis, "embedded_js_bytes": archive.getinfo("assets/index.android.bundle").file_size,
                               "asset_count": sum(name.startswith("assets/") and not name.endswith("/") for name in names)})
    phase = "apk_metadata"
    aapt = receipt["tools"]["aapt"]["path"]
    signer = receipt["tools"]["apksigner"]["path"]
    receipt["tools"]["aapt"]["version"] = command([aapt, "version"])
    receipt["tools"]["apksigner"]["version"] = command([signer, "version"])
    badging = command([aapt, "dump", "badging", str(apk)])
    packages = re.findall(r"^package: (.+)$", badging, re.MULTILINE)
    require(len(packages) == 1, "APK package record missing or ambiguous.")
    fields = dict(re.findall(r"(\w+)='([^']*)'", packages[0]))
    require(fields.get("name") == PACKAGE, "APK package differs from the approved Ghaf package.", "FAILED")
    require(bool(re.fullmatch(r"\d+", fields.get("versionCode", ""))) and bool(fields.get("versionName")), "APK version fields missing or malformed.")
    receipt["apk"].update({key: fields[key] for key in ("name", "versionCode", "versionName")})
    signature = command([signer, "verify", "--verbose", "--print-certs", str(apk)])
    certificates = re.findall(r"^Signer #\d+ certificate SHA-256 digest: ([0-9a-fA-F]{64})$", signature, re.MULTILINE)
    require(bool(certificates), "Signature verification produced no SHA-256 certificate identity.")
    receipt["apk"]["signer_certificate_sha256"] = certificates
    passed("apk_signature_verification", certificates)
    permissions_text = command([aapt, "dump", "permissions", str(apk)])
    permissions = sorted(set(re.findall(r"^uses-permission(?:-sdk-\d+)?: name='([^']+)'", permissions_text, re.MULTILINE)))
    require(f"package: {PACKAGE}" in permissions_text or f"package: name='{PACKAGE}'" in permissions_text, "Permissions output lacks the target package identity.")
    receipt["apk"]["permissions"] = permissions
    prohibited = {"android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE"}
    require(not prohibited.intersection(permissions), "APK contains a shared-storage permission blocked by app.config.ts.", "FAILED")
    manifest = command([aapt, "dump", "xmltree", str(apk), "AndroidManifest.xml"])
    backup = re.findall(r"android:allowBackup(?:\([^)]*\))?=\(type 0x12\)(0x[0-9a-fA-F]+)", manifest)
    require(len(backup) == 1, "Merged allowBackup missing/ambiguous; inspect manifest independently.")
    receipt["apk"]["allowBackup"] = int(backup[0], 16) != 0
    require(not receipt["apk"]["allowBackup"], "Merged APK enables backup contrary to approved configuration.", "FAILED")
    debug = re.findall(r"android:debuggable(?:\([^)]*\))?=\(type 0x12\)(0x[0-9a-fA-F]+)", manifest)
    receipt["apk"]["debuggable_explicit"] = (int(debug[0], 16) != 0) if len(debug) == 1 else "NOT RUN: attribute absent/ambiguous"
    require(digest(apk) == actual_hash, "APK changed during inspection. Obtain an immutable handoff and rerun.", "FAILED")
    passed("host_apk_metadata", "Metadata only; embedded bundle presence does not prove cold/offline operation.")
    if not args.preflight:
        phase = "transport"
        adb = receipt["tools"]["adb"]["path"]
        receipt["tools"]["adb"]["version"] = command([adb, "version"])
        server_version = device_query("host:version")
        require(bool(re.fullmatch(r"[0-9a-fA-F]{4}", server_version)), "Unknown adb server protocol; owner must resolve it.")
        receipt["tools"]["adb"]["server_protocol_hex"] = server_version
        require(device_query(f"host-serial:{args.serial}:get-state") == "device", "Exact transport is not in device state; owner must resolve access.")
        require(device_query(f"host-serial:{args.serial}:get-serialno") == args.serial, "Transport returned a different/ambiguous serial.", "FAILED")
        passed("exact_transport", "Supplied serial matched one ready transport; no selection/enumeration used.")
        phase = "installed_package"
        paths = device_query(f"pm path {PACKAGE}", shell=True).splitlines()
        require(all(re.fullmatch(r"package:/[^\r\n]+\.apk", line) for line in paths), "Target package is absent or returned ambiguous paths; no installation performed.")
        receipt["installed"]["apk_paths"] = [line.removeprefix("package:") for line in paths]
        package_dump = device_query(f"dumpsys package {PACKAGE}", shell=True)
        headers = re.findall(r"^\s*Package \[([^\]]+)\] \([^)]*\):", package_dump, re.MULTILINE)
        codes = re.findall(r"^\s*versionCode=(\d+)\b", package_dump, re.MULTILINE)
        versions = re.findall(r"^\s*versionName=(\S+)\s*$", package_dump, re.MULTILINE)
        require(headers == [PACKAGE] and len(codes) == len(versions) == 1, "Installed target identity missing/ambiguous; raw dumpsys intentionally not saved.")
        receipt["installed"].update({"package": PACKAGE, "versionCode": codes[0], "versionName": versions[0]})
        require(codes[0] == fields["versionCode"] and versions[0] == fields["versionName"], "Installed version differs from the supplied APK. Stop; do not downgrade/uninstall/clear data.", "FAILED")
        phase = "device_metadata"
        for name, prop in (("model", "ro.product.model"), ("os_release", "ro.build.version.release"),
                           ("api_level", "ro.build.version.sdk"), ("abis", "ro.product.cpu.abilist")):
            value = device_query(f"getprop {prop}", shell=True)
            require(len(value) <= 200 and "\n" not in value and "\r" not in value, "Device property is not one bounded identity value.")
            receipt["device"][name] = value
        device_abis = receipt["device"]["abis"].split(",")
        require(bool(set(device_abis).intersection(abis)), "No compatible ABI between observed device and APK.", "FAILED")
        require(receipt["device"]["api_level"].isdigit(), "Device API level is not numeric.")
        passed("installed_metadata", "Package/version/ABI compatible only; installed byte hash and certificate still NOT RUN.")
    receipt["collection_status"] = "PASSED"
    receipt["device_collection"] = "NOT RUN" if args.preflight else "PASSED"
    receipt["exit_code"] = 0
except Stop as error:
    receipt["collection_status"] = error.status
    receipt["reason"] = error.message
    receipt["checks"].append({"name": phase, "status": error.status, "reason": error.message, "utc": utc()})
    receipt["exit_code"] = 4 if error.status == "FAILED" else 3
except (OSError, zipfile.BadZipFile, ValueError) as error:
    receipt["collection_status"] = "BLOCKED"
    receipt["reason"] = f"Host inspection unavailable ({type(error).__name__}); check APK readability, tools and evidence directory."
    receipt["exit_code"] = 3
except KeyboardInterrupt:
    receipt["collection_status"] = "BLOCKED"
    receipt["reason"] = "Interrupted; remaining steps NOT RUN."
    receipt["exit_code"] = 130
finally:
    receipt["finished_utc"] = utc()
    target_file = run_dir / "evidence.json"
    try:
        with target_file.open("x", encoding="utf-8") as handle:
            json.dump(receipt, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
    except OSError:
        print("BLOCKED: failed to preserve the evidence receipt; no acceptance may be claimed.", file=sys.stderr)
        sys.exit(3)
    print(f"{receipt['collection_status']}: metadata collection only. Local receipt: {target_file}")
    if "reason" in receipt:
        print(receipt["reason"], file=sys.stderr)
sys.exit(receipt["exit_code"])
PY
