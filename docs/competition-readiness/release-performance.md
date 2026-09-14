# Release performance evidence

Updated:2026-09-15 Dubai; receipts are dated2026-09-14UTC.
**Historical startup baseline and bounded d13/b2/final 4dd frame/memory samples measured;
controlled comparison and performance gate NOT PASSED.** No FPS or
lower/mid-range physical-device claim is supported.

## Standalone artifact size

| Source               |  APK bytes | Difference from d13 | Difference from 5ad |
| -------------------- | ---------: | ------------------: | ------------------: |
| Historical `5ad7faa` | 88,134,244 |                   — |                   — |
| `d13c148`            | 88,449,616 |                   — |            +315,372 |
| `b2b4302`            | 88,451,812 |    +2,196 (0.0025%) |  +317,568 (0.3603%) |
| Final `4dd6490`      | 88,451,956 |              +2,340 |            +317,712 |

The downloaded b2 artifact is `ghaf-internal-b2b43028ebd6.apk`, source
`b2b43028ebd61ba943a808bf6c3be35ff8f78d5f`, SHA-256
`ec870fa8bf8153c847751482ae4bba161f86fd141bedb4b70078606ea3510ff5`.
The candidate's companion `THIRD-PARTY-NOTICES/source-manifest.json` records
independent APK hashing and the d13 comparison; exact artifact identities are
also recorded in the [QA record](release-qa-results.md). APK byte growth is below
the provisional 5% investigation trigger below. This does not establish installed
disk usage, startup performance or a passed performance gate.

Final `ghaf-internal-4dd649025da8.apk`, source
`4dd649025da828a53ee9617573ebbc0b2849245c`, is **144 bytes larger than b2**.
Its independently verified SHA-256 is
`eacad1cc78a04e4d2a7d753a646ea07bb0540061e7e0fd47497ad757afd3a886`;
the artifact and receipt are under `output/release-021-final/`.

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

The final4dd candidate repeated this method on the same isolated user/device;
see the final signed-out startup sample below. Shared-host and cache histories
remain uncontrolled, so the later result does not establish a causal improvement.
The later YAML parser patch is build-tool hardening, not an app startup optimization.

## d13 paired-Child navigation sample

Root measured the fresh standalone `d13c148e09ddd64c5cd17c8f784c21f7c5396f72`
APK on the same isolated user11/API35 emulator, Arabic, font scale1, with two
existing tasks and one recognition. Exact APK identity and upgrade/session checks
are in the [QA record](release-qa-results.md). This sample does not measure the
later candidates; the separate b2 navigation sample is recorded below.

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

## b2 paired-Child navigation comparison

Root repeated the same three-cycle Garden → Family → Settings → Tasks method on
the actual b2 standalone APK, isolated user11 on the same API35 emulator, Arabic,
font scale1, with two tasks and one recognition **before the later core task
test**. The ignored `.expo/release-20260914/b2-profile.json` records
**20:45:49 UTC on September14 / 00:45:49 Dubai on September15**. It retains
the same UIAutomator resource-ID lookup, ADB taps and 200ms delay after each tap.
Instrumented elapsed time was **41.60seconds**, compared with d13's 41.99seconds;
both include automation overhead and are not measures of user-perceived latency.

| Reported Android counter       |        d13 |         b2 |
| ------------------------------ | ---------: | ---------: |
| Total frames rendered          |        451 |        386 |
| Janky frames                   | 37 (8.20%) | 32 (8.29%) |
| Frame-duration 50th percentile |       19ms |       17ms |
| Frame-duration 90th percentile |       31ms |       27ms |
| Frame-duration 95th percentile |       34ms |       32ms |
| Frame-duration 99th percentile |       46ms |       48ms |

The median frame duration is lower in this b2 sample, while the janky-frame
percentage and 99th percentile are higher. This mixed result does not support
an overall improvement claim. Frame counts are not converted into FPS. The
repeated journey, locale and fixture make these samples useful for screening,
but the shared host, process/cache history and lack of controlled repetitions
prevent causal attribution to the candidate's changes.

### b2 memory snapshots

`b2-memory-before.txt` and `b2-memory-after.txt` contain Android `meminfo`
for PID19153 at uptime4642611ms and4684216ms, 41.605seconds apart. Units are
**KB as reported by Android**; the d13 difference is included for comparison.

| Counter                   | b2 before | b2 after | b2 difference | d13 difference |
| ------------------------- | --------: | -------: | ------------: | -------------: |
| Total PSS                 |   193,739 |  220,659 |       +26,920 |         +3,460 |
| Total RSS                 |   288,808 |  316,160 |       +27,352 |         +2,868 |
| Total swap PSS            |       544 |      407 |          −137 |           −355 |
| Native heap allocated     |    66,043 |   84,633 |       +18,590 |        +15,297 |
| Dalvik heap allocated     |     8,845 |    9,402 |          +557 |           +569 |
| Views                     |        57 |       57 |             0 |              0 |
| Activities / ViewRootImpl |     1 / 1 |    1 / 1 |         0 / 0 |          0 / 0 |

The larger PSS increase, **26,920KB versus 3,460KB**, needs follow-up with matched
idle settling and repeated post-settlement snapshots. Neither run records a
matched idle/GC baseline, and process history and shared-host memory pressure
were uncontrolled. These snapshots cannot establish retained growth, a leak or
a regression caused by this change. Stable view/activity counts do not close
that gap. The memory and physical-device performance gates remain **NOT PASSED**.

