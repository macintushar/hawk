import { readConfig } from './config.ts';
import { appendSample, readHistory } from './history.ts';
import { probe } from './probe.ts';
import { transitions } from './notifications.ts';

const config = await readConfig();
const previous = await readHistory();
const sample = { at: new Date().toISOString(), checks: await Promise.all(config.checks.map(probe)) };
const slack = config.notifications?.slack;
const events = slack?.enabled ? transitions(previous, sample, slack.notifyOnRecovery) : [];
await appendSample(sample, events, !slack?.enabled);
console.log(`${sample.at}: ${sample.checks.map(({ id, status }) => `${id}=${status}`).join(', ')}`);
