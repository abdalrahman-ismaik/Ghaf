# Release performance evidence

Updated:2026-09-15 Dubai; receipts are dated2026-09-14UTC.
**Historical startup baseline and bounded d13 frame/memory sample measured;
controlled comparison and performance gate NOT PASSED.** No FPS or
lower/mid-range physical-device claim is supported.

## Android baseline method

- Emulator: `Ghaf_API35_ARM64Bridge`, API35, x86_64 with ARM64 bridge;
  `emulator-5554`, isolated Android user11, 720×1600 at320dpi, font scale1.
- Build: standalone internal release-mode APK at `5ad7faa63c90`, version0.1.0/code1;
  88,134,244bytes. Exact hash in the [QA record](release-qa-results.md).
- Dataset: signed out; no private family query or synthetic large-list fixture.
- Host: Windows with16GB RAM shared with other engineering work. Approximately
  2.6–3GB free physical memory near the run; no controlled thermal/CPU isolation.
- Network: normal emulator Wi-Fi after explicit DNS repair. No throttling profile.
- Method: three `am force-stop --user 11` → `am start --user 11 -W` cycles,
  retaining caches; sign-in resource ID verified after each. Recorded19:36UTC.

| Sample | Activity TotalTime | WaitTime |
| ------ | -----------------: | -------: |
| 1      |             5649ms |   5713ms |
| 2      |             3995ms |   4023ms |
| 3      |             4056ms |   4124ms |

Median activity display time: **4056ms**. This is neither authenticated time to
interaction nor a clean-install cold-start benchmark. First secondary-user launch
(15068ms) and the first launch after emulator reboot (8158ms) had different cache/
boot conditions and are excluded from the comparison set.

The candidate must repeat this method on the same isolated user/device/configuration
before an improvement is claimed. A build alone cannot close this comparison.
The later YAML parser patch is build-tool hardening, not an app startup optimization.

## d13 paired-Child navigation sample

Root measured the fresh standalone `d13c148e09ddd64c5cd17c8f784c21f7c5396f72`
APK on the same isolated user11/API35 emulator, Arabic, font scale1, with two
existing tasks and one recognition. Exact APK identity and upgrade/session checks
are in the [QA record](release-qa-results.md). This sample does not measure the
later `63353ae` safety/parser candidate or queued `b2b4302` footer repair.

The ignored `.expo/release-20260914/d13-profile.json` records **20:19:19 UTC on
September14 / 00:19:19 Dubai on September15**. Method: three cycles through
Garden → Family → Settings → Tasks, using native UIAutomator resource-ID lookup
and ADB taps, with200ms after each tap. Total instrumented elapsed time was
**41.99seconds**, including automation overhead; it is not task completion time,
screen-transition duration or user-perceived latency. The host remained shared
with engineering activity; no CPU, thermal or representative physical-device
control was established.

Root retained the Android graphics counters in `d13-frames.txt` and their main
summary in `d13-profile.json`, for process14856:

| Reported Android counter                        |        Value |
| ----------------------------------------------- | -----------: |
| Total frames rendered                           |          451 |
| Janky frames                                    |   37 (8.20%) |
| Frame-duration 50th percentile                  |         19ms |
| Frame-duration 90th percentile                  |         31ms |
| Frame-duration 95th percentile                  |         34ms |
| Frame-duration 99th percentile                  |         46ms |
| Janky frames, separately labeled legacy counter | 239 (52.99%) |

The legacy and current counters are reported separately exactly as Android labels
them. They are not interchangeable performance thresholds. This captures nonzero
jank in this emulator workload; it does not identify a responsible component,
measure continuous display FPS, or establish lower/mid-range physical performance.
The earlier `5ad7faa` samples measured signed-out activity display time, so they
are not a valid frame-performance comparison for this authenticated navigation run.

### Memory snapshots surrounding the same run

`d13-memory-before.txt` and `d13-memory-after.txt` contain Android `meminfo`
for the same PID14856 at uptime3052198ms and3094129ms, about41.93seconds apart.
Units below are **KB as reported by Android**. These are two snapshots around the
navigation cycle, not a stabilized heap series or a leak test.

