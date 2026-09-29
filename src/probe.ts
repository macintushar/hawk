import { connect } from 'node:net';
import type { Check, Result } from './types.ts';

export async function probe(check: Check): Promise<Result> {
  const start = performance.now();
  const timeout = check.monitor.timeoutMs ?? 10000;
  const headers: Record<string, string> = {};
  if (check.monitor.type === 'http') {
    for (const [name, env] of Object.entries(check.monitor.headersFromEnv ?? {})) {
      const value = process.env[env];
      if (!value) throw new Error(`Missing required environment variable ${env} for ${check.id}`);
      headers[name] = value;
    }
  }
  try {
    if (check.monitor.type === 'http') {
      const { url, expectedStatus } = check.monitor;
      const response = await fetch(url, { method: 'GET', headers, signal: AbortSignal.timeout(timeout), cache: 'no-store' });
      const up = expectedStatus === undefined ? response.ok : response.status === expectedStatus;
      await response.body?.cancel();
      return { id: check.id, status: up ? 'up' : 'down', latencyMs: Math.round(performance.now() - start), ...(!up && { detail: `HTTP ${response.status}` }) };
    }
    const { host, port } = check.monitor;
    await new Promise<void>((resolve, reject) => {
      const socket = connect({ host, port });
      socket.setTimeout(timeout);
      socket.once('connect', () => { socket.destroy(); resolve(); });
      socket.once('timeout', () => socket.destroy(new Error('connection timed out')));
      socket.once('error', reject);
    });
    return { id: check.id, status: 'up', latencyMs: Math.round(performance.now() - start) };
  } catch (error) {
    // Do not persist error messages: they can contain target URLs or credentials.
    return { id: check.id, status: 'down', latencyMs: null, detail: 'Connection failed or timed out' };
  }
}
