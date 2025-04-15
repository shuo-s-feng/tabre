import { convertUrlToPattern } from "./url-pattern";
import { RequestDefinitionFile } from "../types/request-definition";
import { encodeUrl } from "./url";
import {
  request as sendRequestDirectly,
  RequestResponse,
  isRequestResponse,
} from "./request";
import { fillTemplateWithParams } from "./template";
import { QUERY_STRING_BUILDER_MAP } from "../constants/request-with-definition";
import { get } from "geton";
import { parseData } from "./data-parser";
import { sendRequestOnTab } from "./request-on-tab";

const getRequestParams = (
  definition: RequestDefinitionFile,
  params: Record<string, string>
) => {
  let url = "";
  if (definition.request.queryStringBuilder) {
    const queryStringBuilder =
      QUERY_STRING_BUILDER_MAP[definition.request.queryStringBuilder];

    if (queryStringBuilder) {
      const queryString = queryStringBuilder(params);
      url = `${definition.request.domain}${definition.request.endpoint}?${queryString}`;
    } else {
      throw new Error(
        `Unknown queryStringBuilder: ${definition.request.queryStringBuilder}`
      );
    }
  } else {
    const baseUrl = fillTemplateWithParams(
      definition.request.domain + definition.request.endpoint,
      params
    );
    const queryParams = Object.entries(
      definition.request.queryParameters ?? {}
    ).map(([key, value]) => {
      return {
        key,
        value: fillTemplateWithParams(value, params),
        equalSign: true,
      };
    });
    url = encodeUrl(baseUrl, queryParams);
  }

  const headers = Object.entries(definition.request.headers ?? {}).reduce(
    (acc, [key, value]) => {
      acc[key] = fillTemplateWithParams(value, params);
      return acc;
    },
    {} as Record<string, string>
  );

  const init = {
    method: definition.request.method,
    headers,
    body: definition.request.body
      ? fillTemplateWithParams(JSON.stringify(definition.request.body), params)
      : null,
  };

  const tabQuery = definition.request.queryTab ?? {
    url: convertUrlToPattern(url),
  };

  return { url, init, tabQuery };
};

export const parseResponse = (
  definition: RequestDefinitionFile,
  response: RequestResponse
) => {
  const originalResponse = response;
  const responseString = JSON.stringify(response, null, 2);
  let parsedResponseString: string | undefined;

  if (
    definition.response?.successfulStatusCodes?.includes(response.statusCode)
  ) {
    try {
      const parsedResult = parseData(
        response,
        definition.response?.parsingJs ??
          definition.response?.parsingConfig ??
          {}
      );
      parsedResponseString = JSON.stringify(parsedResult, null, 2);
    } catch (error) {
      console.error("Error parsing:", error);
      parsedResponseString = `Error parsing: ${error}`;
    }
  } else {
    parsedResponseString = `Unexpected status code: ${response.statusCode}`;
  }

  return { originalResponse, responseString, parsedResponseString };
};

const preprocessParam = async (
  preprocess: {
    endpoint: string;
    params: Record<string, string>;
    return: string;
  },
  params: Record<string, string>
): Promise<string> => {
  const preprocessDef = await (
    await fetch(`${preprocess.endpoint}.json`)
  ).json();

  // The preprocess should only need the params filled in
  const preprocessParams = Object.entries(preprocess.params)
    .map(([key, value]) => [key, value?.toString()])
    .reduce((acc, [key, value]) => {
      acc[key] = fillTemplateWithParams(value, params);
      return acc;
    }, {} as Record<string, string>);

  // Make the preprocessing request
  const result = await requestWithDefinition(preprocessDef, preprocessParams);

  const { parsedResponseString } = result;

  if (!parsedResponseString) {
    throw new Error(
      `Failed to preprocess request: ${JSON.stringify(preprocess)}`
    );
  }

  try {
    // Parse the response to get the final preprocess result
    const parsedResponse = JSON.parse(parsedResponseString);
    return String(get(preprocess.return, parsedResponse));
  } catch (error) {
    console.error("Error parsing preprocess result:", error);
    throw new Error(
      `Failed to parse preprocess result: ${parsedResponseString}`
    );
  }
};

export const requestWithDefinition = async (
  definition: RequestDefinitionFile,
  params: Record<string, string>
) => {
  const finalParams: Record<string, string> = {};

  // Preprocess parameters if needed and handle default values
  for (const [key, paramDef] of Object.entries(definition.params)) {
    const value = params[key];

    // If value is provided in params, use it
    if (value !== undefined && value !== "") {
      // If preprocess is defined, preprocess the value
      if (paramDef.preprocess) {
        const newValue = await preprocessParam(paramDef.preprocess, params);

        // If a new key is defined, use it
        if (paramDef.preprocess.newKey) {
          finalParams[paramDef.preprocess.newKey] = newValue;
        } else {
          finalParams[key] = newValue;
        }
      }
      // If no preprocess is defined, use the value directly provided
      else {
        finalParams[key] = value;
      }
    }
    // If no value provided but default exists, use default
    else if (paramDef.default !== undefined && paramDef.default !== "") {
      finalParams[key] = String(paramDef.default);
    }
    // If no value and no default, and parameter is required, throw error
    else if (paramDef.required) {
      throw new Error(
        `Required parameter '${key}' is missing and has no default value`
      );
    }
  }

  const { url, init, tabQuery } = getRequestParams(definition, finalParams);

  const response = await (definition.request.requestInitiator === "tab"
    ? sendRequestOnTab({
        url,
        init,
        requestMethodType: definition.request.requestMethodType,
        tabQuery,
      })
    : sendRequestDirectly({
        url,
        init,
        requestMethodType: definition.request.requestMethodType,
      }));

  if (isRequestResponse(response)) {
    return parseResponse(definition, response);
  } else {
    if (
      response ===
      "Error: Could not establish connection. Receiving end does not exist."
    ) {
      throw new Error(
        `Could not establish connection. You might need to refresh the tab(s) matching ${tabQuery.url} .`
      );
    } else if (response === "Error: No active tab found.") {
      throw new Error(
        `No active tab found. You might need to open a tab matching ${tabQuery.url} .`
      );
    }

    throw new Error(response);
  }
};

export const requestWithDefinitionPath = async (
  definitionPath: string,
  params: Record<string, string>
) => {
  const definition = await (await fetch(definitionPath)).json();
  return requestWithDefinition(definition, params);
};
