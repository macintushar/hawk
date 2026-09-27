import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createTcpServer } from 'node:net';
import { after, before, test } from 'node:test';
import { validateConfig, validateIncidents } from '../src/config.ts';
import { validateHistory } from '../src/history.ts';
import { probe } from '../src/probe.ts';
import { makeSnapshot } from '../src/snapshot.ts';
import { deliverSlack, slackWebhookUrl, transitions } from '../src/notifications.ts';

let httpPort: number;
let tcpPort: number;
const http = createHttpServer((request, response) => {
  response.writeHead(request.url === '/fail' ? 503 : 200);
  response.end('ok');
});
const tcp = createTcpServer(socket => socket.end());

before(async () => {
  await new Promise<void>(resolve => http.listen(0, '127.0.0.1', resolve));
  await new Promise<void>(resolve => tcp.listen(0, '127.0.0.1', resolve));
  httpPort = (http.address() as { port: number }).port;
  tcpPort = (tcp.address() as { port: number }).port;
});
after(async () => {
  await new Promise<void>(resolve => http.close(() => resolve()));
  await new Promise<void>(resolve => tcp.close(() => resolve()));
});

const base = {
  version: 1, site: { title: 'Test', staleAfterMinutes: 45, theme: { accent: '#123456', background: '#ffffff', surface: '#ffffff', text: '#000000' } },
  groups: [{ id: 'core', name: 'Core' }],
  checks: [{ id: 'api', name: 'API', group: 'core', monitor: { type: 'http', url: 'https://example.com' } }]
};

test('configuration validates IDs, targets and groups', () => {
  assert.equal(validateConfig(base).checks[0].id, 'api');
  assert.throws(() => validateConfig({ ...base, checks: [...base.checks, ...base.checks] }), /duplicate check/);
  assert.throws(() => validateConfig({ ...base, checks: [{ ...base.checks[0], group: 'absent' }] }), /unknown group/);
  assert.throws(() => validateConfig({ ...base, checks: [{ ...base.checks[0], monitor: { type: 'http', url: 'file:\/\/secret' } }] }), /invalid HTTP/);
});

test('HTTP checks measure successes, failures and expected statuses', async () => {
  const check = { ...base.checks[0], monitor: { type: 'http' as const, url: `http://127.0.0.1:${httpPort}/ok`, timeoutMs: 1000 } };
  assert.equal((await probe(check)).status, 'up');
  assert.equal((await probe({ ...check, monitor: { ...check.monitor, url: `http://127.0.0.1:${httpPort}/fail` } })).status, 'down');
  assert.equal((await probe({ ...check, monitor: { ...check.monitor, url: `http://127.0.0.1:${httpPort}/fail`, expectedStatus: 503 } })).status, 'up');
});

test('TCP check and missing secret behavior', async () => {
  const check = { ...base.checks[0], monitor: { type: 'tcp' as const, host: '127.0.0.1', port: tcpPort, timeoutMs: 1000 } };
  assert.equal((await probe(check)).status, 'up');
  await assert.rejects(probe({ ...base.checks[0], monitor: { type: 'http', url: `http://127.0.0.1:${httpPort}`, headersFromEnv: { Authorization: 'HAWK_TEST_MISSING_SECRET' } } }), /Missing required environment/);
});

test('history and manual incidents reject malformed records', () => {
  assert.deepEqual(validateHistory({ version: 1, samples: [] }).samples, []);
  assert.throws(() => validateHistory({ version: 1, samples: [{ at: 'bad', checks: [] }] }), /malformed sample/);
  const incident = { id: 'outage', title: 'API unavailable', status: 'resolved', startedAt: '2026-01-01T00:00:00Z', resolvedAt: '2026-01-01T00:30:00Z', checkIds: ['api'], updates: [{ at: '2026-01-01T00:00:00Z', message: 'Investigating' }] };
  assert.equal(validateIncidents({ version: 1, incidents: [incident] }, new Set(['api'])).incidents.length, 1);
  assert.throws(() => validateIncidents({ version: 1, incidents: [{ ...incident, checkIds: ['unknown'] }] }, new Set(['api'])), /unknown check/);
});

