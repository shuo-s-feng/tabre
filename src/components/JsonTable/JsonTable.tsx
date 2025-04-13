import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { isValidTableData, TableData } from "./types";

const StyledTableCell = styled(TableCell)({
  minWidth: 100,
  maxWidth: 300,
  whiteSpace: "wrap",
  wordWrap: "break-word",
});

export interface JsonTableProps {
  data: TableData;
  renderCell?: (value: unknown) => React.ReactNode;
}

export const JsonTable: React.FC<JsonTableProps> = ({ data, renderCell }) => {
  const [isTransposed, setIsTransposed] = useState(false);

  if (!isValidTableData(data)) return null;

  const isArrayData = Array.isArray(data);
  let headers: string[];
  let rows: Record<string, unknown>[] = [];

  if (isArrayData) {
    headers = Object.keys(data[0]);
    rows = data;
  } else {
    // For Record<string, unknown[]>, we need to transform the data differently
    const arrayLength = Object.values(data)[0].length;

    headers = Object.keys(data);
    for (let i = 0; i < arrayLength; i++) {
      const row: Record<string, unknown> = {};
      for (const key of headers) {
        row[key] = data[key][i];
      }
      rows.push(row);
    }
  }

  const renderCellValue = (value: unknown) => {
    if (renderCell) {
      return renderCell(value);
    }
    return value?.toString() ?? "";
  };

  const renderNormalTable = () => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell>index</StyledTableCell>
          {headers?.map((header) => (
            <StyledTableCell key={header}>{header}</StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows?.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            <>
              <StyledTableCell key={rowIndex}>{rowIndex + 1}</StyledTableCell>
              {headers?.map((header) => (
                <StyledTableCell key={header}>
                  {renderCellValue(row[header])}
                </StyledTableCell>
              ))}
            </>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderTransposedTable = () => (
    <Table size="small">
      <TableHead>
        <TableRow>
          <StyledTableCell>index</StyledTableCell>
          {rows.map((_, index) => (
            <StyledTableCell key={index}>{index + 1}</StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {headers?.map((header) => (
          <TableRow key={header}>
            <StyledTableCell component="th" scope="row">
              {header}
            </StyledTableCell>
            {rows.map((row, index) => (
              <StyledTableCell key={index}>
                {renderCellValue(row[header])}
              </StyledTableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Box>
      <FormControlLabel
        control={
          <Switch
            checked={isTransposed}
            onChange={(e) => setIsTransposed(e.target.checked)}
          />
        }
        label="Transpose Table"
      />
      <TableContainer component={Paper}>
        {isTransposed ? renderTransposedTable() : renderNormalTable()}
      </TableContainer>
    </Box>
  );
};

export default JsonTable;
