export type Check = {
  id: string;
  name: string;
  description?: string;
  group: string;
  publicUrl?: string;
  monitor: (
    | { type: 'http'; url: string; expectedStatus?: number; headersFromEnv?: Record<string, string> }
    | { type: 'tcp'; host: string; port: number }
  ) & { timeoutMs?: number };
};

export type Config = {
  version: 1;
  notifications?: { slack?: { enabled: boolean; notifyOnRecovery?: boolean } };
  site: {
    title: string;
    description?: string;
    homeUrl?: string;
    staleAfterMinutes: number;
    theme: { accent: string; background: string; surface: string; text: string };
  };
  groups: { id: string; name: string; description?: string }[];
  checks: Check[];
};

export type Result = { id: string; status: 'up' | 'down'; latencyMs: number | null; detail?: string };
export type Sample = { at: string; checks: Result[] };
export type NotificationEvent = { at: string; checkId: string; status: 'down' | 'up' };
export type History = { version: 1; samples: Sample[]; notificationQueue?: NotificationEvent[] };
export type Incident = {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  startedAt: string;
  resolvedAt?: string;
  checkIds: string[];
  updates: { at: string; message: string }[];
};
export type Incidents = { version: 1; incidents: Incident[] };
