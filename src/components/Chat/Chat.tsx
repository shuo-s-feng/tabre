import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  List,
  ListItem,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Stack,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { ChatSettings } from "./ChatSettings";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { DEFAULT_API_KEY } from "../../constants/openai";
import { OpenAI } from "openai";
import {
  ResponseFunctionToolCall,
  ResponseInput,
  ResponseOutputRefusal,
  ResponseOutputText,
} from "openai/resources/responses/responses.mjs";
import { requestWithDefinitionPath } from "../../utils/request-with-definition";
import { DEFINITIONS } from "../../constants/presaved-definitions";
import { RequestDefinitionFile } from "../../types/request-definition";
import { getTools } from "../../utils/openai";
import { Message, IntermediateStep } from "./types";
import MessageWithSteps from "./MessageWithSteps";
import IntermediateStepsDisplay from "./IntermediateStepsDisplay";

export interface ChatProps {
  className?: string;
}

export const Chat: React.FC<ChatProps> = ({ className }) => {
  const [messages, setMessages] = useLocalStorage<Message[]>(
    "chat-messages",
    []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useLocalStorage<string>(
    "chatgpt-api-key",
    DEFAULT_API_KEY
  );
  const [definitions, setDefinitions] = useState<
    RequestDefinitionFile[] | undefined
  >(undefined);
  const [intermediateSteps, setIntermediateSteps] = useState<
    IntermediateStep[]
  >([]);

  useEffect(() => {
    const loadDefinitions = async () => {
      const loadedDefinitions = await Promise.all(
        DEFINITIONS.filter((def) => !def.path.includes("typeahead")).map(
          async (def) => {
            const response = await fetch(def.path);
            const data = await response.json();
            return data;
          }
        )
      );
      setDefinitions(loadedDefinitions);
    };
    loadDefinitions();
  }, []);

  const openai = useMemo(
    () =>
      new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      }),
    [apiKey]
  );

  const onMessageSend = useCallback(async () => {
    if (!apiKey) {
      setSettingsOpen(true);
      setIsLoading(false);
      return;
    }

    if (!input.trim() || isLoading || !definitions) return;

    const userMessage: Message = {
      id: new Date().getTime(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIntermediateSteps([]);

    try {
      const latestMessages = [...messages, userMessage];

      const messagesInput: ResponseInput = latestMessages.map(
        ({ role, content }) => ({
          role,
          content,
        })
      );
      const { tools, definitionIdLookup } = getTools(definitions);

      setIntermediateSteps((prev) => [
        ...prev,
        {
          type: "thinking",
          content: "Processing your request...",
          timestamp: Date.now(),
        },
      ]);

      const response1 = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: ` 1. If the tool call failed, never make up a response, just say that the tool call failed. 
              2. When finding referrers, first generate the search keywords based on the JD, where the search keywords can be the team name, org name, product name, etc. Never use the company name. Then use this as keywords to search the matching people.
              3. When searching the people, first try with keywords, locationName, currentCompanyName, schoolName.`,
          },

          ...messagesInput,
        ],
        tools,
        tool_choice: "auto",
      });

      let currentResponse = response1;
      let hasToolCall = true;
      let attempts = 0;
      const MAX_ATTEMPTS = 5;

      while (
        hasToolCall &&
        currentResponse.output.length &&
        attempts < MAX_ATTEMPTS
      ) {
        hasToolCall = false;
        attempts++;

        for (const responseOutputItem of currentResponse.output) {
          let isToolCall = false;
          if (responseOutputItem.type === "function_call") {
            messagesInput.push(responseOutputItem);
            isToolCall = true;
            hasToolCall = true;

            const { name, arguments: args } =
              responseOutputItem as ResponseFunctionToolCall;
            setIntermediateSteps((prev) => [
              ...prev,
              {
                type: "tool_call",
                content: `Preparing to call function: ${definitionIdLookup[name]}. Arguments: ${args}`,
                timestamp: Date.now(),
              },
            ]);
          } else if (responseOutputItem.type === "message") {
            messagesInput.push({
              type: "message",
              role: "assistant",
              content:
                (responseOutputItem.content[0] as ResponseOutputText)?.text ??
                (responseOutputItem.content[0] as ResponseOutputRefusal)
                  ?.refusal,
            });
          } else {
            messagesInput.push({
              type: "message",
              role: "developer",
              content: `Unexpected response output item: ${JSON.stringify(
                responseOutputItem
              )}`,
            });
          }

          if (isToolCall) {
            const { call_id, name } =
              responseOutputItem as ResponseFunctionToolCall;

            const toolName = name.split("-")[0];

            if (toolName === "rwdp") {
              const definitionId = definitionIdLookup[name];

              if (!definitionId) {
                messagesInput.push({
                  type: "message",
                  role: "developer",
                  content: `Definition ID not found for tool call: ${name}`,
                });
                setIntermediateSteps((prev) => [
                  ...prev,
                  {
                    type: "tool_response",
                    content: `Error: Definition ID not found for tool call: ${name}`,
                    timestamp: Date.now(),
                  },
                ]);
              } else {
                const params = JSON.parse(
                  (responseOutputItem as ResponseFunctionToolCall).arguments
                );

                const definitionPath = `/${definitionId}.json`;

                setIntermediateSteps((prev) => [
                  ...prev,
                  {
                    type: "tool_call",
                    content: `Executing request with definition: ${definitionId}`,
                    timestamp: Date.now(),
                  },
                ]);

                try {
                  const result = await requestWithDefinitionPath(
                    definitionPath,
                    params
                  );

                  const responseContent =
                    (result.parsedResponseString || result.responseString) ??
                    "Unknown error";
                  setIntermediateSteps((prev) => [
                    ...prev,
                    {
                      type: "tool_response",
                      content: `Response: ${responseContent}`,
                      timestamp: Date.now(),
                    },
                  ]);

                  messagesInput.push({
                    type: "function_call_output",
                    call_id,
                    output: responseContent,
                  });
                } catch (error) {
                  console.error(
                    "Failed to execute request with definition:",
                    error
                  );

                  setIntermediateSteps((prev) => [
                    ...prev,
                    {
                      type: "tool_response",
                      content: `Error: Failed to execute request with definition: ${definitionId} with ${String(
                        error
                      )}`,
                      timestamp: Date.now(),
                    },
                  ]);

                  messagesInput.push({
                    type: "message",
                    role: "developer",
                    content: `Failed to execute request with definition: ${definitionId} with ${String(
                      error
                    )}`,
                  });
                }
              }
            } else {
              messagesInput.push({
                type: "message",
                role: "developer",
                content: `Unexpected tool call: ${name}`,
              });
              setIntermediateSteps((prev) => [
                ...prev,
                {
                  type: "tool_response",
                  content: `Error: Unexpected tool call: ${name}`,
                  timestamp: Date.now(),
                },
              ]);
            }
          }
        }

        if (hasToolCall) {
          setIntermediateSteps((prev) => [
            ...prev,
            {
              type: "thinking",
              content: "Processing tool responses...",
              timestamp: Date.now(),
            },
          ]);

          currentResponse = await openai.responses.create({
            model: "gpt-4o-mini",
            input: messagesInput,
            tools,
            store: true,
          });
        }
      }

      if (attempts >= MAX_ATTEMPTS) {
        console.warn("Reached maximum attempts limit of", MAX_ATTEMPTS);
        setIntermediateSteps((prev) => [
          ...prev,
          {
            type: "tool_response",
            content: "Warning: Reached maximum attempts limit",
            timestamp: Date.now(),
          },
        ]);
      }

      setIntermediateSteps((currentSteps) => {
        setMessages((prev) => [
          ...prev,
          {
            id: new Date().getTime(),
            role: "assistant",
            content: currentResponse.output_text || "",
            intermediateSteps:
              currentSteps.filter((step) => step.type !== "thinking") || [],
          },
        ]);
        return currentSteps;
      });
    } catch (error) {
      console.error("Send message error:", error);
      setIntermediateSteps((currentSteps) => {
        setMessages((prev) => [
          ...prev,
          {
            id: new Date().getTime(),
            role: "assistant",
            content:
              "Sorry, there was an error processing your request. Please try again.",
            intermediateSteps:
              currentSteps.filter((step) => step.type !== "thinking") || [],
          },
        ]);
        return currentSteps;
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    input,
    isLoading,
    definitions,
    setMessages,
    apiKey,
    messages,
    openai.responses,
  ]);

  const onChatClear = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        onMessageSend();
      }
    },
    [onMessageSend]
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const onSettingsOpen = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const onSettingsClose = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  const onConversationStarterClick = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "calc(100vh - 200px)",
        overflow: "hidden",
      }}
      className={className}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h2">Chat</Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={onChatClear}
            disabled={messages.length === 0}
          >
            Clear Chat
          </Button>
        </Box>
        <Tooltip title="Settings">
          <IconButton onClick={onSettingsOpen} size="small">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {!apiKey.startsWith("sk-") && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={onSettingsOpen}>
                Add API Key
              </Button>
            }
          >
            <Typography>
              API key is missing. Please add your API key in settings to use the
              chat.
            </Typography>
          </Alert>
        )}

        <List>
          {messages.map((message, index) => (
            <React.Fragment key={message.id}>
              <ListItem
                sx={{
                  flexDirection: "column",
                  alignItems:
                    message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <MessageWithSteps message={message} />
              </ListItem>
              {index < messages.length - 1 && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
          {isLoading && (
            <ListItem>
              <IntermediateStepsDisplay
                steps={intermediateSteps}
                isProcessing={true}
              />
            </ListItem>
          )}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {messages.length === 0 && (
          <Stack direction="row" spacing={2} sx={{ p: 2, mb: 1 }}>
            <Button
              variant="outlined"
              onClick={() =>
                onConversationStarterClick(
                  "Find me some SDE openings in the United States"
                )
              }
            >
              Find SDE openings in US
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                onConversationStarterClick("Find me some insiders at Amazon")
              }
            >
              Find Amazon insiders
            </Button>
          </Stack>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder="Type your message here..."
            disabled={isLoading}
          />
          <Button
            size="large"
            variant="contained"
            onClick={onMessageSend}
            disabled={isLoading || !input.trim()}
            sx={{ alignSelf: "flex-end" }}
          >
            Send
          </Button>
        </Box>
      </Box>
      <ChatSettings
        open={settingsOpen}
        onClose={onSettingsClose}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
      />
    </Paper>
  );
};

export default Chat;
