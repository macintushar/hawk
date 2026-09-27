import { readFile, writeFile } from 'node:fs/promises';
import type { History, NotificationEvent, Sample } from './types.ts';

export function validateHistory(input: unknown): History {
  if (!input || typeof input !== 'object' || !('version' in input) || input.version !== 1 || !('samples' in input) || !Array.isArray(input.samples)) {
    throw new Error('Invalid history: expected version 1 and samples array');
  }
  for (const sample of input.samples) {
    if (!sample || typeof sample.at !== 'string' || Number.isNaN(Date.parse(sample.at)) || !Array.isArray(sample.checks) ||
        sample.checks.some((result: Sample['checks'][number]) => !result || typeof result.id !== 'string' || !['up', 'down'].includes(result.status) || (result.latencyMs !== null && (!Number.isFinite(result.latencyMs) || result.latencyMs < 0)))) {
      throw new Error('Invalid history: malformed sample');
    }
  }
  if ('notificationQueue' in input && (!Array.isArray(input.notificationQueue) || input.notificationQueue.some((event: NotificationEvent) =>
    !event || typeof event.checkId !== 'string' || typeof event.at !== 'string' || Number.isNaN(Date.parse(event.at)) || !['up', 'down'].includes(event.status)))) {
    throw new Error('Invalid history: malformed notification queue');
  }
  return input as History;
}

export async function readHistory(): Promise<History> {
  return validateHistory(JSON.parse(await readFile('data/history.json', 'utf8')));
}

export async function writeHistory(history: History): Promise<void> {
  await writeFile('data/history.json', JSON.stringify(history, null, 2) + '\n');
}

export async function appendSample(sample: Sample, events: NotificationEvent[], clearQueue = false): Promise<void> {
  const history = await readHistory();
  history.samples.push(sample);
  history.notificationQueue = [...(clearQueue ? [] : history.notificationQueue ?? []), ...events];
  await writeHistory(history);
}
