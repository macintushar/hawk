export interface SlackMessage {
  text: string;
  channel?: string;
}

export async function sendSlackMessage(
  webhookUrl: string | undefined,
  message: SlackMessage,
): Promise<{ ok: boolean; error?: string }> {
  if (!webhookUrl) {
    return { ok: false, error: "Missing Slack webhook URL" };
  }

  try {
    const payload: Record<string, unknown> = { text: message.text };
    if (message.channel) payload.channel = message.channel;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Slack responded ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export function formatMonitorDownMessage(params: {
  monitorName: string;
  url: string;
}): string {
  return `:rotating_light: ${params.monitorName} is DOWN\nURL: ${params.url}`;
}

export function formatMonitorUpMessage(params: {
  monitorName: string;
  url: string;
}): string {
  return `:white_check_mark: ${params.monitorName} is back UP\nURL: ${params.url}`;
}
