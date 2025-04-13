export interface QueryParam {
  key: string;
  value: string;
  equalSign: boolean;
}

export const isValidUrl = (str: string): boolean => {
  try {
    new URL(str);
    return str.includes("https://");
  } catch {
    return false;
  }
};

/**
 * Encodes a base URL and query parameters into a full URL
 * @param baseUrl - Base URL without query parameters
 * @param queryParams - Object containing query parameters
 * @returns Full URL string
 */
export const encodeUrl = (
  baseUrl: string,
  queryParams: QueryParam[],
  questionMark?: boolean
): string => {
  const queryString = queryParams
    .map(({ key, value, equalSign }) =>
      key && equalSign ? `${key}=${value}` : key
    )
    .join("&");

  let finalUrl = baseUrl;
  if (questionMark || queryString) {
    finalUrl = baseUrl + "?";
  }

  if (queryString) {
    finalUrl += queryString;
  }

  return finalUrl;
};
