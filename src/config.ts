import { readFile } from 'node:fs/promises';
import type { Config, Incidents } from './types.ts';

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
function url(value: unknown): boolean {
  if (!text(value)) return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
function timestamp(value: unknown): boolean {
  return text(value) && !Number.isNaN(Date.parse(value));
}
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid configuration: ${message}`);
}

export function validateConfig(input: unknown): Config {
  assert(object(input) && input.version === 1, 'version must be 1');
  if (input.notifications !== undefined) {
    assert(object(input.notifications), 'notifications must be an object');
    if (input.notifications.slack !== undefined) {
      const slack = input.notifications.slack;
      assert(object(slack) && typeof slack.enabled === 'boolean', 'notifications.slack.enabled must be boolean');
      assert(slack.notifyOnRecovery === undefined || typeof slack.notifyOnRecovery === 'boolean', 'notifications.slack.notifyOnRecovery must be boolean');
    }
  }
  const site = input.site;
  assert(object(site) && text(site.title), 'site.title is required');
  assert(site.description === undefined || typeof site.description === 'string', 'site.description must be text');
  assert(site.homeUrl === undefined || url(site.homeUrl), 'site.homeUrl must be an HTTP(S) URL');
  assert(Number.isInteger(site.staleAfterMinutes) && (site.staleAfterMinutes as number) > 0, 'site.staleAfterMinutes must be positive');
  assert(object(site.theme), 'site.theme is required');
  for (const key of ['accent', 'background', 'surface', 'text']) {
    assert(typeof site.theme[key] === 'string' && /^#[0-9a-fA-F]{6}$/.test(site.theme[key]), `site.theme.${key} must be a six-digit hex color`);
  }
  assert(Array.isArray(input.groups) && input.groups.length > 0, 'at least one group is required');
  const groups = new Set<string>();
  for (const group of input.groups) {
    assert(object(group) && text(group.id) && /^[a-z0-9-]+$/.test(group.id) && text(group.name), 'each group needs a slug id and name');
    assert(!groups.has(group.id), `duplicate group ${group.id}`);
    groups.add(group.id);
  }
  assert(Array.isArray(input.checks) && input.checks.length > 0, 'at least one check is required');
  const ids = new Set<string>();
  for (const check of input.checks) {
    assert(object(check) && text(check.id) && /^[a-z0-9-]+$/.test(check.id) && text(check.name), 'each check needs a slug id and name');
    assert(!ids.has(check.id), `duplicate check ${check.id}`);
    ids.add(check.id);
    assert(typeof check.group === 'string' && groups.has(check.group), `unknown group for ${check.id}`);
    assert(check.publicUrl === undefined || url(check.publicUrl), `invalid publicUrl for ${check.id}`);
    assert(object(check.monitor), `missing monitor for ${check.id}`);
    const monitor = check.monitor;
    assert(monitor.timeoutMs === undefined || (Number.isInteger(monitor.timeoutMs) && (monitor.timeoutMs as number) >= 100 && (monitor.timeoutMs as number) <= 120000), `invalid timeout for ${check.id}`);
    if (monitor.type === 'http') {
      assert(url(monitor.url), `invalid HTTP(S) URL for ${check.id}`);
      assert(monitor.expectedStatus === undefined || (Number.isInteger(monitor.expectedStatus) && (monitor.expectedStatus as number) >= 100 && (monitor.expectedStatus as number) <= 599), `invalid expectedStatus for ${check.id}`);
      if (monitor.headersFromEnv !== undefined) {
        assert(object(monitor.headersFromEnv), `invalid headersFromEnv for ${check.id}`);
        for (const [header, env] of Object.entries(monitor.headersFromEnv)) {
          assert(/^[A-Za-z0-9-]+$/.test(header) && text(env) && /^[A-Za-z_][A-Za-z0-9_]*$/.test(env), `invalid header/env mapping for ${check.id}`);
        }
      }
    } else if (monitor.type === 'tcp') {
      assert(text(monitor.host) && Number.isInteger(monitor.port) && (monitor.port as number) >= 1 && (monitor.port as number) <= 65535, `invalid TCP target for ${check.id}`);
    } else {
      throw new Error(`Invalid configuration: unsupported monitor type for ${check.id}`);
    }
  }
  return input as Config;
}

export function validateIncidents(input: unknown, checkIds: Set<string>): Incidents {
  assert(object(input) && input.version === 1 && Array.isArray(input.incidents), 'incidents file must have version 1 and incidents array');
  const ids = new Set<string>();
  for (const incident of input.incidents) {
    assert(object(incident) && text(incident.id) && text(incident.title) && timestamp(incident.startedAt), 'incident needs id, title and startedAt');
    assert(!ids.has(incident.id), `duplicate incident ${incident.id}`);
    ids.add(incident.id);
    assert(['investigating', 'identified', 'monitoring', 'resolved'].includes(String(incident.status)), `invalid status for incident ${incident.id}`);
    assert(incident.resolvedAt === undefined || timestamp(incident.resolvedAt), `invalid resolvedAt for incident ${incident.id}`);
    assert((incident.status === 'resolved') === (incident.resolvedAt !== undefined), `resolved status and resolvedAt must agree for ${incident.id}`);
    assert(Array.isArray(incident.checkIds) && incident.checkIds.every((id: unknown) => typeof id === 'string' && checkIds.has(id)), `unknown check in incident ${incident.id}`);
    assert(Array.isArray(incident.updates) && incident.updates.every((update: unknown) => object(update) && timestamp(update.at) && text(update.message)), `invalid updates for incident ${incident.id}`);
  }
  return input as Incidents;
}

export async function readConfig(): Promise<Config> {
  return validateConfig(JSON.parse(await readFile('config/status.json', 'utf8')));
}
