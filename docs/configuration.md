# Configuration reference (v1)

All paths are relative to the repository root. JSON is used instead of YAML so Node and the browser can consume the format without an extra parser. Modify `config/status.json` and commit it. The workflow validates it before running probes and before deployment.

## Site and groups

```json
{
  "version": 1,
  "site": {
    "title": "Acme Status",
    "description": "Availability of Acme products",
    "homeUrl": "https://acme.example",
    "staleAfterMinutes": 45,
    "logo": {
      "src": "assets/acme-mark.svg",
      "darkSrc": "assets/acme-mark-dark.svg",
      "text": "Acme",
      "alt": "Acme",
      "maxWidth": 40,
      "maxHeight": 40
    },
    "theme": {
      "accent": "#000000",
      "background": "#f3f6f9",
      "surface": "#ffffff",
      "text": "#000000"
    }
  },
  "groups": [{ "id": "core", "name": "Core services", "description": "Customer-facing" }],
  "checks": []
}
```

At least one group and one check are required for deployment. IDs are unique lowercase slugs (`a-z`, digits, hyphens). `staleAfterMinutes` should be greater than your cron interval plus expected scheduling/deployment delay. Theme fields are six-digit hex colors; the default is the paper-desk palette. The header's Tabler-style appearance icon opens a popover with **Light**, **System**, and **Dark** modes. The choice is remembered in local storage; `System` follows the OS preference, including changes made while the page is open.

`site.logo` is optional. Put image files under `web/` (for example `web/assets/logo.svg`) and refer to them with a relative path like `assets/logo.svg`, so project Pages subpaths work. `darkSrc` is an optional alternate used in dark mode; it falls back to `src` when omitted. When `text` is present, it is the exact label shown beside the image and the image defaults to a 40 × 40 mark. When `text` is omitted, no adjacent label is shown and the image is displayed as a wider wordmark, preserving its intrinsic aspect ratio up to 300 × 64 pixels (and a responsive viewport width). Set `maxWidth` and `maxHeight` in pixels to override those maxima; accepted range is 16–1000. `alt` supplies alternative text when the logo has no adjacent text; otherwise the image is decorative because the visible label names it. If there is no image, the existing star mark is used and `text` can label it. With no `site.logo` object, the site title remains as the header label for compatibility.

`web/styles.css` contains the full semantic palette, status colors and layout. The supplied dark palette applies automatically in System dark mode and when Dark is selected. `site.theme` brands the light palette; edit the CSS dark token block too if you want a custom dark palette. Add a custom layout in `web/` if you need more extensive branding.

## Checks

Each check has `id`, `name`, `group`, optional `description` and optional `publicUrl` (the clickable service link). The `monitor` object is used only on the runner, **not** included in the public Pages snapshot. `timeoutMs` defaults to 10000 and must be between 100 and 120000.

HTTP GET, any 2xx response by default, or an exact `expectedStatus`:

```json
{
  "id": "api",
  "name": "API",
  "description": "Production API",
  "group": "core",
  "publicUrl": "https://api.acme.example",
  "monitor": {
    "type": "http",
    "url": "https://api.acme.example/health",
    "expectedStatus": 200,
    "timeoutMs": 8000
  }
}
```

HTTP redirects are followed by default. Keep health endpoints lightweight: the check performs a GET and cancels the response body after headers. For authenticated endpoints, use `"headersFromEnv": { "Authorization": "CHECK_API_TOKEN" }` and set `CHECK_API_TOKEN: ${{ secrets.CHECK_API_TOKEN }}` in the workflow's **Run probes** step `env:` block. The secret contains the entire header value (e.g. `Bearer ...`). A missing secret fails the run without recording a false outage. Do not add the token literal to JSON or a public field.

TCP connect (tests connectivity, not application-level health):

```json
{
  "id": "database",
  "name": "Database port",
  "group": "core",
  "monitor": { "type": "tcp", "host": "db.acme.example", "port": 5432, "timeoutMs": 5000 }
}
```

GitHub-hosted runners cannot reach private LAN hosts without networking setup. To support custom protocols, implement a new `monitor.type` in `src/types.ts`, `src/config.ts` and `src/probe.ts`, then add tests. Keep private probe data out of `src/publish.ts`.

## Slack notifications

1. Create a Slack app with **Incoming Webhooks** enabled, then add a webhook for the channel that should receive alerts. Copy the URL from Slack; never commit it to this repository.
2. In GitHub **Settings → Secrets and variables → Actions**, create a repository secret named `SLACK_WEBHOOK_URL` with the full `https://hooks.slack.com/services/...` URL. GovSlack `hooks.slack-gov.com` URLs are also accepted.
3. In `config/status.json`, configure:

```json
"notifications": {
  "slack": { "enabled": true, "notifyOnRecovery": true }
}
```

`notifications` is optional and disabled in the starter config. `notifyOnRecovery` defaults to true; set it to false to receive only down alerts. One webhook sends to the Slack channel selected when you created it. Change the webhook secret to switch channels; configure separate deployments if you need independent pages/channels. The workflow passes the secret to `npm run notify` only, not to the browser or Pages artifact.

The first failing observation of a check sends a down alert; repeated failures do not. An up observation after a down observation sends a recovery alert if enabled; the first healthy observation sends nothing. The run commits the new sample and its pending alerts together, attempts delivery, then commits an updated queue. Failed deliveries remain queued for the next scheduled run, and status publishing proceeds even if Slack is unavailable. Retried delivery is **at least once**, so a rare failure after Slack accepts an alert but before the queue commit can produce a duplicate. Disabling Slack clears pending alerts on the next monitor run. The queue is stored in the source `data/history.json` and excluded from the public `data/status.json`. Slack messages include only service name, site title, state and timestamp—not private monitor endpoints or credentials.

## Manual incidents

Edit `data/incidents.json` and commit it. An incident is editorial context, separate from the automatic probe history:

```json
{
  "version": 1,
  "incidents": [
    {
      "id": "2026-09-28-api",
      "title": "Elevated API errors",
      "status": "resolved",
      "startedAt": "2026-09-28T10:00:00Z",
      "resolvedAt": "2026-09-28T10:30:00Z",
      "checkIds": ["api"],
      "updates": [
        { "at": "2026-09-28T10:05:00Z", "message": "Investigating elevated errors." },
        { "at": "2026-09-28T10:30:00Z", "message": "Service recovered." }
      ]
    }
  ]
}
```

Allowed statuses: `investigating`, `identified`, `monitoring`, `resolved`. Only resolved incidents have `resolvedAt`. Times should be ISO 8601 UTC strings. Check IDs must exist in the config; use `[]` for an incident affecting the whole site. The UI shows the ten newest incidents and up to three latest updates each. Incident text is publicly visible and rendered as plain text.

## Published contract

The deployable artifact contains `index.html`, `styles.css`, `app.js` and `data/status.json`:

```json
{
  "config": { "version": 1, "site": {}, "groups": [], "checks": [] },
  "history": { "version": 1, "samples": [{ "at": "2026-09-28T10:00:00.000Z", "checks": [{ "id": "api", "status": "up", "latencyMs": 42 }] }] },
  "incidents": { "version": 1, "incidents": [] }
}
```

The published `checks` contain only `id`, `name`, `description`, `group`, `publicUrl`. History records `status` (`up` or `down`) and `latencyMs` (number or null); internal failure details are not published. Do not repurpose this format without incrementing the version and migrating the UI.
