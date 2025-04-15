import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { Message } from "./types";
import IntermediateStepsDisplay from "./IntermediateStepsDisplay";
import { MarkdownViewer } from "../MarkdownViewer";

export interface MessageWithStepsProps {
  message: Message;
}

export const MessageWithSteps: React.FC<MessageWithStepsProps> = ({
  message,
}) => {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
          {message.role === "user"
            ? "You"
            : message.role === "assistant"
            ? "Assistant"
            : `Function: ${message.name}`}
        </Typography>
      </Box>

      {message.intermediateSteps && message.intermediateSteps.length > 0 && (
        <IntermediateStepsDisplay
          steps={message.intermediateSteps}
          isProcessing={false}
        />
      )}

      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: "100%",
          backgroundColor:
            message.role === "user" ? "#eaeaea" : "background.paper",
          display: "flex",
          alignItems: "center",
          boxShadow: "none",
        }}
      >
        <Box mt={1}>
          <MarkdownViewer markdown={message.content} />
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageWithSteps;