## b2 and final 4dd samples after explicit warm-up

Root executed two additional matched-journey samples on the same API35 emulator,
paired Child in user11, Arabic, font scale1. Both used **two tasks, two recognitions
and two memories**, following the core task test. These are a separate comparison
from the earlier d13/b2 one-recognition samples; the old measurements remain above.
The final default-font footer layout was the same as b2. Background user12's app
was force-stopped for this comparison.

Before each measured run, root completed **two full navigation warm-up cycles**.
The measured workload was then three cycles of Garden → Family → Settings → Tasks,
with the same native UIAutomator resource-ID lookup, ADB taps and 200ms delay after
each tap. Ignored `.expo/release-20260914/b2warm-profile.json` is dated
**21:08:59 UTC on September14 / 01:08:59 Dubai on September15**;
`finalwarm-profile.json` is dated **21:25:33 UTC / 01:25:33 Dubai**. Exact artifact
identities are recorded above. No startup measurement was part of these runs.

| Reported counter               |     b2warm | finalwarm (4dd) |              Final minus b2 |
| ------------------------------ | ---------: | --------------: | --------------------------: |
| Instrumented elapsed time      |     43.31s |          43.13s |                      −0.18s |
| Total frames rendered          |        396 |             390 |                          −6 |
| Janky frames                   | 36 (9.09%) |     39 (10.00%) | +3; +0.91 percentage points |
| Frame-duration 50th percentile |       17ms |            18ms |                        +1ms |
| Frame-duration 90th percentile |       27ms |            31ms |                        +4ms |
| Frame-duration 95th percentile |       32ms |            36ms |                        +4ms |
| Frame-duration 99th percentile |       46ms |            53ms |                        +7ms |

The final run recorded higher janky-frame percentage and frame-duration
percentiles. The elapsed-time difference includes automation overhead and does
not indicate faster interaction. These are measured differences, not a causal
regression or improvement finding. The host remained shared, cache/GC/swap history
was uncontrolled, and one measured run per candidate is insufficient for a release
performance decision. Frames divided by this instrumented duration are not FPS.

### Warm-run memory snapshots

The corresponding `{b2warm,finalwarm}-memory-{before,after}.txt` receipts contain
Android `meminfo`. b2 used PID28622, uptime6030725→6074189ms; final used PID4092,
uptime7024562→7068026ms. Each memory pair spans 43.464 seconds, a surrounding
capture window rather than the profile script's exact elapsed-time boundary.
Values below are **KB as reported by Android**.

| Counter                   | b2 before | b2 after | b2 difference | Final before | Final after | Final difference |
| ------------------------- | --------: | -------: | ------------: | -----------: | ----------: | ---------------: |
| Total PSS                 |   188,394 |  203,741 |       +15,347 |      196,180 |     176,071 |          −20,109 |
| Total RSS                 |   219,148 |  236,948 |       +17,800 |      256,408 |     210,688 |          −45,720 |
| Total swap PSS            |    54,586 |   53,655 |          −931 |       31,240 |      55,021 |          +23,781 |
| Native heap allocated     |    81,555 |   87,857 |        +6,302 |       86,172 |      91,802 |           +5,630 |
| Dalvik heap allocated     |     6,513 |    6,521 |            +8 |        9,583 |       9,719 |             +136 |
| Views                     |        57 |       57 |             0 |           57 |          57 |                0 |
| Activities / ViewRootImpl |     1 / 1 |    1 / 1 |         0 / 0 |        1 / 1 |       1 / 1 |            0 / 0 |

Final PSS/RSS fell while swap PSS and allocated heaps rose. These snapshots
cannot be read as a memory optimization, a leak or proof that the earlier b2 PSS
increase is resolved. Explicit navigation warm-up does not control GC, paging or
post-run idle settling. Repeat settled measurements under controlled pressure and
on representative physical devices before assigning causality or accepting a
budget. **The physical Android/performance gate remains blocked.**

## Final signed-out startup sample

At21:30:24UTC on September14 /01:30:24Dubai on September15, root measured
three process-cold `am start -W` launches of the exact4dd APK after force-stop,
signed out in user11, font1, normal system animation scales. Each launch reported
`COLD`/`ok`; native resource IDs confirmed the sign-in screen after each.

| Sample | Activity TotalTime | WaitTime |
| ------ | -----------------: | -------: |
| 1      |            1,406ms |  1,418ms |
| 2      |            1,261ms |  1,300ms |
| 3      |            1,419ms |  1,430ms |

Median activity-display time is1,406ms, versus the earlier5ad screening median
4,056ms. This does not establish a2,650ms application improvement: process/OS
caches, runtime compilation history and shared-host load were not controlled
across the earlier and later sessions. It does not measure usable authenticated
content, first installation, network latency or physical-device startup. The
ignored `startup-final.json` records the exact source/APK hash and method. An
initial harness assertion rejected CRLF-bearing fields before normalization;
that attempt is not counted among these three successful samples.

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

The bounded d13/b2/final 4dd frame counters, including the explicit-warm-up pair,
surrounding memory snapshots and APK byte
comparison above are **executed**.
Controlled before/after candidate measurement, sustained memory-growth evaluation,
physical-device frame acceptance, battery/thermal behavior, AI latency/cost and
bounded HTTP staging load remain **NOT RUN** in this release lane. No causal performance
improvement or physical-device result is inferred from this sample or source checks.
