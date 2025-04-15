import {
  Box,
  TextField,
  Paper,
  Autocomplete,
  List,
  ListSubheader,
  ListItem,
  Alert,
  Typography,
  Grid,
} from "@mui/material";
import { makeStyles } from "../../utils/theme";
import { RequestDefinitionFile } from "../../types/request-definition";
import { TabsContent } from "../TabsContent";
import { SingleApiRunner } from "./SingleApiRunner";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { AUTOCOMPLETE_DEFINITIONS } from "../../constants/presaved-definitions";
import { useCallback, useEffect, useMemo, useState } from "react";

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: theme.spacing(3),
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
  },
  textField: {
    width: "100%",
    "& .MuiInputBase-root": {
      fontFamily: "monospace",
    },
  },
  filterContainer: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  autocomplete: {
    flex: 1,
    "& .MuiAutocomplete-popper .MuiAutocomplete-option": {
      cursor: "pointer",
    },
  },
  groupHeader: {
    fontWeight: "bold",
  },
  listbox: {
    padding: 0,
  },
}));

export interface ApiRunnerProps {
  className?: string;
  initialDefinition?: RequestDefinitionFile;
}

export const ApiRunner: React.FC<ApiRunnerProps> = ({
  className,
  initialDefinition,
}) => {
  const { cx, classes } = useStyles();
  const [definition, setDefinition] = useLocalStorage<
    RequestDefinitionFile | undefined
  >("definition", initialDefinition);
  const [definitionError, setDefinitionError] = useLocalStorage<string>(
    "definitionError",
    ""
  );
  const [selectedDefinition, setSelectedDefinition] = useLocalStorage<string>(
    "selectedDefinition",
    ""
  );
  const [definitionRawContent, setDefinitionRawContent] = useState<
    string | undefined
  >(undefined);

  const [params, setParams] = useLocalStorage(
    `api-runner-${definition?.id}-params`,
    {}
  );
  const [response, setResponse] = useLocalStorage(
    `api-runner-${definition?.id}-response`,
    ""
  );

  useEffect(() => {
    setDefinitionRawContent(
      definition ? JSON.stringify(definition, null, 2) : ""
    );
  }, [definition]);

  const onDefinitionSelect = useCallback(
    async (
      _event: React.SyntheticEvent,
      value: { value: string; label: string } | null
    ) => {
      if (!value) {
        setSelectedDefinition(undefined);
        setDefinition(undefined);
        setDefinitionError(undefined);
        return;
      }

      setSelectedDefinition(value.value);

      try {
        const response = await fetch(value.value);
        const data = await response.json();
        setDefinition(data);
        setDefinitionError(undefined);
      } catch (error) {
        setDefinition(undefined);
        setDefinitionError(
          error instanceof Error ? error.message : "Failed to load definition"
        );
      }
    },
    [setDefinition, setDefinitionError, setSelectedDefinition]
  );

  const onDefinitionContentChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDefinitionRawContent(event.target.value);

      try {
        const newDefinition = JSON.parse(
          event.target.value
        ) as RequestDefinitionFile;

        setDefinition(newDefinition);
        setDefinitionError(undefined);
        setSelectedDefinition(undefined);
      } catch (error) {
        setDefinitionError(
          error instanceof Error ? error.message : "Invalid JSON"
        );
        setSelectedDefinition(undefined);
      }
    },
    [setDefinition, setDefinitionError, setSelectedDefinition]
  );

  const definitionSelector = useMemo(
    () => (
      <Grid gap={2} marginBottom={4}>
        <Autocomplete
          className={classes.autocomplete}
          options={AUTOCOMPLETE_DEFINITIONS}
          getOptionLabel={(option) => option.label}
          value={
            selectedDefinition
              ? AUTOCOMPLETE_DEFINITIONS.find(
                  (def) => def.value === selectedDefinition
                )
              : null
          }
          onChange={onDefinitionSelect}
          renderInput={(params) => (
            <TextField {...params} label="Pre-saved Definitions" size="small" />
          )}
          size="small"
          freeSolo={false}
          disableClearable={false}
          groupBy={(option) => {
            const [domain, stepType] = option.value.split("/").slice(1, 3);
            return `${domain}/${stepType}`;
          }}
          renderGroup={(params) => (
            <List key={params.key} component="div" sx={{ padding: 0 }}>
              <ListSubheader component="div" className={classes.groupHeader}>
                {params.group.replace("/", " | ").toUpperCase()}
              </ListSubheader>
              {params.children}
            </List>
          )}
          renderOption={(props, option) => (
            <ListItem {...props}>{option.label}</ListItem>
          )}
          classes={{
            listbox: classes.listbox,
          }}
        />
      </Grid>
    ),
    [
      classes.autocomplete,
      classes.groupHeader,
      classes.listbox,
      onDefinitionSelect,
      selectedDefinition,
    ]
  );

  return (
    <Paper elevation={2} className={cx(classes.paper, className)}>
      <TabsContent
        tabs={[
          {
            label: "Runner",
            content: definition?.id ? (
              <Box>
                {definitionSelector}

                <SingleApiRunner
                  definition={definition}
                  initialParams={params}
                  onParamsChange={setParams}
                  initialResponse={response}
                  onResponseChange={setResponse}
                />
              </Box>
            ) : (
              <Box>
                {definitionSelector}

                <Alert severity="info">
                  <Typography>
                    Please enter a valid request definition in the DEFINITION
                    tab
                  </Typography>
                </Alert>
              </Box>
            ),
          },
          {
            label: "Definition",
            content: (
              <Box>
                {definitionSelector}

                <TextField
                  className={classes.textField}
                  multiline
                  rows={20}
                  value={definitionRawContent}
                  onChange={onDefinitionContentChange}
                  error={!!definitionError}
                  helperText={definitionError}
                  placeholder="Enter your request definition JSON here"
                  variant="outlined"
                />
              </Box>
            ),
          },
        ]}
      />
    </Paper>
  );
};

export default ApiRunner;
