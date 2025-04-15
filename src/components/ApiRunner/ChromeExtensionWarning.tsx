import { Alert, Button, Typography } from "@mui/material";
import { makeStyles } from "../../utils/theme";

const useStyles = makeStyles()((theme) => ({
  alert: {
    marginBottom: theme.spacing(3),
  },
  button: {
    marginTop: theme.spacing(2),
  },
}));

export interface ChromeExtensionWarningProps {
  className?: string;
  url?: string;
}

export const ChromeExtensionWarning: React.FC<ChromeExtensionWarningProps> = ({
  className,
  url,
}) => {
  const { cx, classes } = useStyles();

  return (
    <Alert
      severity="warning"
      className={cx(classes.alert, className)}
      action={
        <Button
          variant="contained"
          size="small"
          href="https://chromewebstore.google.com/detail/tabre-tab-request/gbjmofioeokcjcpmdpcpoelpkljihdjg"
          target="_blank"
          rel="noopener noreferrer"
        >
          Install Extension
        </Button>
      }
    >
      <Typography variant="body1">
        To make requests on behalf of your browser tabs, you need to install the
        Tabre Chrome extension.
      </Typography>
      {url && (
        <Typography variant="body1" sx={{ mt: 1 }}>
          This is required for tabs matching: {url}
        </Typography>
      )}
    </Alert>
  );
};

export default ChromeExtensionWarning;
