import { decodeQueryStringV1, decodeQueryStringV2 } from "./decoders";
import { encodeQueryParamsV1, encodeQueryParamsV2 } from "./encoders";

type ListEncodingSchema = "v1" | "v2";

// Determines the list encoding schema based on the URL
const getListEncodingSchema = (url: string): ListEncodingSchema => {
  if (url.includes("https://www.linkedin.com/voyager/api")) {
    return "v2";
  } else if (
    url.includes("https://www.linkedin.com/jobs/search") ||
    url.includes(
      "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"
    )
  ) {
    return "v1";
  } else {
    throw new Error(`Unknown URL for determining list encoding schema: ${url}`);
  }
};

const isEmpty = (value: unknown): boolean => {
  return value === undefined || value === null;
};

// Recursively removes undefined values from dictionaries and lists
export const pruneEmptyValues = <T>(data: T): T => {
  if (typeof data === "object" && !Array.isArray(data) && data !== null) {
    const pruned = {} as Record<keyof T, unknown>;
    Object.keys(data as object).forEach((key) => {
      const value = pruneEmptyValues((data as Record<string, unknown>)[key]);
      if (!isEmpty(value)) {
        pruned[key as keyof T] = value;
      }
    });
    return pruned as T;
  } else if (Array.isArray(data)) {
    return data
      .map((item) => pruneEmptyValues(item))
      .filter((item) => !isEmpty(item)) as T;
  }
  return data;
};

// Parses a URL and decodes query parameters based on the schema
export const parseUrl = (
  url: string,
  schema?: ListEncodingSchema
): [string, Record<string, unknown>] => {
  const urlObj = new URL(url);
  const path = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  const queryString = urlObj.search.substring(1); // Remove the leading "?"

  schema = schema || getListEncodingSchema(url);
  let queryParams: Record<string, unknown> = {};

  if (schema === "v1") {
    queryParams = decodeQueryStringV1(queryString);
  } else if (schema === "v2") {
    queryParams = decodeQueryStringV2(queryString);
  }

  return [path, queryParams];
};

// Builds a URL from a path and query parameters, encoding them based on the schema
export const buildUrl = (
  path: string,
  queryParams: Record<string, unknown>,
  schema?: ListEncodingSchema
): string => {
  schema = schema || getListEncodingSchema(path);
  let queryString = "";

  const prunedParams = pruneEmptyValues(queryParams);

  if (schema === "v1") {
    queryString = encodeQueryParamsV1(prunedParams);
  } else if (schema === "v2") {
    queryString = encodeQueryParamsV2(prunedParams);
  }

  return queryString ? `${path}?${queryString}` : path;
};
