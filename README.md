# Hawk

Hawk is a monitoring tool to track the status of your websites and services.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/macintushar/hawk)

## Features

- Track the status of your websites and services
- Get notified when your websites and services are up or down

Monitor

- Name
- Slug
- URL
- Status
- Last Checked
- Created At
- Updated At

Status Page

- Name
- Description
- Monitor(s)
- Graph for each monitor

Admin

- View all monitors
- View all status pages
- Create a new monitor
- Create a new status page
- Edit a monitor
- Edit a status page
- Delete a monitor
- Delete a status page
- Add incident to a status page
- Edit incident on a status page
- Delete incident on a status page
- View all incidents on a status page
- View all incidents

Monitors can have a threshold for the status. If number of bad statuses is greater than the threshold, the status will be marked as down and an incident will be created. This will also trigger a notification to the user (Slack or Email). User can only

Each monitor will have a CRON Expression to check the status of the monitor. It will be generated either programmatically or manually. A user can add a CRON Expression to a monitor that is minimun 1 per minute to 1 per hour.
