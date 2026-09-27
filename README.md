# Hawk Status

A forkable status page with no app server. GitHub Actions runs TypeScript HTTP/TCP probes on a schedule, commits observations to JSON, and publishes a static HTML/CSS/JS page plus a **public, sanitized JSON snapshot** to GitHub Pages. Visitors fetch `data/status.json` from the published Pages site; they do not need access to the source repository or a GitHub API token.

## Set up a page

1. Fork or copy the repository. Use a **public repo on GitHub Free**; private-repo Pages requires an eligible paid plan. Never put secrets in the source config.
2. Edit `config/status.json`: title, colors, groups and checks. Replace the example.com placeholder with your own endpoint. See [configuration reference](docs/configuration.md).
3. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**. In **Settings → Actions → General**, allow workflows and set **Workflow permissions → Read and write permissions** (required to commit history). Your repository policy must allow Pages deployment.
4. Run **Actions → Monitor and publish status → Run workflow**. The workflow records a first sample and deploys the page. Find its URL under **Settings → Pages** (usually `https://OWNER.github.io/REPO/`). Changes to config, UI or incident data also trigger a run.
5. Optionally set a custom domain in Pages settings. For authenticated checks, add repository secrets and expose only the relevant environment variable in the workflow's **Run probes** step.

To receive Slack alerts, add a `SLACK_WEBHOOK_URL` repository Actions secret and set `notifications.slack.enabled` to `true` in `config/status.json`. Alerts are sent only when a service first fails or recovers. See [Slack notifications](docs/configuration.md#slack-notifications) for setup and retry behavior.

The default schedule is four runs per hour (`:07`, `:22`, `:37`, `:52` UTC). GitHub schedules can be delayed or skipped. Public repos may have their schedule disabled after 60 days of inactivity; re-enable it in Actions. A stale check is shown as **unknown**, not operational. Deployment also takes time, so this is not a real-time alerting or SLA system.

The push trigger is limited to `main` so feature branches and PRs cannot run probes or deploy the public page. If your default branch has another name, change the `branches` filter in `.github/workflows/status.yml`.

## Private source, public page

GitHub Pages sites are publicly reachable even when the repository is private, if the account/organization plan permits private-repo Pages. This workflow deploys **only `dist/`**, not the repository. `src/publish.ts` explicitly selects public fields from the config and publishes the historical results and incident text. All published data, including check IDs, timestamps, availability and incident content, is public. Private monitor URLs and header mappings are not published; do not put credentials or sensitive information into display fields, incidents or probe result details.

On GitHub Free, keep the repo public and store credentials solely in Actions secrets. If you require a private source repo on a plan without private-repo Pages, use a separate public Pages repository or another static host, and publish **only `dist/`** to it with appropriately scoped credentials; the bundled workflow does not automate that two-repository setup. A static site cannot securely fetch private GitHub files using a browser token.

## Local development

Requires Node 24+, npm and Python 3 for the optional local server.

```sh
npm ci
npm run check
npm test
npm run monitor   # executes real network checks and appends to data/history.json
npm run serve     # publishes current JSON to dist/ and serves http://localhost:8000
```

`npm run publish` builds `dist/` without running checks. `dist/` is ignored by git. To preview an empty page, skip `npm run monitor` and run `npm run serve`. The first scheduled check will populate it. To test without modifying the repository's history, use a disposable copy.

## Reading the status

Each run stores one UTC sample for every check in `data/history.json`. The current state is the most recent result per check, unless it is older than `staleAfterMinutes`. Each daily bar shows whether any **observed** check failed on that day; gray means no observations. “Successful observations” is the fraction of successful probes in the last 30 UTC days, **not** measured uptime or an SLA. Missed schedules, gaps between probes and runner failures are not counted as success or downtime. Incidents are optional manual entries in `data/incidents.json`; they do not alter probe history.

This simple JSON/Git design will grow with every check. At high frequency or many services, split history into monthly files or use dedicated storage; avoid turning a single file and git history into an unbounded production database. No automatic incident creation, multi-region consensus or precise outage-duration accounting is included.

See [configuration and incident examples](docs/configuration.md) and [agent guidance](AGENTS.md).
