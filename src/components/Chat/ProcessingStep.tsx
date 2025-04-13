import React from "react";
import { Box, Typography, keyframes } from "@mui/material";

const shineAnimation = keyframes`
  0% {
    background-position: 200% center;
  }
  100% {
    background-position: -200% center;
  }
`;

export interface ProcessingStepProps {
  content: string;
}

export const ProcessingStep: React.FC<ProcessingStepProps> = ({ content }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      width: "100%",
      height: 24,
      display: "flex",
      alignItems: "center",
      paddingLeft: 2,
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "linear-gradient(-90deg, transparent, rgba(255,255,255,0.8), transparent) 0% 0% / 200% 100%",
        animation: `${shineAnimation} 2s linear infinite`,
      },
    }}
  >
    <Typography variant="body2">{content}</Typography>
  </Box>
);

export default ProcessingStep;
