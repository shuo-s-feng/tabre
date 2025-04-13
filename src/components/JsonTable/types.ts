import { isArrayOfRecords, isRecordOfArrays } from "../../types/record";

export type TableData = Record<string, unknown>[] | Record<string, unknown[]>;

export const isValidTableData = (
  tableData: unknown
): tableData is TableData => {
  try {
    // Check if data is empty
    if (!tableData || (Array.isArray(tableData) && tableData.length === 0))
      return false;

    if (isArrayOfRecords(tableData)) {
      return true;
    } else if (isRecordOfArrays(tableData)) {
      // Check if all arrays have same length
      const arrayValues = Object.values(tableData);
      const firstLength = arrayValues[0].length;
      return arrayValues.every((arr) => arr.length === firstLength);
    }

    return false;
  } catch {
    return false;
  }
};
