export interface RequestResponse {
  ok: boolean;
  statusCode: number;
  statusText: string;
  body: unknown;
  headers: Record<string, string>;
  redirected: boolean;
  type: string;
  url: string;
}

export const isRequestResponse = (value: unknown): value is RequestResponse => {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    "statusCode" in value &&
    "statusText" in value &&
    "body" in value &&
    "headers" in value &&
    "redirected" in value &&
    "type" in value &&
    "url" in value
  );
};

export const advancedFetch = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<RequestResponse> => {
  const response = await fetch(input, init);
  let body: unknown = null;

  // If content-type is available, use it to decide the parsing method.
  const contentType = response.headers.get("content-type")?.toLowerCase();
  if (contentType) {
    if (contentType.includes("application/json")) {
      body = await response.json();
    } else if (contentType.includes("text/")) {
      body = await response.text();
    } else if (contentType.includes("multipart/form-data")) {
      body = await response.formData();
    } else if (contentType.includes("application/octet-stream")) {
      body = await response.arrayBuffer();
    } else if (contentType.includes("image/")) {
      body = await response.blob();
    }
  }

  // If content type isn't specified or isn't recognized,
  // try auto-detecting by attempting one parser after the other.
  // Cloning is necessary because the response body is a stream
  // and can only be read once per clone.
  try {
    body = await response.clone().json();
  } catch {
    // JSON parsing failed; try text.
  }
  try {
    body = await response.clone().text();
  } catch {
    // Text parsing failed; try blob.
  }
  try {
    body = await response.clone().blob();
  } catch {
    // All parsing attempts failed; return the raw response.
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    ok: response.ok,
    statusCode: response.status,
    statusText: response.statusText,
    headers,
    redirected: response.redirected,
    type: response.type,
    url: response.url,
    body,
  };
};

export const advancedXmlRequest = async (
  input: string | URL,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | FormData | null;
    responseType?: XMLHttpRequestResponseType;
    withCredentials?: boolean;
    timeout?: number;
  }
): Promise<RequestResponse> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = init?.method || "GET";
    const url = input instanceof URL ? input.toString() : input;

    xhr.open(method, url, true);
    xhr.responseType = init?.responseType || "";
    xhr.withCredentials = init?.withCredentials || true;

    if (init?.timeout) {
      xhr.timeout = init.timeout;
    }

    // Set headers
    if (init?.headers) {
      Object.entries(init.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.onload = () => {
      let body: unknown = null;
      const contentType = xhr.getResponseHeader("content-type")?.toLowerCase();

      try {
        if (contentType?.includes("application/json")) {
          body = JSON.parse(xhr.responseText);
        } else if (contentType?.includes("text/")) {
          body = xhr.responseText;
        } else if (
          contentType?.includes("application/xml") ||
          contentType?.includes("text/xml")
        ) {
          body = xhr.responseXML || xhr.responseText;
        } else if (xhr.response instanceof Blob) {
          body = xhr.response;
        } else {
          body = xhr.response || xhr.responseText;
        }

        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          redirected: xhr.status >= 300 && xhr.status < 400,
          statusCode: xhr.status,
          statusText: xhr.statusText,
          headers: xhr
            .getAllResponseHeaders()
            .split("\r\n")
            .filter((line) => line)
            .reduce((acc, line) => {
              const [key, value] = line.split(": ");
              acc[key.toLowerCase()] = value;
              return acc;
            }, {} as Record<string, string>),
          body,
          type: xhr.responseType,
          url: xhr.responseURL,
        });
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error}`));
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(`Network error occurred: ${xhr.status} ${xhr.statusText}`)
      );
    };

    xhr.ontimeout = () => {
      reject(new Error(`Request timed out after ${xhr.timeout}ms`));
    };

    try {
      xhr.send(init?.body || null);
    } catch (error) {
      reject(new Error(`Failed to send request: ${error}`));
    }
  });
};

export type XmlRequestInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string | FormData | null;
  responseType?: XMLHttpRequestResponseType;
  withCredentials?: boolean;
  timeout?: number;
};

export type RequestMethodType = "fetch" | "xhr";

export type RequestInitType<T extends RequestMethodType> = T extends "fetch"
  ? RequestInit
  : XmlRequestInit;

export function request<T extends RequestMethodType>(params: {
  url: string | URL;
  init: RequestInitType<T>;
  requestMethodType?: T;
}): Promise<RequestResponse>;

export function request(params: {
  url: string | URL;
  init?: RequestInit | XmlRequestInit;
  requestMethodType?: RequestMethodType;
}): Promise<RequestResponse> {
  const { url, init, requestMethodType = "fetch" } = params;

  if (requestMethodType === "fetch") {
    return advancedFetch(url, init as RequestInit);
  } else {
    return advancedXmlRequest(url, init as XmlRequestInit);
  }
}
