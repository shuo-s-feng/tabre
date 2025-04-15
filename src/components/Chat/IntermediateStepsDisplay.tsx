import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { IntermediateStep } from "./types";
import ProcessingStep from "./ProcessingStep";

const MAX_TOOLTIP_TEXT_LENGTH = 100;

export interface IntermediateStepsDisplayProps {
  steps: IntermediateStep[];
  isProcessing: boolean;
}

export const IntermediateStepsDisplay: React.FC<
  IntermediateStepsDisplayProps
> = ({ steps, isProcessing = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (steps.length === 0) return null;

  const latestStep = steps[steps.length - 1];

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: "100%",
        backgroundColor: "background.paper",
        position: "relative",
        overflow: "hidden",
        boxShadow: "none",
        mb: 2,
      }}
    >
      <Collapse in={isExpanded}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
          }}
        >
          {steps.slice(0, -1).map((step, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                pl: 4,
                height: 34,
                borderLeft: "2px solid",
                borderColor: "divider",
              }}
            >
              {step.content.length > MAX_TOOLTIP_TEXT_LENGTH ? (
                <Tooltip
                  title={step.content}
                  placement="bottom-end"
                  arrow
                  PopperProps={{
                    sx: {
                      "& .MuiTooltip-tooltip": {
                        maxWidth: "60vw",
                        marginBottom: 5,
                      },
                    },
                  }}
                >
                  <Typography variant="body2" color={"text.secondary"}>
                    {step.content.slice(0, MAX_TOOLTIP_TEXT_LENGTH) + "..."}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" color={"text.secondary"}>
                  {step.content}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Collapse>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeft: "2px solid",
          borderColor: "divider",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingLeft: 2,
            maxWidth: "calc(100% - 34px)",
          }}
        >
          {isProcessing ? (
            <ProcessingStep content={latestStep.content} />
          ) : latestStep.content.length > MAX_TOOLTIP_TEXT_LENGTH ? (
            <Tooltip
              title={latestStep.content}
              placement="bottom-end"
              arrow
              PopperProps={{
                sx: {
                  "& .MuiTooltip-tooltip": {
                    maxWidth: "60vw",
                  },
                },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ paddingLeft: 2 }}
              >
                {latestStep.content.slice(0, MAX_TOOLTIP_TEXT_LENGTH) + "..."}
              </Typography>
            </Tooltip>
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ paddingLeft: 2 }}
            >
              {latestStep.content}
            </Typography>
          )}
        </Box>

        <IconButton
          size="small"
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{ flexShrink: 0 }}
        >
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default IntermediateStepsDisplay;
