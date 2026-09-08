# Ghaf Parent Guide reference gateway

This Cloudflare Worker exposes one bounded operation for the exact synthetic Feature 003 Parent
Guide request. It does not expose Child Coach, media, summaries, arbitrary missions, persistence,
or production identity. The app's prepared provider remains the default and complete offline path.

Before any deployment, set `ALLOWED_ORIGIN` to the approved demo web origin, choose a rate-limit
namespace unique to the Cloudflare account, and create the Worker secret:

```bash
npx wrangler secret put GHAF_DEMO_ACCESS_TOKEN --config workers/ghaf-parent-guide/wrangler.jsonc
```

Never place that token in an `EXPO_PUBLIC_` variable or mobile source. The current Expo prototype
has no trusted token broker, so mobile live activation remains blocked. A future approved host must
inject a short-lived credential through `GatewayParentGuideService.getAccessToken`; otherwise use
the prepared provider.

Cloudflare deployment and a real model call are not performed by repository tests. Tests use fake
Workers AI and rate-limit bindings and do not prove provider availability, account configuration,
security review, or production readiness.
