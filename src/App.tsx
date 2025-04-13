import { Grid } from "@mui/material";
import { ApiRunner } from "./components/ApiRunner";
import { TabsContent } from "./components/TabsContent";
import { Chat } from "./components/Chat";
import useLocalStorage from "./hooks/useLocalStorage";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useLocalStorage("mainActiveTab", 0);
  return (
    <Grid
      container
      flexDirection="column"
      alignItems="center"
      height="100vh"
      width="100vw"
      overflow="visible"
      padding={10}
    >
      <TabsContent
        tabs={[
          {
            label: "Playground",
            content: <ApiRunner />,
          },
          {
            label: "Chat",
            content: <Chat />,
          },
        ]}
        initialTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Grid>
  );
};

export default App;
