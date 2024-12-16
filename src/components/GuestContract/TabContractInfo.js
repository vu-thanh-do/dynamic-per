import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ContractInfo from "./GuestContractInfo";
import { createTheme } from "@mui/material/styles";
import PaymentHistoryTable from "./PaymentHistoryTable";

const theme = createTheme({
  palette: {
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      main: "#ffc107",
    },
  },
});

function TabContractInfo() {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <section
      className="section section-divider white account-section pt-5"
      id="blog"
    >
      <div className="container" style={{ marginTop: "120px" }}>
        <div className="text-center mb-2 fw-bold">
          <h1>Thông tin chi tiết hợp đồng</h1>
        </div>
        <Box>
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="g"
            indicatorColor="a"
            sx={{
              ".MuiButtonBase-root": {
                fontSize: "14px",
                fontWeight: 550,
                // color: "var(--deep-saffron)"
              },
              ".Mui-selected ": {
                fontSize: "14px",
                fontWeight: 550,
                color: "var(--deep-saffron)",
                backgroundColor: "hsl(32, 100%, 59%, 0.1)",
              },
              ".MuiTabs-indicator": { backgroundColor: "var(--deep-saffron)" },
            }}
          >
            <Tab label="Thông tin hợp đồng" />
            <Tab label="Lịch sử thanh toán" />
          </Tabs>
          {value === 0 && (
            <Box>
              <ContractInfo />
            </Box>
          )}
          {value === 1 && (
            <Box>
              <PaymentHistoryTable />
            </Box>
          )}
        </Box>
      </div>
    </section>
  );
}

export default TabContractInfo;
