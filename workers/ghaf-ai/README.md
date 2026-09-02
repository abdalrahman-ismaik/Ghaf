# Ghaf AI prototype gateway

This optional Cloudflare Worker keeps model access outside the Expo bundle. It uses Workers AI's
free daily allocation when available and defaults to the multilingual
`@cf/meta/llama-3.1-8b-instruct-fast` model. The model is a deployment variable so the app does not
need rebuilding when availability changes.

Deploy from the repository root after signing into Cloudflare:

```powershell
npx wrangler deploy --config workers/ghaf-ai/wrangler.jsonc
```

Copy the deployed HTTPS URL into `EXPO_PUBLIC_GHAF_AI_GATEWAY_URL`. Do not put a Cloudflare API
token or any model-provider key in an `EXPO_PUBLIC_` variable.

This endpoint contains no production authentication or persistence. It is suitable only for the
synthetic competition prototype. Apply Cloudflare account-level rate limiting before sharing the
URL broadly. The app remains fully usable when the Worker is absent or its free quota is exhausted.
