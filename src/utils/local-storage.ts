export const getLocalStorageValue = (key: string) => {
  const value = localStorage.getItem(key);

  if (value === null || value === "") {
    return null;
  }

  return JSON.parse(value);
};

export const setLocalStorageValue = (key: string, value: unknown) => {
  if (value === null || value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};
