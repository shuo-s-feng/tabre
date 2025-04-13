import { Tool } from "openai/resources/responses/responses.mjs";
import { RequestDefinitionFile } from "../types/request-definition";

export const getTools = (
  definitions: RequestDefinitionFile[]
): {
  tools: Tool[];
  definitionIdLookup: Record<string, string>;
} => {
  const definitionIdLookup: Record<string, string> = {};

  const tools = definitions.map((def) => {
    const toolName = `rwdp-${String(def.id)
      .replaceAll("-", "_")
      .replaceAll("/", "-")
      .replaceAll(".", "_")}`;
    definitionIdLookup[toolName] = def.id;

    const properties = Object.entries(def.params).reduce(
      (acc, [key, param]) => {
        if (key === "queryId" || key === "decorationId") {
          return acc;
        }

        // Filter out params that are not needed for the tool call of search-jobs
        if (
          def.id.includes("search-jobs") &&
          [
            "jobType",
            "applyWithLinkedIn",
            "commitment",
            "functionName",
            "industryName",
            "inYourNetwork",
            "populatedPlaceName",
            "salaryBucketV2",
            "titleName",
            "workplaceType",
          ].includes(key)
        ) {
          return acc;
        }

        acc[key] = {
          type: param.type,
          description: param.description,
          example: param.example,
        };

        return acc;
      },
      {} as Record<string, unknown>
    );

    return {
      type: "function",
      name: toolName,
      description: def.request.description,
      parameters: {
        type: "object",
        properties,
        required: Object.keys(properties),
        additionalProperties: false,
      },
      strict: true,
    } as Tool;
  });

  return {
    tools: [
      {
        type: "web_search_preview",
        user_location: {
          type: "approximate",
          country: "US",
        },
        search_context_size: "medium",
      } as Tool,
      ...tools,
    ],
    definitionIdLookup,
  };
};
