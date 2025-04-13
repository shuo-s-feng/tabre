import { createTheme } from "@mui/material";
import { createMakeAndWithStyles } from "tss-react";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

export enum PrimaryColor {
  Light = "#757575",
  Main = "#191919",
  LightDark = "rgba(0,0,0,0.30)",
  Dark = "rgba(0,0,0,0.87)",
}

export const theme = createTheme({
  typography: {
    h1: {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    h2: {
      fontSize: 20,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    h3: {
      fontSize: 16,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    h4: {
      fontSize: 14,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    h5: {
      fontSize: 13,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    h6: {
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    subtitle1: {
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    body1: {
      fontSize: 14,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    body2: {
      fontSize: 12,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
    caption: {
      fontSize: 12,
      fontWeight: 300,
      fontFamily: "Helvetica, Arial, sans-serif",
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          cursor: "pointer",
          color: PrimaryColor.Main,
          textDecorationColor: PrimaryColor.Main,
          "&:hover": {
            color: PrimaryColor.Light,
          },
        },
      },
    },
    MuiButton: {
      // For some reasons, the ripple effect is not working with the default props
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none", // To avoid uppercase text transformation
          backgroundColor: "transparent",
        },
        containedPrimary: {
          backgroundColor: "#191919", // Primary button background color
          color: "#ffffff", // White text color for contrast
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.6)", // Hover background
          },
        },
        outlinedPrimary: {
          color: "#191919", // Text color for outlined button
          borderColor: "#757575", // Outline color for outlined button
          "&:hover": {
            borderColor: "rgba(0, 0, 0, 0.8)", // Darker border color on hover
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Subtle background on hover for outlined button
          },
        },
        textPrimary: {
          color: "#191919", // Text color for text button
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Light background on hover for text button
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          height: 36.5,
        },
      },
    },
  },
  palette: {
    primary: {
      light: "#757575", // Light shade of primary color
      main: "#191919", // Main primary color
      dark: "rgba(0,0,0,0.87)", // Dark shade of primary color
      contrastText: "#ffffff", // White text for contrast on dark backgrounds
    },
    background: {
      default: "#f5f5f5", // Standard light gray background
      paper: "#ffffff", // White background for Paper components
    },
    text: {
      primary: "#191919", // Main text color based on primary
      secondary: "#757575", // Secondary text color for less emphasis
      disabled: "rgba(0, 0, 0, 0.38)", // Disabled text color
    },
    divider: "rgba(0, 0, 0, 0.12)", // Divider lines color
    action: {
      active: "#191919", // Active icon color
      hover: "rgba(25, 25, 25, 0.04)", // Hover background color for buttons
      selected: "rgba(25, 25, 25, 0.08)", // Selected item background color
      disabled: "rgba(0, 0, 0, 0.26)", // Disabled button background
      disabledBackground: "rgba(0, 0, 0, 0.12)", // Disabled background color
    },
  },
  spacing: 4,
});

export const { makeStyles, useStyles } = createMakeAndWithStyles({
  useTheme: () => theme,
});

export default theme;
