export interface KeyValuePair {
  key: string;
  value: string | File;
  type?: "text" | "file";
}

export interface StringKeyValuePair {
  key: string;
  value: string;
}