| Counter                   |  Before |   After | Arithmetic difference |
| ------------------------- | ------: | ------: | --------------------: |
| Total PSS                 | 197,767 | 201,227 |                +3,460 |
| Total RSS                 | 291,684 | 294,552 |                +2,868 |
| Total swap PSS            |   1,480 |   1,125 |                  −355 |
| Native heap allocated     |  67,264 |  82,561 |               +15,297 |
| Dalvik heap allocated     |   6,376 |   6,945 |                  +569 |
| Views                     |      57 |      57 |                     0 |
| Activities / ViewRootImpl |   1 / 1 |   1 / 1 |                 0 / 0 |

No forced GC, matched idle-settling period or repeated post-settlement baseline is
recorded. The total/native heap differences do not prove a leak, improvement or
motion regression. No memory budget is passed by these observations. Large lists,
images, narration, prolonged switching and background pressure still need a
controlled representative-device run.

`d13-crash-summary.json` records zero matches for `FATAL EXCEPTION`, `Fatal signal`
and package-specific ANR text in the retained crash buffer scoped to this app's
user11/UID1110209 inspection. The raw buffer was not persisted. This is neither
complete ANR coverage nor a crash-free/Play-vitals assertion.

## Backend observations

Root ran project-scoped read-only metadata/aggregate queries at19:36:42UTC on
`bqcfynlbxevqlzbkimhy`, Mumbai, Free/Nano. Database size was13,806,739bytes and
16connections were observed. Eight statement IDs had aggregated calls/mean/max
timings; SQL text and private result rows were deliberately excluded.

That workload mixes administration and QA. It is not a controlled API latency,
capacity or before/after measurement. No load test was performed on production.
Unindexed foreign-key advisor items need query-specific staging measurement;
blanket index creation is not justified by the advisor count alone.

## Provisional project budgets and unresolved measurement

### Bounded local SQL sample

At20:24:41UTC on September14 /00:24:41Dubai on September15, the release helper
executed three warmups and30 measured `ghaf_family_snapshot` calls, concurrency1,
against PostgreSQL17.6 at127.0.0.1:54322. All30 succeeded: nearest-rank p50
**9.899ms**, p95 **11.811ms**, minimum8.352ms, maximum12.444ms. The fixture had
one Parent, one Child, two assigned tasks,25 reference templates and zero earned
history; the serialized snapshot was118,750bytes.

This used `SET LOCAL ROLE authenticated` and test JWT claims inside one transaction,
not an HTTP login or verified token. Timing includes SQL round trip/result decode;
connection, authentication, mobile rendering and public-network latency are excluded.
Rollback and absence of the fixture user were verified. No hosted request, service
restart or persistent fixture was used. The ignored `local-load-snapshot.json`
retains all30 samples and actual function hashes. History was19versions through014
during measurement; root subsequently applied the already-tested repeatable015 via
the local CLI, bringing local migration history to20. This sample does not prove
production capacity, authorization, large-family behavior or a performance improvement.

### Candidate comparison triggers

Use these as candidate-comparison triggers, not universal Android standards or
claims that the current product meets them:

- On the same environment, investigate a median activity-display regression over
  10% or APK growth over5% before accepting an internal candidate. Three samples
  are screening evidence only; repeat with at least ten samples on an idle host
  before a release performance decision. A long existing baseline still needs work.
- For production acceptance, establish time-to-usable-content and frame/memory
  budgets on named representative lower/mid-range physical devices. These are
  currently unset because no representative physical measurement was available.
- Measure a fixed repeated journey and dataset for render frames, memory after
  settling, request count, API p50/p95 and offline/reconnect. Do not convert mock
  test duration, mixed database aggregates or emulator smoothness into FPS claims.

The bounded d13 frame counters and two memory snapshots above are **executed**.
Controlled before/after candidate measurement, sustained memory-growth evaluation,
physical-device frame acceptance, battery/thermal behavior, AI latency/cost and
bounded HTTP staging load remain **NOT RUN** in this release lane. No causal performance
improvement or physical-device result is inferred from this sample or source checks.
