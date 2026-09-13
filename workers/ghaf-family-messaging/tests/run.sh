#!/usr/bin/env bash
set -euo pipefail

# Requires the coordinator's serialized test slot. This never uses the existing 5432 database.
fm_root="$(cd "$(dirname "$0")/../../.." && pwd)"
fm_bin="${FM_PG_BIN:-/usr/lib/postgresql/16/bin}"
fm_out="$fm_root/output/competition-readiness/family-messaging-017-20260913/backend"
fm_run_root="${FM_RUN_ROOT:-$fm_out}"
mkdir -p "$fm_run_root"
fm_run="$(mktemp -d "$fm_run_root/run-XXXXXXXX")"
chmod 700 "$fm_run"
fm_running=false
cleanup() {
  if "$fm_running"; then
    "$fm_bin/pg_ctl" -D "$fm_run/data" -m fast -w stop >>"$fm_run/lifecycle.log" 2>&1
  fi
}
trap cleanup EXIT
"$fm_bin/initdb" -D "$fm_run/data" --encoding=UTF8 --locale=C.UTF-8 --auth-local=trust --auth-host=trust >"$fm_run/initdb.log" 2>&1
cat >>"$fm_run/data/postgresql.conf" <<'CONFIG'
listen_addresses = '127.0.0.1'
port = 55432
unix_socket_directories = ''
shared_buffers = '16MB'
max_connections = 12
max_worker_processes = 0
logging_collector = off
log_statement = 'none'
log_min_error_statement = 'panic'
CONFIG
"$fm_bin/pg_ctl" -D "$fm_run/data" -l "$fm_run/postgres.log" -w start >"$fm_run/lifecycle.log" 2>&1
fm_running=true
printf 'Isolated PostgreSQL PID %s; port 55432; evidence %s\n' "$(head -n 1 "$fm_run/data/postmaster.pid")" "$fm_run"
export FM_TEST_PSQL="$fm_bin/psql"
export PGHOST=127.0.0.1 PGPORT=55432 PGDATABASE=postgres PGUSER="$(id -un)"
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 -f "$fm_root/workers/ghaf-family-messaging/tests/auth-fixture.sql" >"$fm_run/schema.log" 2>&1
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 -f "$fm_root/workers/ghaf-family-messaging/migrations/001_family_messaging.sql" >>"$fm_run/schema.log" 2>&1
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 -f "$fm_root/workers/ghaf-family-messaging/tests/fixtures.sql" >>"$fm_run/schema.log" 2>&1
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 >>"$fm_run/schema.log" 2>&1 <<'UPGRADE'
insert into fm_private.messages(id, thread_id, sender_id, body, sequence, client_key) values
  ('70000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-000000000001', 'Preserved upgrade message', 1,
   '60000000-0000-4000-8000-000000000001');
update fm_private.threads set next_sequence = 2 where id = '40000000-0000-4000-8000-000000000001';
UPGRADE
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 -f "$fm_root/workers/ghaf-family-messaging/migrations/002_peer_threads.sql" >>"$fm_run/schema.log" 2>&1
"$fm_bin/psql" -X -q -v ON_ERROR_STOP=1 -f "$fm_root/workers/ghaf-family-messaging/tests/upgrade-check.sql" >>"$fm_run/schema.log" 2>&1
python3 "$fm_root/workers/ghaf-family-messaging/tests/test_rpc.py" 2>&1 | tee "$fm_run/tests.log"
python3 "$fm_root/workers/ghaf-family-messaging/tests/test_peers.py" 2>&1 | tee "$fm_run/peer-tests.log"
printf 'PASSED isolated SQL; real provider Auth, PostgREST HTTP, hosted retention and two-device delivery NOT RUN\n' | tee "$fm_run/result.txt"
