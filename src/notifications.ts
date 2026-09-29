import type { Check, History, NotificationEvent, Sample } from './types.ts';

export function transitions(history: History, sample: Sample, notifyOnRecovery = true): NotificationEvent[] {
  return sample.checks.flatMap<NotificationEvent>(result => {
    let previous: 'up' | 'down' | undefined;
    for (let i = history.samples.length - 1; i >= 0; i--) {
      const found = history.samples[i].checks.find(check => check.id === result.id);
      if (found) { previous = found.status; break; }
    }
    if (result.status === 'down' && previous !== 'down') return [{ at: sample.at, checkId: result.id, status: 'down' }];
    if (result.status === 'up' && previous === 'down' && notifyOnRecovery) return [{ at: sample.at, checkId: result.id, status: 'up' }];
    return [];
  });
}

export function slackWebhookUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && ['hooks.slack.com', 'hooks.slack-gov.com'].includes(url.hostname) && url.pathname.startsWith('/services/') && !url.username && !url.password) return url.href;
  } catch { /* Do not include the secret in an error. */ }
  throw new Error('SLACK_WEBHOOK_URL must be an HTTPS Slack incoming webhook URL');
}

export async function deliverSlack(
  queue: NotificationEvent[], webhook: string, siteTitle: string, checks: Check[],
  send: typeof fetch = fetch
): Promise<{ remaining: NotificationEvent[]; sent: number; failed: boolean }> {
  const url = slackWebhookUrl(webhook);
  for (let index = 0; index < queue.length; index++) {
    const event = queue[index];
    const name = checks.find(check => check.id === event.checkId)?.name ?? event.checkId;
    // Plain text only; never include private monitor targets, headers, or the webhook URL.
    const text = `${event.status === 'down' ? '🔴 Disruption' : '🟢 Recovery'}: ${name} — ${siteTitle}\n${event.status === 'down' ? 'A check is failing.' : 'The check is passing again.'} Observed ${event.at}.`;
    try {
      const response = await send(url, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      await response.body?.cancel();
      if (!response.ok) return { remaining: queue.slice(index), sent: index, failed: true };
    } catch {
      return { remaining: queue.slice(index), sent: index, failed: true };
    }
  }
  return { remaining: [], sent: queue.length, failed: false };
}
