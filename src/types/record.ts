export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const isArrayOfRecords = (
  value: unknown
): value is Record<string, unknown>[] => {
  return Array.isArray(value) && value.every(isRecord);
};

export const isRecordOfArrays = (
  value: unknown
): value is Record<string, unknown[]> => {
  return isRecord(value) && Object.values(value).every(Array.isArray);
};
