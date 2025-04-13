import { get } from "geton";

export interface ParserConfig {
  [key: string]: string;
}
export interface DynamicParserConfig {
  code: string;
}

export const parseData = (
  data: unknown,
  config: ParserConfig | DynamicParserConfig
): Record<string, unknown> => {
  // Handle dynamic code-based parsing
  if ("code" in config) {
    const dynamicConfig = config as DynamicParserConfig;
    try {
      // Create a new function from the code string
      const parserFunction = new Function("response", dynamicConfig.code);
      // Execute the function with the data
      return parserFunction(data);
    } catch (error) {
      console.error("Error executing dynamic parser:", error);
      return {};
    }
  } else {
    return Object.entries(config).reduce((acc, [key, path]) => {
      acc[key] = get(path, data as Record<string, unknown>);
      return acc;
    }, {} as Record<string, unknown>);
  }
};
