import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTableCell = styled(TableCell)({
  minWidth: 100,
  maxWidth: 300,
  whiteSpace: "wrap",
  wordWrap: "break-word",
});

export interface KeyValueTableViewProps {
  data: Record<string, unknown>;
  renderCell?: (value: unknown) => React.ReactNode;
}

export const KeyValueTableView: React.FC<KeyValueTableViewProps> = ({
  data,
  renderCell,
}) => {
  const renderCellValue = (value: unknown) => {
    if (renderCell) {
      return renderCell(value);
    }
    return value?.toString() ?? "";
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <StyledTableCell>Key</StyledTableCell>
            <StyledTableCell>Value</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.entries(data).map(([key, value]) => (
            <TableRow key={key}>
              <StyledTableCell component="th" scope="row">
                {key}
              </StyledTableCell>
              <StyledTableCell>{renderCellValue(value)}</StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default KeyValueTableView;
