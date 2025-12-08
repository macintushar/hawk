import { AllowedHTTPCheckMethods } from "@hawk/types";

export type CheckHTTPProps = {
  url: string;
  timeout: number;
  method: AllowedHTTPCheckMethods;
  headers?: Record<string, string>;
  body?: string;
};

type CheckHTTPResponse = {
  status: number;
  responseTime: number;
  body: Record<string, string | number | boolean | undefined | null>;
  headers: Record<string, string>;
};

class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export default async function checkHttp(
  req: CheckHTTPProps,
): Promise<CheckHTTPResponse> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();

    // Create timeout promise that aborts the request
    const timeoutPromise = (async () => {
      await Bun.sleep(req.timeout);
      controller.abort();
      throw new TimeoutError(`Request timed out after ${req.timeout}ms`);
    })();

    // Create fetch promise
    const fetchPromise = fetch(req.url, {
      method: req.method,
      headers: req.headers,
      body: req.method === "GET" ? undefined : req.body,
      signal: controller.signal,
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const responseTime = Date.now() - startTime;

    const responseHeaders = response.headers.toJSON();

    let responseBody: Record<
      string,
      string | number | boolean | undefined | null
    >;
    const text = await response.text();
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = { text };
    }

    return {
      status: response.status,
      responseTime,
      body: responseBody,
      headers: responseHeaders,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Handle timeout errors
    if (error instanceof TimeoutError) {
      return {
        status: 408,
        responseTime,
        body: { error: "Request timed out" },
        headers: {},
      };
    }

    // Handle other errors
    if (error instanceof Error) {
      return {
        status: 500,
        responseTime,
        body: { error: error.message },
        headers: {},
      };
    }

    // Fallback for unknown error types
    return {
      status: 500,
      responseTime,
      body: { error: String(error) },
      headers: {},
    };
  }
}