test('published snapshot excludes private probe fields and unexpected data', () => {
  const config = validateConfig({ ...base, site: { ...base.site, secret: 'PRIVATE' }, checks: [{ ...base.checks[0], monitor: { type: 'http', url: 'https://private.example', headersFromEnv: { Authorization: 'TOKEN' } } }] });
  const history = validateHistory({ version: 1, samples: [{ at: '2026-01-01T00:00:00Z', checks: [{ id: 'api', status: 'up', latencyMs: 10, secret: 'PRIVATE' }] }] });
  const serialized = JSON.stringify(makeSnapshot(config, history, { version: 1, incidents: [] }));
  assert.ok(!serialized.includes('PRIVATE'));
  assert.ok(!serialized.includes('private.example'));
  assert.ok(!serialized.includes('TOKEN'));
  assert.ok(serialized.includes('api'));
});

test('Slack config is validated and never appears in public snapshot', () => {
  const config = validateConfig({ ...base, notifications: { slack: { enabled: true, notifyOnRecovery: false } } });
  const history = validateHistory({ version: 1, samples: [], notificationQueue: [{ at: '2026-01-01T00:00:00Z', checkId: 'api', status: 'down' }] });
  const publicData = JSON.stringify(makeSnapshot(config, history, { version: 1, incidents: [] }));
  assert.ok(!publicData.includes('notifications'));
  assert.ok(!publicData.includes('notificationQueue'));
  assert.throws(() => validateConfig({ ...base, notifications: { slack: { enabled: 'yes' } } }), /enabled must be boolean/);
});

test('notifications are generated for first failures, transitions and recoveries only', () => {
  const at = '2026-01-01T00:00:00Z';
  const down = { at, checks: [{ id: 'api', status: 'down' as const, latencyMs: null }] };
  const up = { at: '2026-01-01T00:15:00Z', checks: [{ id: 'api', status: 'up' as const, latencyMs: 20 }] };
  assert.deepEqual(transitions({ version: 1, samples: [] }, down), [{ at, checkId: 'api', status: 'down' }]);
  assert.deepEqual(transitions({ version: 1, samples: [down] }, down), []);
  assert.deepEqual(transitions({ version: 1, samples: [down] }, up), [{ at: up.at, checkId: 'api', status: 'up' }]);
  assert.deepEqual(transitions({ version: 1, samples: [down] }, up, false), []);
  assert.deepEqual(transitions({ version: 1, samples: [up] }, up), []);
});

test('Slack delivery keeps failed and later events queued, without leaking secrets', async () => {
  const webhook = 'https://hooks.slack.com/services/T/B/secret';
  assert.equal(slackWebhookUrl(webhook), webhook);
  assert.throws(() => slackWebhookUrl('https://example.com/services/T/B/secret'), /Slack incoming webhook/);
  const queue = [
    { at: '2026-01-01T00:00:00Z', checkId: 'api', status: 'down' as const },
    { at: '2026-01-01T00:15:00Z', checkId: 'api', status: 'up' as const }
  ];
  const requests: string[] = [];
  const send = (async (url: string | URL | Request, options?: RequestInit) => {
    assert.equal(String(url), webhook);
    assert.equal(options?.redirect, 'error');
    requests.push(String(options?.body));
    return new Response('', { status: requests.length === 1 ? 200 : 503 });
  }) as typeof fetch;
  const result = await deliverSlack(queue, webhook, 'Test', validateConfig(base).checks, send);
  assert.deepEqual(result, { remaining: [queue[1]], sent: 1, failed: true });
  assert.ok(requests[0].includes('Disruption'));
  assert.ok(!requests[0].includes('secret'));
});
