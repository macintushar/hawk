import { readConfig } from './config.ts';
import { readHistory, writeHistory } from './history.ts';
import { deliverSlack } from './notifications.ts';

const config = await readConfig();
if (config.notifications?.slack?.enabled) {
  const history = await readHistory();
  const queue = history.notificationQueue ?? [];
  if (queue.length) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    if (!webhook) {
      console.error('::warning::Slack notifications pending: set the SLACK_WEBHOOK_URL Actions secret.');
      process.exitCode = 1;
    } else {
      try {
        const result = await deliverSlack(queue, webhook, config.site.title, config.checks);
        history.notificationQueue = result.remaining;
        if (result.sent) await writeHistory(history);
        console.log(`Slack: delivered ${result.sent} notification(s), ${result.remaining.length} pending.`);
        if (result.failed) {
          console.error('::warning::Slack notification failed; pending alerts will be retried on the next run.');
          process.exitCode = 1;
        }
      } catch {
        // Never log an exception that might contain the webhook URL.
        console.error('::warning::Slack webhook configuration is invalid; pending alerts were kept.');
        process.exitCode = 1;
      }
    }
  }
}
