## Slack notifications

Hawk can send monitor and incident alerts to Slack using Incoming Webhooks. This guide walks you through creating a Slack app (from a manifest), installing it, grabbing the webhook URL, and wiring it up in Hawk.

### Quick start (TL;DR)

1. Create a Slack app from the manifest (takes ~1 minute)
2. Install it to your workspace
3. Copy the generated Incoming Webhook URL
4. In Hawk, go to App → Notifications → Slack and paste the URL
5. Optionally set a channel (e.g. `#alerts`) and save
6. Click “Test Slack Notification” to verify

---

### 1) Create the Slack app via manifest

1. Open the Slack App Manifest page
   - Link: [Create a new Slack app](https://api.slack.com/apps?new_app=1)
2. Choose "From an app manifest" and select your workspace
3. Choose YAML and paste the following manifest

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

- This manifest enables Incoming Webhooks and creates a bot user. No OAuth bot token is required; Hawk only needs the webhook URL.
- During installation you’ll choose a default channel; Slack generates a webhook URL for that channel.

### 2) Install the app to your workspace

1. In the Slack app dashboard, open "Basic Information" → "Install your app"
2. Click "Install to Workspace" and authorize
3. Go to "Incoming Webhooks" and copy the Webhook URL
   - You can add multiple webhooks for different channels if needed

### 3) Configure Hawk

1. In Hawk, open App → Notifications → Slack
2. Enable Slack notifications
3. Paste the Slack Webhook URL
4. Optionally set a Channel (e.g. `#alerts`). If omitted, Slack uses the webhook’s default channel
5. Choose which rules to notify (Monitor Down/Up, Incident Created/Resolved)
6. Click "Save Settings"
7. Click "Test Slack Notification" to verify

### What messages does Hawk send?

- Monitor down: `:rotating_light: <Monitor Name> is DOWN\nURL: <url>`
- Monitor up: `:white_check_mark: <Monitor Name> is back UP\nURL: <url>`
- Incident created: `:memo: Incident created: <title>`
- Incident resolved: `:white_check_mark: Incident resolved: <title>`

### FAQ

- Can I change the target channel later?
  - Yes. Either specify a channel in Hawk (overrides the webhook default) or create a new webhook tied to the desired channel, then update Hawk.
- Do I need an OAuth bot token?
  - No. Incoming Webhooks are sufficient; Hawk only posts to the provided URL.
- Can I use multiple workspaces/channels?
  - Yes. Create multiple webhooks in Slack (one per workspace/channel) and choose which one to paste into Hawk.
- How do I rotate a webhook?
  - Create a new webhook in Slack, update Hawk with the new URL, then disable/delete the old webhook in Slack.

### Security best practices

- Treat webhook URLs as secrets; anyone with the URL can post to your channel
- Store webhooks securely and restrict who can view/update notification settings
- Rotate or remove compromised webhooks via Slack → Incoming Webhooks
- Limit who can install apps in your Slack workspace

### Troubleshooting

- 400/403 from Slack
  - Verify the webhook URL is correct and active; try re-installing the app or creating a new webhook
- No messages arriving
  - Confirm the relevant notification rules are enabled and that a monitor/incident actually changed state
  - Check if a custom channel is set in Hawk; ensure the channel exists and the webhook has access
- Wrong channel
  - Update the channel in Hawk or create a new webhook for the desired channel and paste it into Hawk

### References

- Slack Incoming Webhooks: [Messaging with webhooks](https://api.slack.com/messaging/webhooks)
- Slack App Manifests: [App manifest reference](https://api.slack.com/reference/manifests)
