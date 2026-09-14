# Release performance evidence

Date:2026-09-14. **Baseline measured; candidate comparison and performance gate
NOT PASSED.** No frame-rate or lower/mid-range physical-device claim is supported.

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

Frame timing, dropped frames, memory-growth comparison, battery/thermal behavior,
AI latency/cost and bounded staging load remain NOT RUN in this release lane.
No performance improvement is claimed from source inspection.
