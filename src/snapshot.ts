import type { Config, History, Incidents } from './types.ts';

export function makeSnapshot(config: Config, history: History, incidents: Incidents) {
  const { title, description, homeUrl, staleAfterMinutes, theme, logo } = config.site;
  return {
    config: {
      version: 1,
      site: {
        title, description, homeUrl, staleAfterMinutes,
        theme: { accent: theme.accent, background: theme.background, surface: theme.surface, text: theme.text },
        ...(logo && { logo: {
          src: logo.src, darkSrc: logo.darkSrc, text: logo.text, alt: logo.alt,
          maxWidth: logo.maxWidth, maxHeight: logo.maxHeight
        } })
      },
      groups: config.groups.map(({ id, name, description }) => ({ id, name, description })),
      checks: config.checks.map(({ id, name, description, group, publicUrl }) => ({ id, name, description, group, publicUrl }))
    },
    history: {
      version: 1,
      samples: history.samples.map(sample => ({ at: sample.at, checks: sample.checks.map(({ id, status, latencyMs }) => ({ id, status, latencyMs })) }))
    },
    incidents: {
      version: 1,
      incidents: incidents.incidents.map(({ id, title, status, startedAt, resolvedAt, checkIds, updates }) => ({
        id, title, status, startedAt, resolvedAt, checkIds,
        updates: updates.map(({ at, message }) => ({ at, message }))
      }))
    }
  };
}
