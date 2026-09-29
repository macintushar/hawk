# Working on this status page

Start with `README.md` and `docs/configuration.md`. This is a static GitHub Pages status page, not a server app. Keep the public data contract at version 1 unless intentionally migrating readers and writers together.

- `config/status.json`: private source configuration, probe targets and public display fields.
- `data/history.json`: append-only probe observations plus the pending Slack notification queue; do not hand-edit except to repair data.
- `data/incidents.json`: manually authored incident timeline.
- `src/`: Node 24 TypeScript probes, validation and Pages snapshot builder.
- `web/`: framework-free status UI; use relative URLs so project Pages subpaths work.
- `.github/workflows/status.yml`: scheduled probe, history commit and Pages deployment in one workflow.

To change branding, edit the `site` object and optionally `web/styles.css`. To add a monitor, give it a unique slug, assign an existing group, and choose an HTTP or TCP monitor. Never put credentials in JSON; reference a GitHub Actions secret through `headersFromEnv` and map it in the workflow. Only the explicitly allowlisted display fields from `src/publish.ts` go to the public site. Do not add private target URLs, headers or secrets to that output.

Slack is opt-in via `notifications.slack.enabled`; the webhook URL comes only from the `SLACK_WEBHOOK_URL` Actions secret. Keep pending events in `data/history.json` until successfully delivered. Do not publish the notification queue or log the webhook URL.

Run `npm ci`, `npm run check`, `npm test`, `npm run publish` before opening a PR. Do not assume missed cron runs mean uptime. UI text must be set as text, not raw HTML from configuration or incidents.
