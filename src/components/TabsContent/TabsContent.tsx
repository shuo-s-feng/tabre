import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { TabItem } from "./types";

export interface TabsContentProps {
  tabs: TabItem[];
  initialTab?: number;
  className?: string;
  onTabChange?: (tab: number) => void;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  tabs,
  initialTab,
  className,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab ?? 0);
  const tab = tabs[activeTab];

  return (
    <Box
      sx={{ width: "100%", height: "100%", maxWidth: 1200 }}
      className={className}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", marginBottom: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_event: React.SyntheticEvent, newValue: number) => {
            setActiveTab(newValue);
            onTabChange?.(newValue);
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.label} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {tab && (
        <Box key={tab.label} sx={{ pt: 2, mb: 5 }}>
          {tab.content}
        </Box>
      )}
    </Box>
  );
};

export default TabsContent;
