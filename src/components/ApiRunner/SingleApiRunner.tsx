import { useCallback, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { makeStyles } from "../../utils/theme";
import { RequestDefinitionFile } from "../../types/request-definition";
import { TabsContent } from "../TabsContent";
import {
  parseResponse,
  requestWithDefinition,
} from "../../utils/request-with-definition";
import { ResponseViewer } from "../ResponseViewer";

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: theme.spacing(5),
  },
  description: {
    marginBottom: theme.spacing(3),
  },
  paramField: {
    marginBottom: theme.spacing(2),
    maxWidth: 300,
  },
}));

export interface SingleApiRunnerProps {
  className?: string;
  definition: RequestDefinitionFile;
  initialParams?: Record<string, string>;
  onParamsChange?: (params: Record<string, string>) => void;
  initialResponse?: string;
  onResponseChange?: (response: string | undefined) => void;
}

export const SingleApiRunner: React.FC<SingleApiRunnerProps> = ({
  className,
  definition,
  initialParams,
  onParamsChange,
  initialResponse,
  onResponseChange,
}) => {
  const { cx, classes } = useStyles();

  const [params, setParams] = useState<Record<string, string>>(() => {
    const defaultParams: Record<string, string> = {};
    Object.keys(definition.params).forEach((key) => {
      defaultParams[key] = initialParams?.[key]?.toString() ?? "";
    });
    return defaultParams;
  });

  const [response, setResponse] = useState<string | undefined>(initialResponse);
  const [responseIsLoading, setResponseIsLoading] = useState(false);
  const [responseHasError, setResponseHasError] = useState<boolean>(false);
  const [parsedResponse, setParsedResponse] = useState<
    Record<string, unknown> | string | undefined
  >();

  const onParamChange = useCallback(
    (paramName: string, value: string) => {
      setParams((prev) => {
        const newParams = {
          ...prev,
          [paramName]: value.toString(),
        };
        onParamsChange?.(newParams);
        return newParams;
      });
    },
    [onParamsChange]
  );

  const onExampleDataFill = useCallback(() => {
    const exampleParams: Record<string, string> = {};
    Object.entries(definition.params).forEach(([key, paramDef]) => {
      exampleParams[key] = paramDef.example?.toString() ?? "";
    });
    setParams(exampleParams);
    onParamsChange?.(exampleParams);
  }, [definition.params, onParamsChange]);

  const onRequestSend = useCallback(async () => {
    setResponseIsLoading(true);
    setResponseHasError(false);

    try {
      const { responseString } = await requestWithDefinition(
        definition,
        params
      );

      setResponse(responseString);
      onResponseChange?.(responseString);
      setResponseIsLoading(false);
      setResponseHasError(false);
    } catch (error) {
      console.error("Error sending request:", error);
      setResponse(error instanceof Error ? error.message : String(error));
      onResponseChange?.(
        error instanceof Error ? error.message : String(error)
      );
      setResponseIsLoading(false);
      setResponseHasError(true);
    }
  }, [definition, params, onResponseChange]);

  useEffect(() => {
    if (responseIsLoading) {
      setParsedResponse("Pending");
      return;
    }

    if (responseHasError) {
      setParsedResponse(response ?? "Failed to send request");
      return;
    }

    let parsedResponseString = undefined;

    try {
      parsedResponseString = parseResponse(
        definition,
        JSON.parse(response ?? "")
      ).parsedResponseString;
      const parsed = JSON.parse(parsedResponseString);
      setParsedResponse(parsed);
    } catch {
      setParsedResponse(parsedResponseString ?? "Failed to parse response");
    }
  }, [definition, response, responseIsLoading, responseHasError]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        onRequestSend();
      }
    },
    [onRequestSend]
  );

  return (
    <Paper
      elevation={2}
      className={cx(classes.paper, className)}
      onKeyDown={handleKeyDown}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        <Typography variant="h5">{definition.request.name}</Typography>
        <Typography variant="body1" className={classes.description}>
          {definition.request.description}
        </Typography>

        <Grid container direction="row" gap={2}>
          {Object.entries(definition.params).map(([paramName, paramDef]) => (
            <TextField
              key={paramName}
              label={paramName}
              size="small"
              value={params[paramName]}
              onChange={(e) => onParamChange(paramName, e.target.value)}
              helperText={paramDef.description}
              placeholder={paramDef.example}
              className={classes.paramField}
            />
          ))}
        </Grid>

        <Box display="flex" gap={2}>
          <Button variant="outlined" onClick={onExampleDataFill} fullWidth>
            Fill Example Data
          </Button>
          {definition.request.requestInitiator === "tab" ? (
            <Button
              variant="contained"
              onClick={onRequestSend}
              onKeyDown={handleKeyDown}
              fullWidth
            >
              Send Request on Tab
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onRequestSend}
              onKeyDown={handleKeyDown}
              fullWidth
            >
              Send Request Directly
            </Button>
          )}
        </Box>

        <Divider sx={{ marginX: 5 }} />

        <TabsContent
          tabs={[
            {
              label: "Parsed Response",
              content: <ResponseViewer data={parsedResponse} />,
            },
            {
              label: "Raw Response",
              content: (
                <TextField
                  fullWidth
                  multiline
                  rows={8}
                  value={response}
                  placeholder="Response will be shown here"
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              ),
            },
          ]}
        />
      </Box>
    </Paper>
  );
};

export default SingleApiRunner;
