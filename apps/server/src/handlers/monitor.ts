import { Monitor, MonitorStatus } from "@hawk/types";
import checkHttp, { type CheckHTTPProps } from "../checks/http";

type CheckMonitorResponse = {
  status: MonitorStatus;
  metadata?: Record<string, any>;
};

export async function checkMonitor(
  monitor: Monitor,
): Promise<CheckMonitorResponse> {
  switch (monitor.type) {
    case "HTTP":
      const checkPayload: CheckHTTPProps = {
        url: monitor.url,
        timeout: monitor.timeout,
        method: monitor.method,
        headers: monitor.headers,
        body: monitor.body,
      };
      const result = await checkHttp(checkPayload);
      if (result.status < 300 && result.status >= 200) {
        return {
          status: "up",
          metadata: result,
        };
      } else {
        return {
          status: "down",
          metadata: result,
        };
      }
    default:
      throw new Error(`Unsupported monitor type: ${monitor.type}`);
  }
}
