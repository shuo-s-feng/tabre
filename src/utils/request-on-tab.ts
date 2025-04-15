import { Message, Action } from "../types/message";
import { RequestPayload } from "../types/request-on-tab";
import { getActionId } from "./action";
import { RequestResponse } from "./request";

const EXTENSION_ID = "gbjmofioeokcjcpmdpcpoelpkljihdjg";

export interface RequestOnTabParams {
  url: string;
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | FormData | null | undefined;
  };
  requestMethodType?: "fetch" | "xhr";
  tabQuery: { url: string };
}

export const sendRequestOnTab = async (
  request: RequestOnTabParams
): Promise<RequestResponse | string> => {
  const {
    url,
    init: { method = "GET", headers = {}, body = null },
    requestMethodType = "fetch",
    tabQuery,
  } = request;

  const message: Message<RequestPayload> = {
    id: getActionId(),
    action: Action.FetchAPIOnTargetWebsite,
    status: "pending",
    payload: {
      request: {
        url,
        method,
        headers,
        body,
        requestMethodType,
      },
      tabQuery,
    },
  };

  if (!chrome?.runtime?.sendMessage) {
    throw new Error("Chrome runtime is not available");
  }

  return chrome.runtime
    .sendMessage(EXTENSION_ID, message)
    .then((response) => response.payload);
};
