### Slack Notifications Setup

Hawk supports sending alerts to Slack using Incoming Webhooks. Follow these steps to create a Slack app, enable Incoming Webhooks, and connect it to Hawk.

### 1) Create the Slack app via manifest

1. Go to the Slack App Manifest page: `https://api.slack.com/apps?new_app=1`
2. Choose "From an app manifest" and select your workspace
3. Click on YAML and paste the YAML below and create the app

```yaml
display_information:
  name: Hawk Notifications
  description: Send uptime and incident alerts from Hawk
  background_color: "#111827"

features:
  bot_user:
    display_name: Hawk
    always_online: false

oauth_config:
  scopes:
    bot:
      - incoming-webhook

settings:
  interactivity:
    is_enabled: false
  incoming_webhooks:
    incoming_webhooks_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

Notes:

- The manifest enables Incoming Webhooks and creates a bot user. No OAuth bot token is needed for Hawk since it uses webhook URLs.
- You will pick a default channel during installation; Slack will generate a webhook URL for that channel.

### 2) Install the app to your workspace

1. In the Slack app dashboard, go to "Basic Information" → "Install your app"
2. Click "Install to Workspace" and authorize
3. Navigate to "Incoming Webhooks" and copy the Webhook URL (you can add multiple channels if desired)

### 3) Configure Hawk

1. In Hawk, open App → Notifications → Slack
2. Enable Slack Notifications
3. Paste the Slack Webhook URL
4. Optionally set a Channel (e.g. `#alerts`). If omitted, Slack uses the webhook’s default channel
5. Adjust Notification Rules (e.g., Monitor Down/Up, Incident Created/Resolved)
6. Click "Save Settings"
7. Use "Test Slack Notification" to verify

### Example messages sent by Hawk

- Monitor down: `:rotating_light: <Monitor Name> is DOWN\nURL: <url>`
- Monitor up: `:white_check_mark: <Monitor Name> is back UP\nURL: <url>`
- Incident created: `:memo: Incident created: <title>`
- Incident resolved: `:white_check_mark: Incident resolved: <title>`

### Security tips

- Treat webhook URLs like secrets; anyone with the URL can post to your channel
- Rotate or remove compromised webhooks from Slack → Incoming Webhooks
- Limit who can install apps in your workspace

### Troubleshooting

- 400/403 from Slack: verify the webhook URL is correct and active
- No messages: confirm rules are enabled and the monitor/incident actually changed state
- Change target channel: add a new webhook for the desired channel in Slack, then update Hawk settings

### References

- Slack Incoming Webhooks: `https://api.slack.com/messaging/webhooks`
- Slack App Manifests: `https://api.slack.com/reference/manifests`
