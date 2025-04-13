/* eslint-disable @typescript-eslint/no-unused-vars */
function encodeQueryParamV1(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(encodeQueryParamV1).join("%2C");
  } else if (typeof value === "object" && value !== null) {
    throw new Error(
      `Invalid dictionary value detected: ${JSON.stringify(value)}`
    );
  } else {
    if (value === true) {
      return "true";
    } else if (value === false) {
      return "false";
    }
    return encodeURIComponent(String(value).replace(" ", "+"));
  }
}

export function encodeQueryParamsV1(
  params: Record<string, unknown>,
  keepBlankValues = true
): string {
  return Object.entries(params)
    .filter(([_, value]) => keepBlankValues || (value !== null && value !== ""))
    .map(
      ([key, value]) =>
        `${encodeQueryParamV1(key)}=${encodeQueryParamV1(value)}`
    )
    .join("&");
}

function encodeQueryParamV2(value: unknown): string {
  if (Array.isArray(value)) {
    return `List(${value.map(encodeQueryParamV2).join(",")})`;
  } else if (typeof value === "object" && value !== null) {
    return `(${Object.entries(value)
      .map(([k, v]) => `${k}:${encodeQueryParamV2(v)}`)
      .join(",")})`;
  } else {
    if (value === true) {
      return "true";
    } else if (value === false) {
      return "false";
    }
    return encodeURIComponent(String(value))
      .replace("(", "%28")
      .replace(")", "%29");
  }
}

export function encodeQueryParamsV2(
  params: Record<string, unknown>,
  keepBlankValues = true
): string {
  return Object.entries(params)
    .filter(([_, value]) => keepBlankValues || (value !== null && value !== ""))
    .map(
      ([key, value]) =>
        `${encodeQueryParamV2(key)}=${encodeQueryParamV2(value)}`
    )
    .join("&");
}
