# Local resource assessment and starting budget

Read-only snapshot collected September 12, 2026 by the resource-audit helper. This measures the
WSL environment visible to Codex, not all physical laptop RAM or Windows applications. No load
test with forty agents, synthetic stress benchmark, package installation or host configuration
change was performed. Re-measure before increasing the live board's budget.

| Resource                     | Observed snapshot                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| CPU exposed to WSL           | AMD Ryzen 7 4800H; 8 cores / 16 logical CPUs                                                               |
| WSL memory                   | 7,829,152 KiB total, approximately 7.47 GiB                                                                |
| Available memory             | 5,034,544 KiB, approximately 4.80 GiB / 64%                                                                |
| Swap                         | 2 GiB total; approximately 36 MiB used                                                                     |
| Load average                 | 0.14 / 0.54 / 1.03                                                                                         |
| Short CPU/paging observation | Two one-second samples approximately 99% idle, zero swap-in/out                                            |
| Observed cgroup              | `/init.scope`; `memory.max=max`, `memory.swap.max=max`, `cpu.max=max 100000`                               |
| Node                         | v24.16.0; measured default V8 heap limit 2,240 MiB; no inherited heap-size override                        |
| Processes                    | 5 Codex processes: approximately 1.11 GiB summed RSS; 27 Node processes: approximately 2.53 GiB summed RSS |
| Browser/build classification | No matched WSL browser, Metro/Expo-start or native-build executable at inspection                          |

RSS sums may double-count shared memory. Cgroup usage includes accounting/cache differences;
an unlimited cgroup does not create memory beyond the WSL VM allocation. These process counts do
not establish how many interactive sessions, helper requests or unrelated Windows tools were active.

## Starting allocation across all four sessions

- **Four leads plus four helpers:** A/B/C/D initially receive one helper slot each. These are
  global allocations for this mission, not four helpers per session. The configured ceiling of
  ten per session remains unchanged.
- A can reallocate idle slots or gradually raise the helper total toward **eight**, after measuring
  headroom and confirming useful independent work. This is conditional guidance, not an eight-agent
  benchmark or authorization to create forty simultaneous local workloads.
- **One heavy job total:** full suite, export/build, native build or large dependency installation.
  Record the owning session, command and PID/session; other leads do lightweight independent work.
- **One shared preview lane:** at most one Metro server and one owned browser session/process tree for this mission.
  Leads schedule that lane through A. Avoid a native build while both preview process trees are resident.
  Record the browser root PID/tool handle and count renderer/utility children in resource use.
  Browser contexts also use memory; do not create unlimited concurrent pages.

Cloud model inference and local tool execution have different costs. Laptop CPU/RAM mainly cover
clients, MCPs, code indexes, browser pages, Node workers, native tooling and development servers.
Forty waiting helpers and forty simultaneous builds are not the same load. Account concurrency,
rate limits, model availability and usage costs remain separate constraints.

## Operational thresholds

These are conservative operating choices, **not measured capacity limits**:

| Observation                                                                                            | Action                                                                                     |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| At least 40% WSL memory available, approximately 3 GiB; no sustained paging or degraded responsiveness | A may add a small number of useful helper slots, then observe again                        |
| Below 30% available, approximately 2.24 GiB; or growing swap with sustained paging                     | Stop granting new helpers/heavy jobs; finish or pause owned nonessential work safely       |
| Below 15% available, approximately 1.12 GiB; or sustained paging/visible latency                       | Checkpoint and reduce owned local workloads; keep one recovery/integration lead responsive |
| Tool/model rate limit or exhausted account quota                                                       | Record the limit and stop spawning; preserve work and resume state                         |

Static swap use alone does not prove current memory pressure. CPU count alone does not justify
high parallelism. Observe browser responsiveness, command durations and memory together. Never
kill another session's or the user's processes to make room. Stop only known owned jobs through
their handles, and record any unfinished work before releasing a slot.

Useful local read-only checks:

```bash
free -h
getconf _NPROCESSORS_ONLN
cat /proc/loadavg
vmstat 1 3
```

The audit additionally read selected cgroup limits and `/proc/meminfo`, classified executable/RSS
records, and inspected V8 heap statistics. It did not dump inherited environment variables or
credentials. Record fresh measurements in A's status before changing [BOARD](BOARD.md) allocations.
