// Version 1: Based on decoder_v1.py
const LIST_DATA_REQUIRED_KEY_SET = new Set([
  "f_C",
  "f_JT",
  "f_E",
  "f_PP",
  "f_WT",
]);

const isNumberString = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim() !== "";
};

const convertToIntIfPossibleV1 = (value: string): number | string => {
  if (isNumberString(value)) {
    const intValue = parseInt(value, 10);

    return isNaN(intValue) ? value : intValue;
  } else {
    return value;
  }
};

const decodeStringV1 = (value: string, key: string): unknown => {
  value = value.replace("+", " ");

  if (LIST_DATA_REQUIRED_KEY_SET.has(key)) {
    // Split by comma to create a list and convert each item to int if possible
    return value.split(",").map(convertToIntIfPossibleV1);
  } else {
    // Convert to int if possible, otherwise return the value as is
    return convertToIntIfPossibleV1(value);
  }
};

export const decodeQueryStringV1 = (
  queryString: string,
  keepBlankValues = true
): Record<string, unknown> => {
  const queryParams = new URLSearchParams(queryString);
  const result: Record<string, unknown> = {};

  queryParams.forEach((value, key) => {
    if (keepBlankValues || value) {
      result[key] = decodeStringV1(value, key);
    }
  });

  return result;
};

// Version 2: Based on decoder_v2.py
const decodeListV2 = (value: string): unknown[] => {
  if (value.startsWith("List(") && value.endsWith(")")) {
    const innerValue = value.slice(5, -1);
    const items: string[] = [];
    let nestedLevel = 0;
    let currentItem = "";

    for (const char of innerValue) {
      if (char === "," && nestedLevel === 0) {
        items.push(currentItem.trim());
        currentItem = "";
      } else {
        currentItem += char;
        if (char === "(") nestedLevel++;
        else if (char === ")") nestedLevel--;
      }
    }
    if (currentItem) items.push(currentItem.trim());

    return items.map(decodeStringV2);
  }
  return [value]; // Ensure it returns a single value wrapped in a list if "List()" is not matched
};

const decodeDictV2 = (encodedStr: string): Record<string, unknown> => {
  if (encodedStr.startsWith("(") && encodedStr.endsWith(")")) {
    const innerStr = encodedStr.slice(1, -1);
    const result: Record<string, unknown> = {};
    const keyValuePairs: string[] = [];
    let nestedLevel = 0;
    let currentPair = "";

    for (const char of innerStr) {
      if (char === "," && nestedLevel === 0) {
        keyValuePairs.push(currentPair);
        currentPair = "";
      } else {
        currentPair += char;
        if (char === "(") nestedLevel++;
        else if (char === ")") nestedLevel--;
      }
    }
    if (currentPair) keyValuePairs.push(currentPair);

    keyValuePairs.forEach((pair) => {
      const subStrings = pair.split(":");

      const key = subStrings[0];
      const value = subStrings.slice(1).join(":");

      result[key.trim()] = decodeStringV2(value.trim());
    });

    return result;
  } else {
    throw new Error(`Invalid dictionary format ${encodedStr}`);
  }
};

const decodeStringV2 = (value: string): unknown => {
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  } else if (value.toLowerCase() === "true") {
    return true;
  } else if (value.toLowerCase() === "false") {
    return false;
  } else if (value.startsWith("(") && value.endsWith(")")) {
    return decodeDictV2(value);
  } else if (value.startsWith("List(") && value.endsWith(")")) {
    return decodeListV2(value);
  } else {
    return decodeURIComponent(value);
  }
};

export const decodeQueryStringV2 = (
  queryString: string,
  keepBlankValues = true
): Record<string, unknown> => {
  const queryParams = queryString.split("&").map((subString) => {
    const [key, value] = subString.split("=");
    return { key, value };
  });

  const result: Record<string, unknown> = {};

  queryParams.forEach(({ key, value }) => {
    if (keepBlankValues || value) {
      result[key] = decodeStringV2(value);
    }
  });

  return result;
};
