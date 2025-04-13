import { isEqual } from "lodash";

/* eslint-disable no-prototype-builtins */
export const getDifferencesBetweenObjects = (
  objectA: Record<string, unknown>,
  objectB: Record<string, unknown>,
  mode: "all" | "left" | "right" = "all",
  deepCompare: boolean = true
): Record<string, unknown> => {
  const differences: Record<
    string,
    { valueInObjectA: unknown; valueInObjectB: unknown }
  > = {};

  // Combine the keys from both objects
  const allKeys = new Set([...Object.keys(objectA), ...Object.keys(objectB)]);

  allKeys.forEach((key) => {
    // If both objects contain the key, but the values are not equal,
    // or one of the objects doesn't contain the key, store it in the differences object.
    if (
      (deepCompare
        ? !isEqual(objectA[key], objectB[key])
        : objectA[key] !== objectB[key]) ||
      !objectB.hasOwnProperty(key) ||
      !objectA.hasOwnProperty(key)
    ) {
      differences[key] = {
        valueInObjectA: objectA[key],
        valueInObjectB: objectB[key],
      };
    }
  });

  if (mode === "all") {
    return differences;
  } else if (mode === "left") {
    const leftDifferences: Record<string, unknown> = {};
    for (const [key, difference] of Object.entries(differences)) {
      if (difference.valueInObjectA !== undefined) {
        leftDifferences[key] = difference.valueInObjectA;
      }
    }

    return leftDifferences;
  } else {
    const rightDifferences: Record<string, unknown> = {};
    for (const [key, difference] of Object.entries(differences)) {
      if (difference.valueInObjectB !== undefined) {
        rightDifferences[key] = difference.valueInObjectB;
      }
    }

    return rightDifferences;
  }
};

export const hasDifferencesBetweenObjects = (
  objectA: Record<string, unknown>,
  objectB: Record<string, unknown>,
  deepCompare: boolean = true
): boolean =>
  !!Object.keys(
    getDifferencesBetweenObjects(objectA, objectB, "all", deepCompare)
  ).length;

export const hasDifferences = (
  objectA: Record<string, unknown>,
  objectB: Record<string, unknown>
) => !isEqual(objectA, objectB);
