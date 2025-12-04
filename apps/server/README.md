# Hawk Server

Hawk is a monitoring and alerting system, similar to UptimeKuma, OpenStatus, etc.

Hawk has the following:
- Monitors
- Notifiers/Alerts
- Status Pages


#### Monitors
Monitors are the resources that are being monitored.

Monitors can be of the following types:
- HTTP
- DNS (future)

#### Notifiers/Alerts
Notifiers are the resources that are being notified.

Notifiers can be of the following types:
- Email
- Slack
- Webhook (future)
- Telegram (future)
- Discord (future)
- PagerDuty (future)
- ZenDuty (future)

#### Status Pages
Status pages are the resources that are being displayed.
It contains multiple monitors.


Each Monitor has N Notifiers attached to it.

Hawk has workspaces. Each workspace can have Monitors, Notifiers, and Status Pages.




