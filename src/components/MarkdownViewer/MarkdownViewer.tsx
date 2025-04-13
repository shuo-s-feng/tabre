import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import stringWidth from "string-width";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

export interface MarkdownViewerProps {
  markdown: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ markdown }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[[remarkGfm, { stringLength: stringWidth }], remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ children }) => (
          <Typography component="p" sx={{ mb: 1 }}>
            {children}
          </Typography>
        ),
        h1: ({ children }) => (
          <Typography variant="h2" sx={{ pt: 3, mb: 1 }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="h3" sx={{ pt: 3, mb: 1 }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="h4" sx={{ pt: 3, mb: 1 }}>
            {children}
          </Typography>
        ),
        ul: ({ children }) => (
          <Box component="ul" sx={{ mb: 1, pl: 3.5 }}>
            {children}
          </Box>
        ),
        ol: ({ children }) => (
          <Box component="ol" sx={{ mb: 1, pl: 3.5 }}>
            {children}
          </Box>
        ),
        li: ({ children }) => (
          <Box component="li" sx={{ mb: 0.5 }}>
            {children}
          </Box>
        ),
        code: ({ children }) => (
          <Box
            component="code"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              padding: "0.2em 0.4em",
              borderRadius: "3px",
              fontFamily: "monospace",
            }}
          >
            {children}
          </Box>
        ),
        pre: ({ children }) => (
          <Box
            component="pre"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              padding: "1em",
              borderRadius: "4px",
              overflow: "auto",
              mb: 1,
            }}
          >
            {children}
          </Box>
        ),
        blockquote: ({ children }) => (
          <Box
            component="blockquote"
            sx={{
              borderLeft: "4px solid",
              borderColor: "primary.main",
              pl: 2,
              my: 1,
              fontStyle: "italic",
            }}
          >
            {children}
          </Box>
        ),
        table: ({ children }) => (
          <Box sx={{ width: "100%", pt: 1 }}>
            <Box
              component="table"
              sx={{
                width: "100%",
                tableLayout: "fixed",
                borderCollapse: "collapse",
                mb: 2,
                pt: 1,
                "& th, & td": {
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.5,
                  textAlign: "left",
                  verticalAlign: "top",
                  overflow: "hidden",
                },
                "& th": {
                  backgroundColor: "action.hover",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                },
                "& tr:nth-of-type(even)": {
                  backgroundColor: "action.hover",
                },
                "& tr:hover": {
                  backgroundColor: "action.selected",
                },
                "& td": {
                  wordBreak: "break-word",
                },
              }}
            >
              {children}
            </Box>
          </Box>
        ),
        thead: ({ children }) => <Box component="thead">{children}</Box>,
        tbody: ({ children }) => <Box component="tbody">{children}</Box>,
        tr: ({ children }) => <Box component="tr">{children}</Box>,
        th: ({ children }) => (
          <Box
            component="th"
            sx={{
              display: "table-cell",
              width: "auto",
              minWidth: "100px",
            }}
          >
            {children}
          </Box>
        ),
        td: ({ children }) => (
          <Box
            component="td"
            sx={{
              display: "table-cell",
              width: "auto",
              minWidth: "100px",
            }}
          >
            {children}
          </Box>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  );
};

export default MarkdownViewer;
