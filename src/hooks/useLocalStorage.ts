import { useCallback, useEffect, useState } from "react";
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from "../utils/local-storage";
import { CustomEventKey, dispatchCustomEvent } from "../utils/window-event";
import { getDifferencesBetweenObjects } from "../utils/lookup";

interface CustomEventPayload<Value> {
  key: string;
  value: Value | undefined;
}

interface UseLocalStorageV2Config {
  broadcastDefaultValue?: boolean;
  enableStorageEventListener?: boolean;
}

export const useLocalStorage = <Value = unknown>(
  key: string,
  defaultValue: Value,
  config: UseLocalStorageV2Config = {}
): [
  Value,
  (
    valueOrValueUpdator:
      | Value
      | undefined
      | ((value: Value) => Value | undefined)
  ) => void
] => {
  const { broadcastDefaultValue = false, enableStorageEventListener = false } =
    config;

  // If broadcast the default value, directly use the default value
  // Otherwise, use the cached value first and then default value
  const [value, setValue] = useState<Value>(
    broadcastDefaultValue
      ? defaultValue
      : getLocalStorageValue(key) ?? defaultValue
  );

  const _setValue = useCallback((newValue: Value) => {
    setValue((value) => {
      if (
        typeof value === "object" &&
        value !== null &&
        typeof newValue === "object" &&
        newValue !== null
          ? Object.keys(
              getDifferencesBetweenObjects(
                newValue as Record<string, unknown>,
                value as Record<string, unknown>
              )
            ).length
          : newValue !== value
      ) {
        return newValue;
      }

      return value;
    });
  }, []);

  const setValueAndBroadcast = useCallback(
    (
      valueOrValueUpdator:
        | Value
        | undefined
        | ((value: Value) => Value | undefined)
    ) => {
      let value: Value | undefined;

      if (typeof valueOrValueUpdator === "function") {
        const valueUpdator = valueOrValueUpdator as (
          value: Value
        ) => Value | undefined;

        setValue((prevValue) => {
          value = valueUpdator(prevValue);

          // Need to wrap the following local storage update inside this callback to avoid
          // the callback is called after the local storage updates
          setLocalStorageValue(key, value);
          dispatchCustomEvent(CustomEventKey.LocalStorageChange, {
            key,
            value,
          });

          return value === undefined ? defaultValue : value;
        });
      } else {
        value = valueOrValueUpdator;

        if (value === undefined) {
          setValue(defaultValue);
        } else {
          setValue(value);
        }

        setLocalStorageValue(key, value);
        dispatchCustomEvent(CustomEventKey.LocalStorageChange, {
          key,
          value,
        });
      }
    },
    [defaultValue, key]
  );

  useEffect(() => {
    const value = broadcastDefaultValue
      ? defaultValue
      : getLocalStorageValue(key) ?? defaultValue;
    _setValue(value);
  }, [_setValue, broadcastDefaultValue, defaultValue, key, value]);

  // If the default value is changed, broadcast the change event
  useEffect(() => {
    if (!broadcastDefaultValue) {
      return;
    }

    setValueAndBroadcast(defaultValue);
  }, [broadcastDefaultValue, defaultValue, setValueAndBroadcast]);

  useEffect(() => {
    const handler = (({ detail }: CustomEvent<CustomEventPayload<Value>>) => {
      if (key === detail.key) {
        if (detail.value !== undefined) {
          _setValue(detail.value);
        }
      }
    }) as EventListener;

    window.addEventListener(CustomEventKey.LocalStorageChange, handler);

    return () => {
      window.removeEventListener(CustomEventKey.LocalStorageChange, handler);
    };
  }, [key, _setValue]);

  useEffect(() => {
    if (!enableStorageEventListener) {
      return;
    }

    const handler = (event: StorageEvent) => {
      if (key === event.key) {
        setValue(
          event.newValue && event.newValue !== ""
            ? JSON.parse(event.newValue)
            : null
        );
      }
    };

    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener("storage", handler);
    };
  }, [key, enableStorageEventListener]);

  return [value, setValueAndBroadcast];
};

export default useLocalStorage;
