import {
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Link,
} from "@mui/material";
import TableViewIcon from "@mui/icons-material/TableView";
import CodeIcon from "@mui/icons-material/Code";
import { KeyValueTableView } from "../KeyValueTableView";
import { useEffect, useState } from "react";
import { JsonTable, isValidTableData, TableData } from "../JsonTable";
import { isRecord } from "../../types/record";
import { isValidUrl } from "../../utils/url";

type ViewMode = "table" | "json";

export interface ResponseViewerProps {
  data: Record<string, unknown> | string | undefined;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("json");

  const isTableViewAvailable =
    typeof data !== "string" && isValidTableData(data);
  const isKeyValueViewAvailable = typeof data !== "string" && isRecord(data);

  useEffect(() => {
    setViewMode(
      isTableViewAvailable || isKeyValueViewAvailable ? "table" : "json"
    );
  }, [isTableViewAvailable, isKeyValueViewAvailable]);

  if (!data) {
    return (
      <TextField
        fullWidth
        multiline
        rows={8}
        placeholder="Response will be shown here"
        variant="outlined"
        InputProps={{
          readOnly: true,
        }}
      />
    );
  }

  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode | null
  ) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const renderCell = (value: unknown): React.ReactNode => {
    if (typeof value === "string" && isValidUrl(value)) {
      return (
        <Link href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </Link>
      );
    }

    return value?.toString() ?? "";
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="text.secondary">
          View Mode:
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="json">
            <CodeIcon fontSize="small" />
            <Box component="span" ml={1}>
              JSON
            </Box>
          </ToggleButton>
          {(isTableViewAvailable || isKeyValueViewAvailable) && (
            <ToggleButton value="table">
              <TableViewIcon fontSize="small" />
              <Box component="span" ml={1}>
                Table
              </Box>
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      </Box>

      {viewMode === "table" ? (
        isTableViewAvailable ? (
          <JsonTable data={data as TableData} renderCell={renderCell} />
        ) : isKeyValueViewAvailable ? (
          <KeyValueTableView data={data} renderCell={renderCell} />
        ) : null
      ) : (
        <TextField
          fullWidth
          multiline
          rows={8}
          value={
            typeof data === "string" ? data : JSON.stringify(data, null, 2)
          }
          variant="outlined"
          InputProps={{
            readOnly: true,
          }}
        />
      )}
    </Box>
  );
};

export default ResponseViewer;
