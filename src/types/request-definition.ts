export interface ParserConfig {
  [key: string]: string;
}
export interface DynamicParserConfig {
  code: string;
}

export type RequestMethodType = "fetch" | "xhr";

export interface RequestParamDefinition {
  type: string;
  description: string;
  example?: string;
  required?: boolean;
  default?:
    | string
    | number
    | boolean
    | null
    | Record<string, unknown>
    | Array<unknown>;
  preprocess?: {
    endpoint: string;
    params: Record<string, string>;
    return: string;
    newKey?: string;
  };
}

export interface RequestDefinitionParams {
  [key: string]: RequestParamDefinition;
}

export interface RequestQueryParameters {
  [key: string]: string;
}

export interface RequestHeaders {
  [key: string]: string;
}

export interface ParsingConfig {
  [key: string]: string;
}

export interface QueryTab {
  url: string;
}

export interface RequestResponse {
  successfulStatusCodes: number[];
  parsingConfig: ParsingConfig;
}

export type RequestInitiator = "tab" | "direct";

export interface RequestDefinition {
  name: string;
  description: string;
  method: string;
  domain: string;
  endpoint: string;
  queryParameters: RequestQueryParameters;
  headers: RequestHeaders;
  queryTab?: QueryTab;
  requestMethodType: RequestMethodType;
  requestInitiator: RequestInitiator;
}

export interface RequestDefinitionFile {
  id: string;
  params: Record<string, RequestParamDefinition>;
  request: {
    name: string;
    description: string;
    method: string;
    domain: string;
    endpoint: string;
    queryParameters?: Record<string, string>;
    queryStringBuilder?: string;
    headers?: Record<string, string>;
    body?: Record<
      string,
      | string
      | number
      | boolean
      | null
      | Record<string, unknown>
      | Array<unknown>
    >;
    queryTab?: {
      url: string;
    };
    requestInitiator?: string;
    requestMethodType?: RequestMethodType;
  };
  response?: {
    successfulStatusCodes?: number[];
    parsingConfig?: ParsingConfig;
    parsingJs?: DynamicParserConfig;
  };
}
