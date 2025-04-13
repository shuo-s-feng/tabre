export interface Request {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: FormData | string | null | undefined;
  params?: Record<string, string>;
  requestMethodType?: "fetch" | "xhr";
}

export const isRequest = (request: unknown): request is Request => {
  return (
    typeof request === "object" &&
    request !== null &&
    "url" in request &&
    "method" in request
  );
};

export interface RequestPayload {
  request: Request;
  tabQuery: chrome.tabs.QueryInfo;
}

export const isRequestPayload = (data: unknown): data is RequestPayload => {
  return (
    typeof data === "object" &&
    data !== null &&
    "request" in data &&
    "tabQuery" in data
  );
};
